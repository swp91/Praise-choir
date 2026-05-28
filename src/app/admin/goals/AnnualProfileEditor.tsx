'use client';

import { useState } from 'react';
import { updateAnnualProfileAction } from './actions';

const inputClass =
  'w-full border border-line bg-cream px-3 py-2.5 font-ko text-[13px] text-ink outline-none transition focus:border-gold-deep';
const labelClass = 'block font-ko text-[12px] font-bold text-ink mb-1.5';

type Props = {
  year: number;
  themeKo: string;
  goalTitleKo: string;
};

export default function AnnualProfileEditor({ year, themeKo, goalTitleKo }: Props) {
  const [editing, setEditing] = useState(false);

  if (!editing) {
    return (
      <div className="px-5 py-5 space-y-4">
        <div>
          <p className={labelClass}>표어 (큰 제목)</p>
          <p className="font-ko text-[14px] leading-relaxed text-ink">{themeKo || '—'}</p>
        </div>
        <div>
          <p className={labelClass}>목표 섹션 제목</p>
          <p className="font-ko text-[13px] text-ink">{goalTitleKo || '—'}</p>
        </div>
        <div className="flex justify-end">
          <button
            type="button"
            onClick={() => setEditing(true)}
            className="border border-line bg-cream px-4 py-2.5 font-ko text-[13px] text-ink transition hover:border-gold"
          >
            수정
          </button>
        </div>
      </div>
    );
  }

  return (
    <form
      action={async (formData) => {
        await updateAnnualProfileAction(formData);
        setEditing(false);
      }}
      className="px-5 py-5 space-y-4"
    >
      <input type="hidden" name="year" value={year} />
      <div>
        <label className={labelClass} htmlFor="theme_ko">표어 (큰 제목)</label>
        <input
          id="theme_ko"
          name="theme_ko"
          className={inputClass}
          defaultValue={themeKo}
          placeholder="예: 오직 하나님을 기뻐함으로 승리하는 프레이즈"
          required
        />
      </div>
      <div>
        <label className={labelClass} htmlFor="goal_title_ko">목표 섹션 제목</label>
        <input
          id="goal_title_ko"
          name="goal_title_ko"
          className={inputClass}
          defaultValue={goalTitleKo}
          placeholder="예: 일곱 가지 목표, 다섯 가지 목표"
          required
        />
      </div>
      <div className="flex justify-end gap-2">
        <button
          type="button"
          onClick={() => setEditing(false)}
          className="border border-line bg-card px-4 py-2.5 font-ko text-[13px] text-ink transition hover:border-gold"
        >
          취소
        </button>
        <button
          type="submit"
          className="border border-gold-deep bg-gold-deep px-5 py-2.5 font-ko text-[13px] font-bold text-cream transition hover:bg-ink"
        >
          저장
        </button>
      </div>
    </form>
  );
}
