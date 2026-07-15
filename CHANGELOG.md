# CHANGELOG

기능을 구현하거나 수정할 때마다 아래 형식으로 최상단에 추가한다 (기존 내용은 지우지 않음).

## [2026-07-15] 알림 시간 시/분 독립 저장 버그 수정
- 수정/생성 파일: src/app/(main)/settings/page.tsx
- 변경 내용: 마운트 시 시/분을 저장된 값으로 복원하는 로직이 `storedHour && storedMinute` 조건이라 둘 중 하나만 저장되어 있어도 둘 다 현재 시각으로 초기화되던 버그 수정. 이제 시/분을 각각 독립적으로 저장된 값이 있으면 그 값을, 없으면 현재 시각을 사용한다.
- 비고: 분(minute)만 바꾸고 시(hour)는 건드리지 않은 상태로 다른 페이지 갔다 오면 분까지 초기화되던 문제. Playwright로 분만 변경 후 페이지 이동 왕복해도 유지되는 것 확인.

## [2026-07-15] 회원 탈퇴를 별도 페이지에서 설정 페이지 내 모달로 전환
- 수정/생성 파일: src/app/(main)/settings/page.tsx, src/lib/routes.ts, AGENTS.md, src/app/(main)/settings/account/page.tsx(삭제)
- 변경 내용: `/settings/account` 라우트를 없애고, 설정 페이지의 "회원 탈퇴" 클릭 시 같은 페이지에서 모달(탈퇴 사유 폼 → 완료 확인)이 뜨도록 변경. `ROUTES.settingsAccount` 제거.
- 비고: Figma에서 두 화면이 원래 "Modal type"으로 설계되어 있었는데 처음엔 별도 페이지로 잘못 구현했었음.

## [2026-07-15] 회원 탈퇴 페이지 Figma 반영 및 완료 모달 추가
- 수정/생성 파일: src/app/(main)/settings/account/page.tsx, public/account-delete-check.png, src/components/layout/PageHeader.tsx(삭제), AGENTS.md
- 변경 내용: 플레이스홀더였던 회원 탈퇴 페이지를 Figma 디자인(node-id 16-534, 16-556) 기준으로 재구현 — 탈퇴 사유 라디오 6종 + 텍스트 입력 + 제출 시 "회원 탈퇴 완료" 확인 모달. 확인 클릭 시 로그인 상태 플래그 초기화 후 로그인 페이지로 이동.
- 비고: 헤더를 기존 PageHeader(뒤로가기 없음)에서 다른 페이지들과 통일된 BackHeader로 교체하면서 PageHeader가 완전히 미사용 상태가 되어 삭제함. Figma의 3D 체크 아이콘은 만료되는 Figma 임시 URL 대신 public/account-delete-check.png로 다운로드해 사용.

## [2026-07-15] 게스트 stale localStorage로 인한 알림 기능 노출 버그 수정
- 수정/생성 파일: src/app/(main)/settings/page.tsx, AGENTS.md
- 변경 내용: "알림 시간" 카드 노출 조건과 토글 표시 상태(색상/체크)를 `reminderOn` 단독이 아니라 `isLoggedIn && reminderOn`으로 변경. 알림 예약 useEffect에도 `isLoggedIn` 가드 추가.
- 비고: 로그인 게이팅 도입 전 localStorage에 남아있던 `voiceshield-reminder-on=true` 값 때문에 게스트에게도 알림 시간 카드가 보이던 문제. AGENTS.md에 "학습자/게스트/회원" 3단계 역할 구분과 게이팅 시 유의사항을 문서화함.

## [2026-07-15] 매일 학습 알림 로그인 게이팅
- 수정/생성 파일: src/app/(main)/settings/page.tsx, src/app/page.tsx, src/lib/auth.ts, src/components/icons/kakao-icons.tsx
- 변경 내용: 게스트 상태에서는 "매일 학습 알림" 토글이 비활성화되고 클릭 시 로그인 안내 모달(Figma 기준)이 뜨도록 구현. 로그아웃 시 로그인 플래그와 알림 설정을 모두 초기화해 재로그인해도 알림은 꺼진 상태로 시작하게 함.
- 비고: 실제 인증 시스템이 없어 `voiceshield-logged-in` localStorage 플래그로 게스트/회원을 mock 구분함. 백엔드 붙을 때 교체 필요.

## [2026-07-15] 매일 학습 알림 예약 발송 및 클릭 이동
- 수정/생성 파일: src/app/(main)/settings/page.tsx
- 변경 내용: 알림 토글을 켜면 브라우저 알림 권한을 요청하고, 지정한 시/분에 `setTimeout` 기반으로 알림을 띄운 뒤 다음 날로 자동 재예약. 알림 클릭 시 홈 화면으로 이동.
- 비고: 탭이 열려 있는 동안만 동작하는 방식. iOS Safari에서는 홈 화면에 추가해도 이 방식으로는 알림이 안 올 가능성이 높음 — 필요 시 서비스워커 + Web Push로 교체.

## [2026-07-15] 알림 시간(시/분) localStorage 저장 레이스 컨디션 수정
- 수정/생성 파일: src/app/(main)/settings/page.tsx
- 변경 내용: 시/분 값을 useEffect로 반응 저장하던 방식에서, 스테퍼 버튼 클릭 시점에 직접 저장하는 방식으로 변경.
- 비고: 마운트 시 "읽기 effect"와 "쓰기 effect"가 같은 렌더에서 겹치며 기본값이 저장된 값을 순간적으로 덮어쓰는 문제가 있었음.

## [2026-07-15] 글자 크기 조정 버튼 라벨 크기 고정
- 수정/생성 파일: src/app/(main)/settings/page.tsx
- 변경 내용: "보통" 라벨이 전역 스케일 토큰(`text-xs`)을 쓰고 있어 "아주크게" 선택 시 16px로 같이 커지던 버그 수정. 세 라벨 모두 고정 12/14/16px로 표시되게 함.
