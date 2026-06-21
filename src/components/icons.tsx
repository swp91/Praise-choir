const iconCls = 'w-5 h-5 stroke-current fill-none [stroke-width:1.5] [stroke-linecap:round] [stroke-linejoin:round]';
const base = { viewBox: '0 0 24 24', xmlns: 'http://www.w3.org/2000/svg', className: iconCls, 'aria-hidden': true as const };

export const HomeIcon = () => (
  <svg {...base}>
    <path d="M3 11l9-7 9 7v9a1 1 0 01-1 1h-5v-7h-6v7H4a1 1 0 01-1-1z" />
  </svg>
);

export const UsersIcon = () => (
  <svg {...base}>
    <circle cx="9" cy="8" r="3.2" />
    <path d="M3 19c.5-3.4 3-5 6-5s5.5 1.6 6 5" />
    <circle cx="17" cy="8" r="2.6" />
    <path d="M14.5 14.5c2.7-.6 5.5.6 6.5 4.5" />
  </svg>
);

export const StarIcon = () => (
  <svg {...base}>
    <path d="M12 3l2.5 5.6 6 .7-4.5 4.2 1.2 6-5.2-3-5.2 3 1.2-6L3.5 9.3l6-.7z" />
  </svg>
);

export const ClockIcon = () => (
  <svg {...base}>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 7v5l3.5 2" />
  </svg>
);

export const CalendarIcon = () => (
  <svg {...base}>
    <rect x="3.5" y="5" width="17" height="16" rx="1.5" />
    <path d="M3.5 10h17M8 3v4M16 3v4" />
  </svg>
);

export const ImageIcon = () => (
  <svg {...base}>
    <rect x="3.5" y="4.5" width="17" height="15" rx="1.5" />
    <circle cx="9" cy="10" r="1.6" />
    <path d="M5 18l4.5-5 3.5 3.5L17 12l3 4" />
  </svg>
);

export const MusicIcon = () => (
  <svg {...base}>
    <path d="M9 18V5l12-2v13" />
    <circle cx="6" cy="18" r="3" />
    <circle cx="18" cy="16" r="3" />
  </svg>
);

export const CrownIcon = () => (
  <svg {...base}>
    <path d="M4 19h16M4 9l4.5 4.5L12 4l3.5 9.5L20 9l-2 10H6L4 9z" />
  </svg>
);

export const CogIcon = () => (
  <svg {...base}>
    <circle cx="12" cy="12" r="3" />
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
  </svg>
);
