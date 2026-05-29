'use client';

import { useState, useTransition } from 'react';
import type { setMusicStaffActiveAction } from './actions';

type Props = {
  id: string;
  isActive: boolean;
  action: typeof setMusicStaffActiveAction;
};

export default function ToggleStaffButton({ id, isActive, action }: Props) {
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
      title={active ? '클릭하면 비공개' : '클릭하면 공개'}
      className={`w-14 border py-1 text-center font-ko text-[11px] transition disabled:opacity-50 ${
        active
          ? 'border-green-400 bg-green-50 text-green-700 hover:bg-green-100'
          : 'border-red-300 bg-red-50 text-red-600 hover:bg-red-100'
      }`}
    >
      {active ? '공개' : '비공개'}
    </button>
  );
}
