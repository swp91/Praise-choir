import { getSupabaseAdmin, isSupabaseAdminConfigured } from '@/lib/supabase/admin';

export type WorshipVideo = {
  id: string;
  worshipDate: string; // YYYY-MM-DD
  title: string;
  youtubeUrl: string;
  youtubeId: string | null;
  composer: string | null;
  lyrics: string | null;
  createdAt: string;
};

type WorshipVideoRow = {
  id: string;
  worship_date: string;
  title: string;
  youtube_url: string;
  composer: string | null;
  lyrics: string | null;
  created_at: string;
};

// Helper to extract YouTube Video ID from various URL formats
export function extractYoutubeId(url: string): string | null {
  if (!url) return null;
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  const match = url.match(regExp);
  return match && match[2].length === 11 ? match[2] : null;
}

function toWorshipVideo(row: WorshipVideoRow): WorshipVideo {
  return {
    id: row.id,
    worshipDate: row.worship_date,
    title: row.title,
    youtubeUrl: row.youtube_url,
    youtubeId: extractYoutubeId(row.youtube_url),
    composer: row.composer,
    lyrics: row.lyrics,
    createdAt: row.created_at,
  };
}

export async function getWorshipVideos(): Promise<WorshipVideo[]> {
  if (!isSupabaseAdminConfigured()) return [];
  const supabase = getSupabaseAdmin();
  
  const { data, error } = await supabase
    .from('worship_videos')
    .select('id, worship_date, title, youtube_url, composer, lyrics, created_at')
    .order('worship_date', { ascending: false });

  if (error) {
    console.error('Failed to fetch worship videos:', error);
    throw new Error(`Worship videos fetch failed: ${error.message}`);
  }

  return (data as WorshipVideoRow[]).map(toWorshipVideo);
}

export async function createWorshipVideo(value: {
  worshipDate: string;
  title: string;
  youtubeUrl: string;
  composer?: string;
  lyrics?: string;
}) {
  const supabase = getSupabaseAdmin();
  const id = crypto.randomUUID();

  const { data, error } = await supabase
    .from('worship_videos')
    .insert({
      id,
      worship_date: value.worshipDate,
      title: value.title,
      youtube_url: value.youtubeUrl,
      composer: value.composer || null,
      lyrics: value.lyrics || null,
    })
    .select('id')
    .single();

  if (error) {
    console.error('Failed to create worship video:', error);
    throw new Error(`Worship video creation failed: ${error.message}`);
  }

  // Audit Log
  await supabase.from('admin_audit_logs').insert({
    action: 'create',
    entity_table: 'worship_videos',
    entity_id: id,
    metadata: { title: value.title, worship_date: value.worshipDate },
  });

  return data;
}

export async function updateWorshipVideo(
  id: string,
  value: {
    worshipDate: string;
    title: string;
    youtubeUrl: string;
    composer?: string;
    lyrics?: string;
  }
) {
  const supabase = getSupabaseAdmin();

  const { data, error } = await supabase
    .from('worship_videos')
    .update({
      worship_date: value.worshipDate,
      title: value.title,
      youtube_url: value.youtubeUrl,
      composer: value.composer || null,
      lyrics: value.lyrics || null,
    })
    .eq('id', id)
    .select('id')
    .single();

  if (error) {
    console.error('Failed to update worship video:', error);
    throw new Error(`Worship video update failed: ${error.message}`);
  }

  // Audit Log
  await supabase.from('admin_audit_logs').insert({
    action: 'update',
    entity_table: 'worship_videos',
    entity_id: id,
    metadata: { title: value.title, worship_date: value.worshipDate },
  });

  return data;
}

export async function deleteWorshipVideo(id: string) {
  const supabase = getSupabaseAdmin();

  // Retrieve title for audit logs
  const { data: item } = await supabase
    .from('worship_videos')
    .select('title, worship_date')
    .eq('id', id)
    .single();

  const { error } = await supabase
    .from('worship_videos')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Failed to delete worship video:', error);
    throw new Error(`Worship video deletion failed: ${error.message}`);
  }

  // Audit Log
  if (item) {
    await supabase.from('admin_audit_logs').insert({
      action: 'delete',
      entity_table: 'worship_videos',
      entity_id: id,
      metadata: { title: item.title, worship_date: item.worship_date },
    });
  }
}
