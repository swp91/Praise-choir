import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { extensionFromContentType, storagePathForAsset } from './media-migration-utils.mjs';

function loadEnvFile(path) {
  try {
    const content = readFileSync(path, 'utf8');
    for (const line of content.split(/\r?\n/)) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const index = trimmed.indexOf('=');
      if (index === -1) continue;

      const key = trimmed.slice(0, index).trim();
      const value = trimmed.slice(index + 1).trim().replace(/^['"]|['"]$/g, '');
      if (!process.env[key]) process.env[key] = value;
    }
  } catch {
    // Env file is optional; CI/Vercel can provide variables directly.
  }
}

function hasArg(name) {
  return process.argv.includes(name);
}

function valueArg(name) {
  const index = process.argv.indexOf(name);
  if (index === -1) return null;
  return process.argv[index + 1] ?? null;
}

async function main() {
  loadEnvFile(resolve(process.cwd(), '.env.local'));

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const dryRun = hasArg('--dry-run');
  const limit = Number(valueArg('--limit') ?? 0);

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error('NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required.');
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });

  let query = supabase
    .from('media_assets')
    .select('id, legacy_key, external_url, bucket, path, source')
    .like('external_url', 'https://res.cloudinary.com/%')
    .neq('source', 'supabase')
    .order('legacy_key');

  if (limit > 0) query = query.limit(limit);

  const { data: assets, error } = await query;
  if (error) throw new Error(`Failed to load media assets: ${error.message}`);

  if (!assets?.length) {
    console.log('No Cloudinary media assets found.');
    return;
  }

  console.log(`${dryRun ? 'Dry run:' : 'Migrating'} ${assets.length} Cloudinary media assets.`);

  let migrated = 0;
  let failed = 0;

  for (const asset of assets) {
    try {
      const response = await fetch(asset.external_url);
      if (!response.ok) {
        throw new Error(`download failed ${response.status} ${response.statusText}`);
      }

      const contentType = response.headers.get('content-type') ?? 'image/jpeg';
      const bytes = new Uint8Array(await response.arrayBuffer());
      const path = storagePathForAsset(asset, contentType);
      const extension = extensionFromContentType(contentType);

      console.log(`${asset.legacy_key ?? asset.id} -> public-media/${path} (${contentType}, ${bytes.byteLength} bytes)`);

      if (dryRun) continue;

      const upload = await supabase.storage
        .from('public-media')
        .upload(path, bytes, {
          contentType,
          cacheControl: '31536000',
          upsert: true,
        });

      if (upload.error) throw new Error(`upload failed: ${upload.error.message}`);

      const update = await supabase
        .from('media_assets')
        .update({
          bucket: 'public-media',
          path,
          source: 'supabase',
          mime_type: contentType.split(';')[0],
          size_bytes: bytes.byteLength,
          metadata: {
            migrated_from: 'cloudinary',
            original_bucket: asset.bucket,
            original_path: asset.path,
            storage_extension: extension,
          },
        })
        .eq('id', asset.id);

      if (update.error) throw new Error(`database update failed: ${update.error.message}`);
      migrated += 1;
    } catch (error) {
      failed += 1;
      console.error(`Failed ${asset.legacy_key ?? asset.id}: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  console.log(`Done. migrated=${migrated}, failed=${failed}, dryRun=${dryRun}`);
  if (failed > 0) process.exitCode = 1;
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
