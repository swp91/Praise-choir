import type { Photo } from './types';

export const PHOTOS: Photo[] = [
  { title: '제26회 광진찬양제 대상', date: '2025.11', album: 'festival', size: 'feature', palette: ['#7a5a2a', '#b89a5a', '#fff5dc'], motif: '大賞' },
  { title: '2025 성탄절 칸타타',    date: '2025.12', album: 'cantata',  palette: ['#3a2e1f', '#8b6914', '#e0c997'], motif: 'Christmas' },
  { title: '예배 전 새벽 연습',     date: '2025.04', album: 'practice', palette: ['#5a4a30', '#b89a5a', '#fdf9f0'], motif: 'Dawn' },
  { title: '2025 성탄절 예배',      date: '2025.12', album: 'cantata',  palette: ['#2d2418', '#a8843c', '#faf2dd'], motif: 'Service' },
  { title: '제73회 새벽특별집회',   date: '2025.09', album: 'revival',  palette: ['#4a3a20', '#b08a4a', '#fff5dc'], motif: 'Revival' },
  { title: '야유회 · 마장호수',     date: '2025.06', album: 'outing',   palette: ['#3d4f3a', '#b89a5a', '#f0e6d2'], motif: 'Lake' },
  { title: '제72회 새벽특별집회',   date: '2025.04', album: 'revival',  palette: ['#5a4a30', '#a8843c', '#faf5ea'], motif: 'Daybreak' },
  { title: '벽초지 수목원 야유회',  date: '2025.06', album: 'outing',   palette: ['#355241', '#b89a5a', '#f0e6d2'], motif: 'Garden' },
  { title: '항존직 임직 예배',      date: '2025.02', album: 'cantata',  palette: ['#3a2e1f', '#8b6914', '#e8dab8'], motif: 'Anointing' },
  { title: '소프라노 파트 연습',    date: '2025.10', album: 'practice', palette: ['#4a3a20', '#b89a5a', '#fff5dc'], motif: 'Soprano' },
  { title: '하기오스 악단 합주',    date: '2025.11', album: 'practice', size: 'feature', palette: ['#3a2e1f', '#a8843c', '#f0e6d2'], motif: 'Hagios' },
  { title: '성장부흥회 주관',       date: '2025.12', album: 'revival',  palette: ['#2d2418', '#b08a4a', '#faf2dd'], motif: 'Revival' },
  { title: '내영혼이 은총입어 · 본선', date: '2025.11', album: 'festival', palette: ['#5a4a30', '#b89a5a', '#fff5dc'], motif: 'Anthem' },
  { title: '송구영신 예배 준비',    date: '2025.12', album: 'cantata',  palette: ['#2d2418', '#8b6914', '#e0c997'], motif: 'Vigil' },
  { title: '베이스 파트 연습',      date: '2025.09', album: 'practice', palette: ['#3a2e1f', '#a8843c', '#faf5ea'], motif: 'Bass' },
];

export const ALBUMS = [
  { key: 'all',      label: 'All · 전체' },
  { key: 'cantata',  label: 'Cantata · 칸타타' },
  { key: 'festival', label: 'Festival · 찬양제' },
  { key: 'revival',  label: 'Revival · 부흥회' },
  { key: 'outing',   label: 'Outing · 야유회' },
  { key: 'practice', label: 'Practice · 연습' },
] as const;

export type AlbumKey = typeof ALBUMS[number]['key'];
