import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '개인정보처리방침 | 프레이즈찬양대',
  description: '프레이즈찬양대 공식 홈페이지 및 애플리케이션의 개인정보처리방침입니다.',
};

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-[#fdf9f0] text-[#171717] px-6 py-16 md:py-24 font-ko">
      <div className="max-w-[760px] mx-auto flex flex-col gap-10">
        {/* Header */}
        <div className="border-b border-line/60 pb-8">
          <p className="font-en text-[11px] tracking-[0.3em] uppercase text-gold-deep mb-2">
            Privacy Policy
          </p>
          <h1 className="font-ko text-[28px] md:text-[36px] font-bold text-ink leading-tight">
            개인정보처리방침
          </h1>
          <p className="font-ko text-[13px] text-ink-soft mt-3">
            시행일자: 2026년 6월 28일
          </p>
        </div>

        {/* Content Section */}
        <div className="flex flex-col gap-8 text-[14px] leading-relaxed text-ink-soft">
          <section className="flex flex-col gap-3">
            <h2 className="text-[17px] font-bold text-ink">1. 개인정보의 수집 및 이용 목적</h2>
            <p>
              본 서비스(프레이즈찬양대 홈페이지 및 모바일 애플리케이션)는 다음의 목적을 위하여 최소한의 개인정보를 수집하고 이용합니다. 수집된 개인정보는 다음의 목적 이외의 용도로는 이용되지 않으며, 이용 목적이 변경되는 경우에는 별도의 동의를 받는 등 필요한 조치를 이행할 예정입니다.
            </p>
            <ul className="list-disc pl-5 flex flex-col gap-1 mt-1">
              <li><strong>찬양대원 가입 및 관리</strong>: 대원 가입 신청 의사 확인, 대원 명부 작성, 파트 배정 및 연락망 구축</li>
              <li><strong>서비스 제공 및 개선</strong>: 찬양 아카이브 제공, 공지사항 전달, 모바일 앱 푸시 알림(선택) 및 사용자 피드백 반영</li>
            </ul>
          </section>

          <section className="flex flex-col gap-3">
            <h2 className="text-[17px] font-bold text-ink">2. 수집하는 개인정보의 항목</h2>
            <p>
              서비스 이용 과정에서 아래와 같은 개인정보가 수집될 수 있습니다.
            </p>
            <ul className="list-disc pl-5 flex flex-col gap-1 mt-1">
              <li><strong>찬양대원 정보</strong>: 이름, 생년월일(음력 여부 포함), 전화번호, 배정 파트, 사진(선택)</li>
              <li><strong>가입 신청 시</strong>: 이름, 연락처, 희망 파트, 지원 동기</li>
              <li><strong>기기 정보</strong>: 모바일 앱 이용 시 기기 식별자(푸시 알림 수신 동의 시에 한함)</li>
            </ul>
          </section>

          <section className="flex flex-col gap-3">
            <h2 className="text-[17px] font-bold text-ink">3. 개인정보의 보유 및 이용기간</h2>
            <p>
              본 서비스는 법령에 따른 개인정보 보유·이용기간 또는 정보주체로부터 개인정보를 수집 시에 동의받은 개인정보 보유·이용기간 내에서 개인정보를 처리하고 보유합니다.
            </p>
            <ul className="list-disc pl-5 flex flex-col gap-1 mt-1">
              <li><strong>찬양대원 명부 및 정보</strong>: 찬양대원 활동 기간 동안 보유하며, 탈퇴 요청 시 즉시 파기합니다.</li>
              <li><strong>가입 신청 정보</strong>: 대원 선발 및 배치 완료 후 3개월 이내에 파기합니다.</li>
            </ul>
          </section>

          <section className="flex flex-col gap-3">
            <h2 className="text-[17px] font-bold text-ink">4. 개인정보의 파기절차 및 파기방법</h2>
            <p>
              본 서비스는 개인정보 보유기간의 경과, 처리목적 달성 등 개인정보가 불필요하게 되었을 때에는 지체 없이 해당 개인정보를 파기합니다. 전자적 파일 형태의 정보는 기록을 재생할 수 없는 기술적 방법을 사용하여 영구 삭제하며, 종이 문서에 출력된 개인정보는 분쇄기로 분쇄하여 파기합니다.
            </p>
          </section>

          <section className="flex flex-col gap-3">
            <h2 className="text-[17px] font-bold text-ink">5. 정보주체의 권리·의무 및 그 행사방법</h2>
            <p>
              정보주체는 언제든지 본 서비스에 대해 개인정보 열람·정정·삭제·처리정지 요구 등의 권리를 행사할 수 있습니다. 권리 행사는 서면, 전자우편 등을 통하여 하실 수 있으며 본 서비스는 이에 대해 지체 없이 조치하겠습니다.
            </p>
          </section>

          <section className="flex flex-col gap-3">
            <h2 className="text-[17px] font-bold text-ink">6. 개인정보의 안전성 확보 조치</h2>
            <p>
              본 서비스는 개인정보의 안전성 확보를 위해 개인정보에 대한 접근 권한을 최소화하여 제한하고 있으며, 데이터베이스 시스템의 보안 관리를 철저히 수행하고 있습니다.
            </p>
          </section>

          <section className="flex flex-col gap-3">
            <h2 className="text-[17px] font-bold text-ink">7. 개인정보 보호책임자</h2>
            <p>
              본 서비스의 개인정보 처리에 관한 업무를 총괄해서 책임지고, 정보주체의 불만처리 및 피해구제 등을 위하여 아래와 같이 개인정보 보호책임자를 지정하고 있습니다.
            </p>
            <div className="bg-card border border-line p-5 rounded-lg mt-2 flex flex-col gap-1 text-[13px]">
              <p><strong>담당 부서</strong>: 프레이즈찬양대 운영위원회</p>
              <p><strong>문의 이메일</strong>: seongwoo4477@gmail.com</p>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
