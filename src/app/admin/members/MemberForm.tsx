import Link from 'next/link';
import type { AdminMember, AdminMemberOption } from '@/lib/admin/members';
import BirthPicker from './BirthPicker';

const inputClass =
  'w-full border border-line bg-cream px-3 py-2.5 font-ko text-[13px] text-ink outline-none transition focus:border-gold-deep';
const labelClass = 'block font-ko text-[12px] font-bold text-ink mb-1.5';

type Props = {
  member?: AdminMember;
  sections: AdminMemberOption[];
  instruments: AdminMemberOption[];
  action: (formData: FormData) => Promise<void>;
  title: string;
  submitLabel: string;
  cancelHref: string;
};

export function MemberForm({ member, sections, instruments, action, title, submitLabel, cancelHref }: Props) {
  return (
    <form action={action} className="border border-line bg-card">
      {member ? <input type="hidden" name="id" value={member.id} /> : null}

      <div className="border-b border-line bg-card-head px-5 py-4">
        <h2 className="font-ko text-[18px] font-bold text-ink">{title}</h2>
      </div>

      <div className="grid gap-4 px-5 py-5 min-[760px]:grid-cols-2">
        <div>
          <label className={labelClass} htmlFor="display_name">이름</label>
          <input
            id="display_name"
            name="display_name"
            className={inputClass}
            defaultValue={member?.displayName ?? ''}
            placeholder="예: 홍길동 집사"
            required
          />
        </div>

        <div>
          <label className={labelClass} htmlFor="section_id">소속 파트</label>
          <select
            id="section_id"
            name="section_id"
            className={inputClass}
            defaultValue={member?.sectionId ?? ''}
            required
          >
            <option value="">선택</option>
            {sections.map((section) => (
              <option key={section.id} value={section.id}>{section.label}</option>
            ))}
          </select>
        </div>

        <div>
          <label className={labelClass} htmlFor="role_text">직분/역할</label>
          <input
            id="role_text"
            name="role_text"
            className={inputClass}
            defaultValue={member?.roleText ?? ''}
            placeholder="예: 파트장, 악단장"
          />
        </div>

        <div>
          <label className={labelClass} htmlFor="instrument_id">악기</label>
          <select
            id="instrument_id"
            name="instrument_id"
            className={inputClass}
            defaultValue={member?.instrumentId ?? ''}
          >
            <option value="">해당 없음</option>
            {instruments.map((instrument) => (
              <option key={instrument.id} value={instrument.id}>{instrument.label}</option>
            ))}
          </select>
        </div>

        <div>
          <p className={labelClass}>생일</p>
          <BirthPicker defaultValue={member?.birthLabel} />
          <label className="mt-2 flex items-center gap-2 font-ko text-[12px] text-ink-soft">
            <input type="checkbox" name="birth_is_lunar" defaultChecked={member?.birthIsLunar ?? false} />
            음력
          </label>
          <label className="mt-2 flex items-center gap-2 font-ko text-[12px] text-ink-soft">
            <input type="checkbox" name="show_birth" defaultChecked={member?.showBirth ?? true} />
            홈페이지에 생일 표시
          </label>
        </div>

        <div>
          <label className={labelClass} htmlFor="phone_label">전화번호</label>
          <input
            id="phone_label"
            name="phone_label"
            className={inputClass}
            defaultValue={member?.phoneLabel ?? ''}
            placeholder="예: 010-0000-0000"
          />
          <label className="mt-2 flex items-center gap-2 font-ko text-[12px] text-ink-soft">
            <input type="checkbox" name="show_phone" defaultChecked={member?.showPhone ?? true} />
            홈페이지에 전화번호 표시
          </label>
        </div>

        <div>
          <label className={labelClass} htmlFor="photo_url">사진 URL</label>
          <input
            id="photo_url"
            name="photo_url"
            className={inputClass}
            defaultValue={member?.photoUrl ?? ''}
            placeholder="Storage 업로드 전까지 임시 URL 사용"
          />
        </div>
      </div>

      <div className="flex justify-end gap-2 border-t border-line px-5 py-4">
        <Link
          href={cancelHref}
          className="border border-line bg-card px-4 py-2.5 font-ko text-[13px] text-ink transition hover:border-gold"
        >
          취소
        </Link>
        <button
          type="submit"
          className="border border-gold-deep bg-gold-deep px-5 py-2.5 font-ko text-[13px] font-bold text-cream transition hover:bg-ink"
        >
          {submitLabel}
        </button>
      </div>
    </form>
  );
}
