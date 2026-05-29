'use client';

import { useState, useTransition } from 'react';
import type { setEventHighlightAction, setEventPublishedAction } from './actions';

type Props = {
  id: string;
  active: boolean;
  activeLabel: string;
  inactiveLabel: string;
  activeClass: string;
  inactiveClass: string;
  action: typeof setEventPublishedAction | typeof setEventHighlightAction;
};

export default function ToggleEventButton({
  id,
  active,
  activeLabel,
  inactiveLabel,
  activeClass,
  inactiveClass,
  action,
}: Props) {
  const [enabled, setEnabled] = useState(active);
  const [isPending, startTransition] = useTransition();

  function handleClick() {
    const next = !enabled;
    setEnabled(next);
    startTransition(() => {
      action(id, next).catch(() => setEnabled(enabled));
    });
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={isPending}
      className={`min-w-16 border px-3 py-1.5 font-ko text-[12px] font-bold transition disabled:opacity-50 ${
        enabled ? activeClass : inactiveClass
      }`}
    >
      {enabled ? activeLabel : inactiveLabel}
    </button>
  );
}
