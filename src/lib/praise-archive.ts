import { getSupabaseAdmin, isSupabaseAdminConfigured } from '@/lib/supabase/admin';

export type PraiseVideo = {
  id: string;
  praiseDate: string; // YYYY-MM-DD
  title: string;
  youtubeUrl: string;
  youtubeId: string | null;
  lyrics: string | null;
  createdAt: string;
};

type PraiseVideoRow = {
  id: string;
  praise_date: string;
  title: string;
  youtube_url: string;
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

function toPraiseVideo(row: PraiseVideoRow): PraiseVideo {
  return {
    id: row.id,
    praiseDate: row.praise_date,
    title: row.title,
    youtubeUrl: row.youtube_url,
    youtubeId: extractYoutubeId(row.youtube_url),
    lyrics: row.lyrics,
    createdAt: row.created_at,
  };
}

export async function getPraiseVideos(): Promise<PraiseVideo[]> {
  if (!isSupabaseAdminConfigured()) return [];
  const supabase = getSupabaseAdmin();
  
  const { data, error } = await supabase
    .from('praise_videos')
    .select('id, praise_date, title, youtube_url, lyrics, created_at')
    .order('praise_date', { ascending: false });

  if (error) {
    console.error('Failed to fetch praise videos:', error);
    throw new Error(`Praise videos fetch failed: ${error.message}`);
  }

  return (data as PraiseVideoRow[]).map(toPraiseVideo);
}

export async function createPraiseVideo(value: {
  praiseDate: string;
  title: string;
  youtubeUrl: string;
  lyrics?: string;
}) {
  const supabase = getSupabaseAdmin();
  const id = crypto.randomUUID();

  const { data, error } = await supabase
    .from('praise_videos')
    .insert({
      id,
      praise_date: value.praiseDate,
      title: value.title,
      youtube_url: value.youtubeUrl,
      lyrics: value.lyrics || null,
    })
    .select('id')
    .single();

  if (error) {
    console.error('Failed to create praise video:', error);
    throw new Error(`Praise video creation failed: ${error.message}`);
  }

  // Audit Log
  await supabase.from('admin_audit_logs').insert({
    action: 'create',
    entity_table: 'praise_videos',
    entity_id: id,
    metadata: { title: value.title, praise_date: value.praiseDate },
  });

  return data;
}

export async function updatePraiseVideo(
  id: string,
  value: {
    praiseDate: string;
    title: string;
    youtubeUrl: string;
    lyrics?: string;
  }
) {
  const supabase = getSupabaseAdmin();

  const { data, error } = await supabase
    .from('praise_videos')
    .update({
      praise_date: value.praiseDate,
      title: value.title,
      youtube_url: value.youtubeUrl,
      lyrics: value.lyrics || null,
    })
    .eq('id', id)
    .select('id')
    .single();

  if (error) {
    console.error('Failed to update praise video:', error);
    throw new Error(`Praise video update failed: ${error.message}`);
  }

  // Audit Log
  await supabase.from('admin_audit_logs').insert({
    action: 'update',
    entity_table: 'praise_videos',
    entity_id: id,
    metadata: { title: value.title, praise_date: value.praiseDate },
  });

  return data;
}

export async function deletePraiseVideo(id: string) {
  const supabase = getSupabaseAdmin();

  // Retrieve title for audit logs
  const { data: item } = await supabase
    .from('praise_videos')
    .select('title, praise_date')
    .eq('id', id)
    .single();

  const { error } = await supabase
    .from('praise_videos')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Failed to delete praise video:', error);
    throw new Error(`Praise video deletion failed: ${error.message}`);
  }

  // Audit Log
  if (item) {
    await supabase.from('admin_audit_logs').insert({
      action: 'delete',
      entity_table: 'praise_videos',
      entity_id: id,
      metadata: { title: item.title, praise_date: item.praise_date },
    });
  }
}
