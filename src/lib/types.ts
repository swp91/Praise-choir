export type Member = {
  name: string;
  role?: string;
  birth: string;
  phone: string;
  photo?: string;
};

export type Part = {
  key: string;
  name: string;
  nameEn: string;
  leader?: string;
  members: Member[];
};

export type Conductor = {
  role: string;
  name: string;
  since: string;
  birth: string;
  phone: string;
  note?: string;
  photo?: string;
};

export type Officer = {
  role: string;
  name: string;
  part: string;
};

export type ChoirEvent = {
  when: string;
  title: string;
  detail?: string;
  highlight?: boolean;
};

export type PracticeSlot = {
  tag: '예배' | '연습';
  label: string;
  time: string;
};

export type Photo = {
  title: string;
  date: string;
  album: 'cantata' | 'festival' | 'revival' | 'outing' | 'practice';
  size?: 'feature';
  palette: [string, string, string];
  motif: string;
};
