import { supabase } from './server';
import { formatPublicEventDate, sortPublicEvents } from '@/lib/events-display';
import type { ChoirEvent, Conductor, Member, Officer, Part, Photo, PracticeSlot } from '@/lib/types';

type MediaAsset = {
  id: string;
  bucket: string;
  path: string;
  source: string;
  external_url: string | null;
  legacy_key: string | null;
};

type PersonRow = {
  id: string;
  display_name: string;
  birth_label: string | null;
  birth_is_lunar: boolean;
  phone_label: string | null;
  photo_asset_id: string | null;
  show_birth: boolean;
  show_phone: boolean;
};

type LeadershipAssignmentRow = {
  id: string;
  person_id: string | null;
  group_key: string;
  role_text: string;
  photo_asset_id: string | null;
  external_name: string | null;
};

type AnnualProfileRow = {
  year: number;
  theme_ko: string;
  theme_en: string | null;
  goal_title_ko: string;
  hero_background_asset_id: string | null;
  hero_background_position: string;
};

type GalleryItemRow = {
  id: string;
  title: string;
  date_label: string | null;
  taken_date: string | null;
  is_featured: boolean;
  media_asset_id: string;
  gallery_albums?: { key: string } | { key: string }[] | null;
};

type EventRow = {
  year: number;
  date_label: string | null;
  title: string;
  detail: string | null;
  is_highlight: boolean;
  event_date: string | null;
  month: number | null;
  sort_order: number | null;
  created_at: string | null;
};

const publicStorageBase = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public`;

function mediaUrl(asset?: MediaAsset | null) {
  if (!asset) return undefined;
  if (asset.source === 'supabase' && asset.bucket && asset.path) {
    return `${publicStorageBase}/${asset.bucket}/${asset.path}`;
  }
  return asset.external_url ?? undefined;
}

function birthLabel(person: PersonRow) {
  if (!person.show_birth || !person.birth_label) return '—';
  return person.birth_is_lunar ? `음${person.birth_label}` : person.birth_label;
}

function phoneLabel(person: PersonRow) {
  if (!person.show_phone || !person.phone_label) return '';
  return person.phone_label;
}

function toRoman(value: number) {
  const numerals: [number, string][] = [
    [10, 'X'],
    [9, 'IX'],
    [5, 'V'],
    [4, 'IV'],
    [1, 'I'],
  ];
  let n = value;
  let out = '';
  for (const [amount, label] of numerals) {
    while (n >= amount) {
      out += label;
      n -= amount;
    }
  }
  return out || '0';
}

async function must<T = unknown>(promise: PromiseLike<{ data: T | null; error: unknown }>, label: string): Promise<T> {
  const { data, error } = await promise;
  if (error) throw new Error(`Failed to load ${label}: ${JSON.stringify(error)}`);
  return data as T;
}

export async function getCurrentYear() {
  const settings = await must<{ current_year_override: number | null }>(
    supabase.from('site_settings').select('current_year_override').single(),
    'site settings',
  );

  return settings?.current_year_override ?? new Date().getFullYear();
}

export async function getHomeData() {
  const year = await getCurrentYear();
  const [
    annualProfile,
    peopleCount,
    sectionsCount,
    eventsCount,
    goals,
    featuredRows,
  ] = await Promise.all([
    must<AnnualProfileRow>(
      supabase
        .from('annual_profiles')
        .select('year, theme_ko, theme_en, hero_background_position, hero_background_asset_id')
        .eq('year', year)
        .single(),
      'annual profile',
    ),
    must(
      supabase.from('people').select('id').eq('is_active', true),
      'people count',
    ),
    must(
      supabase.from('sections').select('id').eq('is_active', true).neq('kind', 'other'),
      'sections count',
    ),
    must(
      supabase.from('events').select('id').eq('year', year).eq('is_published', true),
      'events count',
    ),
    must(
      supabase.from('goal_items').select('id, text').eq('year', year).eq('is_active', true).order('sort_order'),
      'goals count',
    ),
    must(
      supabase
        .from('home_featured_people')
        .select('role_label, palette, sort_order, person_id, photo_asset_id')
        .eq('is_active', true)
        .order('sort_order'),
      'home featured people',
    ),
  ]);

  const personIds = featuredRows.map((row) => row.person_id).filter(Boolean);

  const [people, media] = await Promise.all([
    personIds.length
      ? must(supabase.from('people').select('*').in('id', personIds), 'featured people')
      : Promise.resolve([] as PersonRow[]),
    must(supabase.from('media_assets').select('*'), 'media assets'),
  ]);

  const peopleById = new Map(people.map((person) => [person.id, person]));
  const mediaById = new Map(media.map((asset: MediaAsset) => [asset.id, asset]));

  return {
    year,
    themeKo: annualProfile.theme_ko,
    themeEn: annualProfile.theme_en,
    heroBackgroundUrl: mediaUrl(mediaById.get(annualProfile.hero_background_asset_id ?? '')) ?? '/praise_photo.png',
    heroBackgroundPosition: annualProfile.hero_background_position,
    goalsList: (goals as { text: string }[]).map((g) => g.text),
    stats: {
      people: peopleCount.length,
      sections: sectionsCount.length,
      events: eventsCount.length,
      goals: goals.length,
      goalsRoman: toRoman(goals.length),
    },
    featured: featuredRows.map((row) => {
      const person = peopleById.get(row.person_id);
      return {
        name: person?.display_name ?? '',
        roleKo: row.role_label,
        photo: mediaUrl(mediaById.get(row.photo_asset_id ?? '') ?? mediaById.get(person?.photo_asset_id ?? '')),
        palette: row.palette as [string, string, string],
      };
    }),
  };
}

export async function getMembersData(): Promise<Part[]> {
  const [sections, memberships, people, media] = await Promise.all([
    must(supabase.from('sections').select('*').eq('is_active', true).order('sort_order'), 'sections'),
    must(supabase.from('section_memberships').select('*').eq('is_active', true).order('sort_order'), 'memberships'),
    must(supabase.from('people').select('*').eq('is_active', true), 'people'),
    must(supabase.from('media_assets').select('*'), 'media assets'),
  ]);

  const peopleById = new Map((people as PersonRow[]).map((person) => [person.id, person]));
  const mediaById = new Map((media as MediaAsset[]).map((asset) => [asset.id, asset]));

  return sections.map((section: { id: string; key: string; name_ko: string; name_en: string | null }) => {
    const members = memberships
      .filter((membership: { section_id: string }) => membership.section_id === section.id)
      .map((membership: { person_id: string; role_text: string | null; sort_order: number }) => {
        const person = peopleById.get(membership.person_id);
        return {
          name: person?.display_name ?? '',
          role: membership.role_text ?? '',
          birth: person ? birthLabel(person) : '—',
          phone: person ? phoneLabel(person) : '',
          photo: mediaUrl(mediaById.get(person?.photo_asset_id ?? '')),
        } satisfies Member;
      });

    const leader = members.find((member) => member.role === '파트장' || member.role === '악단장')?.name ?? '';

    return {
      key: section.key,
      name: section.name_ko,
      nameEn: section.name_en ?? '',
      leader,
      members,
    };
  });
}

export async function getLeadersData() {
  const [assignments, sections, memberships, people, media] = await Promise.all([
    must(
      supabase
        .from('leadership_assignments')
        .select('*')
        .eq('is_active', true)
        .order('sort_order'),
      'leadership assignments',
    ),
    must(supabase.from('sections').select('id,key,name_ko').eq('is_active', true), 'sections'),
    must(supabase.from('section_memberships').select('*').eq('is_active', true).order('sort_order'), 'memberships'),
    must(supabase.from('people').select('*').eq('is_active', true), 'people'),
    must(supabase.from('media_assets').select('*'), 'media assets'),
  ]);

  const peopleById = new Map((people as PersonRow[]).map((person) => [person.id, person]));
  const mediaById = new Map((media as MediaAsset[]).map((asset) => [asset.id, asset]));
  const sectionById = new Map((sections as { id: string; key: string; name_ko: string }[]).map((s) => [s.id, s]));
  const membershipByPersonId = new Map(
    (memberships as { person_id: string; section_id: string; is_active: boolean }[])
      .filter((m) => m.is_active !== false)
      .map((m) => [m.person_id, m])
  );
  const staffSection = sections.find((section) => section.key === 'staff');

  const conductors: Conductor[] = staffSection
    ? memberships
        .filter((membership: { section_id: string }) => membership.section_id === staffSection.id)
        .flatMap((membership: { person_id: string; role_text: string | null }) => {
          const person = peopleById.get(membership.person_id);
          if (!person) return [];
          return [{
            role: membership.role_text ?? '',
            name: person.display_name,
            since: '—',
            birth: birthLabel(person),
            phone: phoneLabel(person),
            note: '',
            photo: mediaUrl(mediaById.get(person.photo_asset_id ?? '')),
          } satisfies Conductor];
        })
    : [];
  const officers: Officer[] = [];

  for (const assignment of assignments as LeadershipAssignmentRow[]) {
    const person = assignment.person_id ? peopleById.get(assignment.person_id) : undefined;
    const displayName = assignment.external_name ?? person?.display_name;
    if (!displayName) continue;
    const photo = mediaUrl(mediaById.get(assignment.photo_asset_id ?? '') ?? mediaById.get(person?.photo_asset_id ?? ''));

    if (assignment.group_key === 'officers') {
      if (!person) continue;
      const membership = membershipByPersonId.get(person.id);
      const section = membership ? sectionById.get(membership.section_id) : undefined;
      const part = section ? section.name_ko : '';
      officers.push({
        role: assignment.role_text,
        name: displayName,
        part,
        photo,
      });
    }
  }

  return { conductors, officers };
}

export async function getPracticeData() {
  const year = await getCurrentYear();
  const [profile, practice, goals] = await Promise.all([
    must<AnnualProfileRow>(supabase.from('annual_profiles').select('*').eq('year', year).single(), 'annual profile'),
    must(supabase.from('practice_slots').select('*').eq('is_active', true).order('sort_order'), 'practice slots'),
    must(supabase.from('goal_items').select('*').eq('year', year).eq('is_active', true).order('sort_order'), 'goal items'),
  ]);

  return {
    year,
    themeKo: profile.theme_ko,
    themeEn: profile.theme_en,
    goalTitleKo: profile.goal_title_ko as string,
    practice: practice.map((slot) => ({
      label: slot.label,
      time: slot.time_text,
      tag: slot.tag,
    })) as PracticeSlot[],
    goals: goals.map((goal) => goal.text as string),
  };
}

export async function getEventsData() {
  const currentYear = await getCurrentYear();
  const yearRows = await must<{ year: number; display_type: string }[]>(
    supabase
      .from('event_years')
      .select('year,display_type')
      .eq('is_active', true)
      .order('year', { ascending: false }),
    'event years',
  );
  // 일정(schedule) 우선, 보고(report) 나중 → 연도 내림차순
  const sorted = [...yearRows].sort((a, b) => {
    const typeOrder = (t: string) => (t === 'schedule' ? 0 : 1);
    const typeDiff = typeOrder(a.display_type) - typeOrder(b.display_type);
    if (typeDiff !== 0) return typeDiff;
    return b.year - a.year;
  });

  const activeYears = sorted.map((row) => row.year);
  const finalYearsList = sorted.length > 0 ? sorted : [{ year: currentYear, display_type: 'schedule' }];
  const queryYears = activeYears.length > 0 ? activeYears : [currentYear];

  const events = await must(
    supabase
      .from('events')
      .select('*')
      .in('year', queryYears)
      .eq('is_published', true)
      .order('year', { ascending: false })
      .order('sort_order'),
    'events',
  );

  const toEvent = (event: EventRow) =>
    ({
      year: event.year,
      when: formatPublicEventDate({
        eventDate: event.event_date,
        month: event.month,
        dateLabel: event.date_label,
      }),
      title: event.title,
      detail: event.detail ?? undefined,
      highlight: event.is_highlight,
      eventDate: event.event_date ?? undefined,
      month: event.month ?? undefined,
    }) satisfies ChoirEvent;

  const processedEvents = sortPublicEvents(
    events.map((event) => ({
      ...event,
      eventDate: event.event_date,
      dateLabel: event.date_label,
      sortOrder: event.sort_order ?? 0,
      createdAt: event.created_at,
    }))
  ).map((e) => toEvent(e as EventRow));

  return {
    yearsList: finalYearsList,
    allEvents: processedEvents,
  };
}

export async function getGalleryData(): Promise<Photo[]> {
  const items = await must<GalleryItemRow[]>(
    supabase
      .from('gallery_items')
      .select('id, title, date_label, taken_date, is_featured, media_asset_id, gallery_albums(key)')
      .eq('is_published', true)
      .order('sort_order'),
    'gallery items',
  );

  if (!items.length) return [];

  const media = await must(
    supabase.from('media_assets').select('*').in('id', items.map((item) => item.media_asset_id)),
    'gallery media',
  );
  const mediaById = new Map((media as MediaAsset[]).map((asset) => [asset.id, asset]));

  return items.map((item) => ({
    id: item.id,
    title: item.title,
    date: item.date_label ?? item.taken_date ?? '',
    album: ((Array.isArray(item.gallery_albums) ? item.gallery_albums[0]?.key : item.gallery_albums?.key) ?? 'practice') as Photo['album'],
    size: item.is_featured ? 'feature' : undefined,
    palette: ['#3a2e1f', '#a8843c', '#f0e6d2'],
    motif: 'Praise',
    url: mediaUrl(mediaById.get(item.media_asset_id)),
    downloadUrl: `/gallery/download/${item.id}`,
  }));
}
