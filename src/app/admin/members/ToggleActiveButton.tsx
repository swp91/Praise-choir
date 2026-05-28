'use client';

import { useState, useTransition } from 'react';
import type { setMemberActiveAction } from './actions';

type Props = {
  id: string;
  isActive: boolean;
  action: typeof setMemberActiveAction;
};

export default function ToggleActiveButton({ id, isActive, action }: Props) {
  const [active, setActive] = useState(isActive);
  const [isPending, startTransition] = useTransition();

  function handleClick() {
    const next = !active;
    setActive(next);
    startTransition(() => {
      action(id, next).catch(() => setActive(active));
    });
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={isPending}
      title={active ? '클릭하면 비활성화' : '클릭하면 활성화'}
      className={`w-14 border py-1 text-center font-ko text-[11px] transition disabled:opacity-50 ${
        active
          ? 'border-gold/60 text-gold-deep hover:border-red-300 hover:text-red-500'
          : 'border-line text-ink-mute hover:border-gold/60 hover:text-gold-deep'
      }`}
    >
      {active ? '활성' : '비활성'}
    </button>
  );
}
