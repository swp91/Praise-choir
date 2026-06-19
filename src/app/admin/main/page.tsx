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
  addContactAction,
  uploadIntroPhotoAction,
} from './actions';
import SortableIntroList from './SortableIntroList';
import SortableContactList from './SortableContactList';

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
    `px-4 py-3 font-ko text-[14px] font-bold border-b-2 transition ${
      activeTab === tab
        ? 'border-gold-deep text-gold-deep'
        : 'border-transparent text-ink-mute hover:text-ink hover:border-line'
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

        {errorMsg && (
          <div className="mt-4 border border-red-200 bg-red-50 p-4 font-ko text-[13px] text-red-700">
            {errorMsg}
          </div>
        )}

        {/* 탭 네비게이션 */}
        <div className="mt-6 flex border-b border-line overflow-x-auto whitespace-nowrap scrollbar-none">
          <Link href="/admin/main?tab=slogan" className={tabClass('slogan')}>
            슬로건 & 히어로
          </Link>
          <Link href="/admin/main?tab=intro" className={tabClass('intro')}>
            인트로 사진
          </Link>
          <Link href="/admin/main?tab=parts" className={tabClass('parts')}>
            파트별 사진
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
                  <div>
                    <label className={labelClass} htmlFor="hero_position">
                      히어로 배경 노출 위치 (background-position)
                    </label>
                    <input
                      id="hero_position"
                      name="hero_position"
                      type="text"
                      className={inputClass}
                      defaultValue={data.heroBackgroundPosition}
                      placeholder="예: center 30%, center, top"
                    />
                    <p className="mt-1 font-ko text-[11px] text-ink-mute">
                      메인 사진의 노출될 중심축 비율을 CSS 형식으로 입력합니다 (기본값: center 30%).
                    </p>
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
                <div className="px-5 py-5 grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className={labelClass}>현재 배경 이미지</label>
                    {data.heroBackgroundUrl ? (
                      <div className="border border-line bg-cream p-2">
                        <img
                          src={data.heroBackgroundUrl}
                          alt="Hero Background"
                          className="w-full max-h-56 object-cover"
                        />
                      </div>
                    ) : (
                      <div className="border border-dashed border-line bg-cream py-16 text-center font-ko text-[13px] text-ink-soft">
                        등록된 히어로 이미지가 없습니다.
                      </div>
                    )}
                  </div>
                  <div>
                    <form action={uploadHeroImageAction} className="space-y-4">
                      <label className={labelClass} htmlFor="hero_image">
                        새 배경 이미지 업로드
                      </label>
                      <input
                        id="hero_image"
                        name="hero_image"
                        type="file"
                        accept="image/*"
                        required
                        className="w-full font-ko text-[13px] text-ink border border-line bg-cream p-2"
                      />
                      <p className="font-ko text-[11px] text-ink-mute">
                        초대형 몬타주 완성 후 마지막에 대문으로 나오는 웅장한 가로형 메인 배경 사진입니다.
                      </p>
                      <button
                        type="submit"
                        className="w-full border border-gold-deep bg-gold-deep py-2.5 font-ko text-[13px] font-bold text-cream transition hover:bg-ink"
                      >
                        배경 이미지 변경
                      </button>
                    </form>
                  </div>
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
                  <form action={uploadIntroPhotoAction} className="mb-8 border border-line bg-cream p-4">
                    <label className={labelClass} htmlFor="intro_image">
                      새 인트로 사진 추가
                    </label>
                    <div className="flex flex-col sm:flex-row gap-3">
                      <input
                        id="intro_image"
                        name="intro_image"
                        type="file"
                        accept="image/*"
                        required
                        className="flex-1 font-ko text-[13px] text-ink border border-line bg-card p-2"
                      />
                      <button
                        type="submit"
                        className="border border-gold-deep bg-gold-deep px-5 py-2.5 font-ko text-[13px] font-bold text-cream transition hover:bg-ink"
                      >
                        + 사진 추가
                      </button>
                    </div>
                    <p className="mt-2 font-ko text-[11px] text-ink-mute">
                      인트로 오프닝 시 화면에 차례대로 번쩍이며 확대되는 6개 내외의 사진들입니다.
                    </p>
                  </form>

                  <SortableIntroList photos={data.introPhotos} />
                </div>
              </section>
            </div>
          )}

          {/* ==================== 3. 파트별 사진 관리 ==================== */}
          {activeTab === 'parts' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {data.partPhotos.map((part) => (
                <section key={part.key} className="border border-line bg-card">
                  <div className="border-b border-line bg-card-head px-5 py-3">
                    <h2 className="font-ko text-[16px] font-bold text-ink">{part.title} 카드 이미지</h2>
                  </div>
                  <div className="px-5 py-4 space-y-4">
                    {part.imageUrl ? (
                      <div className="border border-line bg-cream p-1.5 aspect-[4/3] overflow-hidden">
                        <img
                          src={part.imageUrl}
                          alt={part.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ) : (
                      <div className="border border-dashed border-line bg-cream aspect-[4/3] flex items-center justify-center font-ko text-[12px] text-ink-soft">
                        등록된 대표 사진이 없습니다.
                      </div>
                    )}
                    <form action={uploadPartPhotoAction} className="space-y-2">
                      <input type="hidden" name="section_key" value={part.key} />
                      <input
                        name="section_image"
                        type="file"
                        accept="image/*"
                        required
                        className="w-full font-ko text-[12px] text-ink border border-line bg-cream p-1.5"
                      />
                      <button
                        type="submit"
                        className="w-full border border-gold-deep bg-gold-deep py-2 font-ko text-[12px] font-bold text-cream transition hover:bg-ink"
                      >
                        {part.title} 사진 교체
                      </button>
                    </form>
                  </div>
                </section>
              ))}
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
                <div className="px-5 py-5 grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className={labelClass}>현재 배경 이미지</label>
                    {data.servantsBackgroundUrl ? (
                      <div className="border border-line bg-cream p-2">
                        <img
                          src={data.servantsBackgroundUrl}
                          alt="Servants Background"
                          className="w-full max-h-56 object-cover"
                        />
                      </div>
                    ) : (
                      <div className="border border-dashed border-line bg-cream py-16 text-center font-ko text-[13px] text-ink-soft">
                        등록된 배경 이미지가 없습니다.
                      </div>
                    )}
                  </div>
                  <div>
                    <form action={uploadServantsBgAction} className="space-y-4">
                      <label className={labelClass} htmlFor="servants_bg">
                        새 배경 이미지 업로드
                      </label>
                      <input
                        id="servants_bg"
                        name="servants_bg"
                        type="file"
                        accept="image/*"
                        required
                        className="w-full font-ko text-[13px] text-ink border border-line bg-cream p-2"
                      />
                      <p className="font-ko text-[11px] text-ink-mute">
                        홈페이지 스크롤 시 어둡게 덮이면서 카드 롤러 뒤로 나타나는 어두운 톤의 가로형 사진입니다.
                      </p>
                      <button
                        type="submit"
                        className="w-full border border-gold-deep bg-gold-deep py-2.5 font-ko text-[13px] font-bold text-cream transition hover:bg-ink"
                      >
                        배경 이미지 변경
                      </button>
                    </form>
                  </div>
                </div>
              </section>

              {/* 연습/예배 시간표 배경 */}
              <section className="border border-line bg-card">
                <div className="border-b border-line bg-card-head px-5 py-4">
                  <h2 className="font-ko text-[18px] font-bold text-ink">
                    '예배/연습 시간표' 섹션 배경
                  </h2>
                </div>
                <div className="px-5 py-5 grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className={labelClass}>현재 배경 이미지</label>
                    {data.practiceBackgroundUrl ? (
                      <div className="border border-line bg-cream p-2">
                        <img
                          src={data.practiceBackgroundUrl}
                          alt="Practice Background"
                          className="w-full max-h-56 object-cover"
                        />
                      </div>
                    ) : (
                      <div className="border border-dashed border-line bg-cream py-16 text-center font-ko text-[13px] text-ink-soft">
                        등록된 배경 이미지가 없습니다.
                      </div>
                    )}
                  </div>
                  <div>
                    <form action={uploadPracticeBgAction} className="space-y-4">
                      <label className={labelClass} htmlFor="practice_bg">
                        새 배경 이미지 업로드
                      </label>
                      <input
                        id="practice_bg"
                        name="practice_bg"
                        type="file"
                        accept="image/*"
                        required
                        className="w-full font-ko text-[13px] text-ink border border-line bg-cream p-2"
                      />
                      <p className="font-ko text-[11px] text-ink-mute">
                        홈페이지 하단 연습 시간표 카드가 올라오기 전, 뒤에서 나타나는 성가대 단체/연습용 가로형 사진입니다.
                      </p>
                      <button
                        type="submit"
                        className="w-full border border-gold-deep bg-gold-deep py-2.5 font-ko text-[13px] font-bold text-cream transition hover:bg-ink"
                      >
                        배경 이미지 변경
                      </button>
                    </form>
                  </div>
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
                    홈페이지 최하단에 배치되는 문의 카드 목록입니다. 임원진 대원을 리스트에 지정할 수 있습니다.
                    해당 대원들의 <strong>전화번호 및 역할명</strong>이 실시간으로 홈페이지에 공개됩니다.
                    번호를 드래그하여 노출 순서를 변경할 수 있습니다.
                  </p>

                  <SortableContactList contacts={data.contacts} />

                  <form action={addContactAction} className="border border-line bg-cream p-4 rounded-lg space-y-4">
                    <h3 className="font-ko text-[14px] font-bold text-ink">새 문의 담당자 추가</h3>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className={labelClass} htmlFor="person_id">
                          임원 대원 선택
                        </label>
                        <select id="person_id" name="person_id" className={inputClass} required>
                          <option value="">-- 대원 선택 --</option>
                          {data.peopleList.map((p) => (
                            <option key={p.id} value={p.id}>
                              {p.name} ({p.phone || '전화번호 없음'})
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className={labelClass} htmlFor="role_text">
                          직무명 (역할)
                        </label>
                        <input
                          id="role_text"
                          name="role_text"
                          type="text"
                          className={inputClass}
                          placeholder="예: 대장, 총무, 회계, 부총무 등"
                          required
                        />
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
