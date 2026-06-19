import Link from 'next/link';
import { redirect } from 'next/navigation';
import { isAdminAuthenticated } from '@/lib/admin/auth';
import { getAdminMainData } from '@/lib/admin/main';
import {
  updateSloganAction,
  uploadHeroImageAction,
  uploadServantsBgAction,
  uploadPracticeBgAction,
  uploadPartPhotoAction,
  uploadSlidePhotoAction,
  addContactAction,
  uploadIntroPhotoAction,
  addStaffMemberAction,
  deleteStaffMemberAction,
  updateStaffMemberAction,
} from './actions';
import SortableIntroList from './SortableIntroList';
import SortableContactList from './SortableContactList';
import ImageClickUploader from './ImageClickUploader';
import StaffSlideCard from './StaffSlideCard';
import AddStaffForm from './AddStaffForm';
import AdminNotification from './AdminNotification';

type Props = {
  searchParams?: Promise<{
    error?: string;
    tab?: string;
  }>;
};

const inputClass =
  'w-full border border-line bg-cream px-3.5 py-2.5 font-ko text-[14px] text-ink outline-none transition focus:border-gold-deep';
const labelClass = 'block font-ko text-[13px] font-bold text-ink mb-2';

export default async function AdminMainPage({ searchParams }: Props) {
  if (!(await isAdminAuthenticated())) redirect('/admin');

  const params = await searchParams;
  const errorMsg = params?.error ? decodeURIComponent(params.error) : null;
  const activeTab = params?.tab || 'slogan'; // 'slogan' | 'intro' | 'parts' | 'bgs' | 'contacts'

  const data = await getAdminMainData();

  const tabClass = (tab: string) =>
    `px-3.5 py-2 md:px-4 md:py-3 font-ko text-[13px] md:text-[14px] font-bold transition rounded-full md:rounded-none md:border-b-2 ${
      activeTab === tab
        ? 'bg-gold-deep text-cream md:bg-transparent md:border-gold-deep md:text-gold-deep'
        : 'bg-card text-ink-soft border border-line-soft md:bg-transparent md:border-transparent md:text-ink-mute hover:text-ink hover:border-line'
    }`;

  return (
    <main className="min-h-screen bg-cream px-5 py-8 min-[881px]:px-10">
      <div className="mx-auto max-w-4xl">
        <header className="flex flex-col gap-5 border-b border-line pb-6 min-[760px]:flex-row min-[760px]:items-end min-[760px]:justify-between">
          <div>
            <p className="font-en text-[10px] tracking-[0.34em] uppercase text-gold-deep mb-3">
              Praise Choir Admin
            </p>
            <h1 className="font-ko text-[clamp(26px,4vw,42px)] font-bold leading-tight text-ink">
              메인 관리
            </h1>
            <p className="mt-3 font-ko text-[14px] leading-relaxed text-ink-soft">
              메인페이지의 슬로건, 배경 사진, 인트로 및 문의 임원진을 관리합니다.
            </p>
          </div>
          <Link
            href="/admin"
            className="border border-line bg-card px-4 py-2.5 font-ko text-[13px] text-ink transition hover:border-gold"
          >
            대시보드로
          </Link>
        </header>

        <AdminNotification />

        {/* 탭 네비게이션 (모바일 알약형 랩핑 & 데스크톱 라인형 하이브리드 구조) */}
        <div className="mt-6 flex flex-wrap md:flex-nowrap gap-2 md:gap-0 border-b-0 md:border-b md:border-line overflow-x-auto whitespace-nowrap scrollbar-none">
          <Link href="/admin/main?tab=slogan" className={tabClass('slogan')}>
            슬로건 & 히어로
          </Link>
          <Link href="/admin/main?tab=intro" className={tabClass('intro')}>
            인트로 사진
          </Link>
          <Link href="/admin/main?tab=parts" className={tabClass('parts')}>
            슬라이드 사진
          </Link>
          <Link href="/admin/main?tab=bgs" className={tabClass('bgs')}>
            섹션 배경
          </Link>
          <Link href="/admin/main?tab=contacts" className={tabClass('contacts')}>
            문의 연락처
          </Link>
        </div>

        <div className="mt-6 space-y-6">
          {/* ==================== 1. 슬로건 & 히어로 ==================== */}
          {activeTab === 'slogan' && (
            <div className="space-y-6">
              {/* 슬로건 텍스트 수정 */}
              <section className="border border-line bg-card">
                <div className="border-b border-line bg-card-head px-5 py-4">
                  <h2 className="font-ko text-[18px] font-bold text-ink">슬로건 관리</h2>
                </div>
                <form action={updateSloganAction} className="px-5 py-5 space-y-4">
                  <div>
                    <label className={labelClass} htmlFor="theme_ko">
                      국문 슬로건 (한글 표어)
                    </label>
                    <textarea
                      id="theme_ko"
                      name="theme_ko"
                      rows={2}
                      className={inputClass}
                      defaultValue={data.themeKo}
                      placeholder="예: 오직 하나님을 기뻐함으로\n승리하는 프레이즈"
                      required
                    />
                    <p className="mt-1 font-ko text-[11px] text-ink-mute">
                      줄바꿈(\n)을 입력하면 홈페이지 화면에서도 동일하게 줄바꿈되어 표현됩니다.
                    </p>
                  </div>
                  <div>
                    <label className={labelClass} htmlFor="theme_en">
                      영문 슬로건 (영문 표어)
                    </label>
                    <input
                      id="theme_en"
                      name="theme_en"
                      type="text"
                      className={inputClass}
                      defaultValue={data.themeEn}
                      placeholder="예: Rejoicing in the Lord, We Triumph"
                    />
                  </div>
                  <div className="flex justify-end">
                    <button
                      type="submit"
                      className="border border-gold-deep bg-gold-deep px-5 py-2.5 font-ko text-[13px] font-bold text-cream transition hover:bg-ink"
                    >
                      저장하기
                    </button>
                  </div>
                </form>
              </section>

              {/* 히어로 배경 이미지 수정 */}
              <section className="border border-line bg-card">
                <div className="border-b border-line bg-card-head px-5 py-4">
                  <h2 className="font-ko text-[18px] font-bold text-ink">메인 히어로 이미지</h2>
                </div>
                <div className="px-5 py-5 space-y-4">
                  <ImageClickUploader
                    action={uploadHeroImageAction}
                    currentImageUrl={data.heroBackgroundUrl}
                    name="hero_image"
                    label="히어로 메인 배경 사진"
                    aspectRatioClass="aspect-[21/9]"
                  />
                </div>
              </section>
            </div>
          )}

          {/* ==================== 2. 인트로 사진 관리 ==================== */}
          {activeTab === 'intro' && (
            <div className="space-y-6">
              <section className="border border-line bg-card">
                <div className="border-b border-line bg-card-head px-5 py-4">
                  <h2 className="font-ko text-[18px] font-bold text-ink">인트로 몬타주 사진</h2>
                </div>
                <div className="px-5 py-5">
                  <div className="mb-6 p-4 border border-line bg-cream font-ko text-[13px] text-ink-soft leading-relaxed">
                    <p className="font-bold text-gold-deep mb-1">💡 안내 사항</p>
                    인트로 오프닝 시 화면에 차례대로 내려오는 사진입니다. 개수가 5장으로 고정되어 있으므로 새 사진 추가나 삭제는 불가능합니다.
                    <br />
                    각 사진 카드의 <strong className="text-ink">'사진 변경'</strong> 버튼을 눌러 이미지를 개별 교체하거나, 사진을 드래그하여 노출 순서를 바꿀 수 있습니다.
                  </div>

                  <div className="mb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-line pb-3">
                    <span className="font-ko text-[13px] font-bold text-ink-soft">
                      등록된 사진: {data.introPhotos.length} / 5 장
                    </span>
                  </div>

                  <SortableIntroList photos={data.introPhotos} />
                </div>
              </section>
            </div>
          )}

          {/* ==================== 3. 슬라이드 사진 관리 ==================== */}
          {activeTab === 'parts' && (
            <div className="space-y-6">
              {/* 스태프 멤버 추가 폼 */}
              <section className="border border-line bg-card">
                <div className="border-b border-line bg-card-head px-5 py-4">
                  <h2 className="font-ko text-[18px] font-bold text-ink">새 스태프 추가 (지휘자, 반주자, 편곡자 등)</h2>
                </div>
                <div className="px-5 py-5">
                  <AddStaffForm action={addStaffMemberAction} />
                </div>
              </section>

              {/* 슬라이드 카드 목록 */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {data.slidePhotos.map((slide) => 
                  slide.type === 'staff' ? (
                    <StaffSlideCard
                      key={slide.key}
                      slide={slide}
                      updateAction={updateStaffMemberAction}
                      deleteAction={deleteStaffMemberAction}
                      uploadSlidePhotoAction={uploadSlidePhotoAction}
                    />
                  ) : (
                    <section key={slide.key} className="border border-line bg-card flex flex-col justify-between">
                      <div>
                        <div className="border-b border-line bg-card-head px-5 py-3 flex items-center justify-between">
                          <h2 className="font-ko text-[16px] font-bold text-ink">{slide.title} 슬라이드 사진</h2>
                          <span className="font-en text-[11px] px-2 py-0.5 rounded bg-gold-deep/10 text-gold-deep font-semibold">
                            파트
                          </span>
                        </div>
                        <div className="px-5 py-4">
                          <ImageClickUploader
                            action={uploadSlidePhotoAction}
                            currentImageUrl={slide.imageUrl}
                            name="slide_image"
                            label={`${slide.title} 슬라이드 사진`}
                            aspectRatioClass="aspect-[4/3]"
                            hiddenFields={[
                              { name: 'slide_type', value: slide.type },
                              { name: 'target_id', value: slide.targetId },
                            ]}
                          />
                        </div>
                      </div>
                    </section>
                  )
                )}
              </div>
            </div>
          )}

          {/* ==================== 4. 섹션 배경 관리 ==================== */}
          {activeTab === 'bgs' && (
            <div className="space-y-6">
              {/* 섬기는 사람들 배경 */}
              <section className="border border-line bg-card">
                <div className="border-b border-line bg-card-head px-5 py-4">
                  <h2 className="font-ko text-[18px] font-bold text-ink">
                    '섬기는 사람들' 섹션 배경
                  </h2>
                </div>
                <div className="px-5 py-5 space-y-4">
                  <p className="font-ko text-[13px] text-ink-soft">
                    아래 이미지를 클릭하여 변경할 수 있습니다.
                  </p>
                  <ImageClickUploader
                    action={uploadServantsBgAction}
                    currentImageUrl={data.servantsBackgroundUrl}
                    name="servants_bg"
                    label="섬기는 사람들 섹션 배경 사진"
                    aspectRatioClass="aspect-[21/9]"
                  />
                </div>
              </section>

              {/* 연습/예배 시간표 배경 */}
              <section className="border border-line bg-card">
                <div className="border-b border-line bg-card-head px-5 py-4">
                  <h2 className="font-ko text-[18px] font-bold text-ink">
                    '예배/연습 시간표' 섹션 배경
                  </h2>
                </div>
                <div className="px-5 py-5 space-y-4">
                  <p className="font-ko text-[13px] text-ink-soft">
                    아래 이미지를 클릭하여 변경할 수 있습니다.
                  </p>
                  <ImageClickUploader
                    action={uploadPracticeBgAction}
                    currentImageUrl={data.practiceBackgroundUrl}
                    name="practice_bg"
                    label="예배/연습 시간표 섹션 배경 사진"
                    aspectRatioClass="aspect-[21/9]"
                  />
                </div>
              </section>
            </div>
          )}

          {/* ==================== 5. 문의 연락처 관리 ==================== */}
          {activeTab === 'contacts' && (
            <div className="space-y-6">
              <section className="border border-line bg-card">
                <div className="border-b border-line bg-card-head px-5 py-4">
                  <h2 className="font-ko text-[18px] font-bold text-ink">문의 연락처 대원 설정</h2>
                </div>
                <div className="px-5 py-5 space-y-6">
                  <p className="font-ko text-[13px] text-ink-soft leading-relaxed border-b border-line pb-4">
                    홈페이지 최하단에 배치되는 문의 카드 목록입니다.
                  </p>

                  <SortableContactList contacts={data.contacts} />

                  <form action={addContactAction} className="border border-line bg-cream p-4 rounded-lg space-y-4">
                    <h3 className="font-ko text-[14px] font-bold text-ink">새 문의 담당자 추가</h3>
                    
                    <div className="space-y-4">
                      <div>
                        <label className={labelClass} htmlFor="officer_select">
                          임원진 선택
                        </label>
                        <select id="officer_select" name="officer_select" className={inputClass} required>
                          <option value="">-- 임원 선택 --</option>
                          {data.officersList.map((o) => (
                            <option key={`${o.personId}-${o.role}`} value={`${o.personId}|${o.role}`}>
                              {o.name} - {o.role} {o.phone ? `(${o.phone})` : ''}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="flex justify-end pt-2">
                      <button
                        type="submit"
                        className="border border-gold-deep bg-gold-deep px-5 py-2.5 font-ko text-[13px] font-bold text-cream transition hover:bg-ink"
                      >
                        담당자 추가
                      </button>
                    </div>
                  </form>
                </div>
              </section>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
