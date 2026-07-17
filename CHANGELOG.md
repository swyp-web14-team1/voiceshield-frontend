# CHANGELOG

기능을 구현하거나 수정할 때마다 아래 형식으로 최상단에 추가한다 (기존 내용은 지우지 않음).

## [2026-07-17] 전화 시뮬레이션 화면 반응형 전환
- 수정/생성 파일: src/app/learn/[caseId]/call/page.tsx
- 변경 내용: 처음에 고정 px(margin/padding/버튼·아이콘 크기/글자 크기)로 만들었던 걸 전부 `clamp(min, Ncqw/cqh, max)` 기반으로 재작성. 프로젝트 컨벤션(AGENTS.md 스타일링 규칙)을 놓쳤던 부분을 뒤늦게 맞춤.
- 비고: `cqh`는 `@container`가 `inline-size`만 컨테인하면 동작 안 할 거라 예상했는데, 실제로는 상위에 block-size 컨테이너가 없어 viewport height 기준으로 폴백되어 정상적으로 반응형 동작함을 Playwright로 확인함 (뷰포트 높이 900→500→350에서 123px→120px→84px로 축소).

## [2026-07-16] 전화 시뮬레이션(수신 전화 화면) 신규 구현
- 수정/생성 파일: src/app/learn/[caseId]/call/page.tsx(신규), src/app/(main)/learn/[caseId]/page.tsx, src/lib/routes.ts
- 변경 내용: Figma(node-id 33-656) 기준 "수신 전화" 시뮬레이션 화면 추가. 시나리오 상세 페이지의 "전화로 시작" 버튼이 이 화면(`/learn/[caseId]/call`)으로 연결되도록 연결. "시작하기"(초록) 버튼에만 버튼 안쪽에서 시작해 바깥으로 크게 퍼지는 커스텀 링 펄스 이펙트(`.call-ring-pulse`, 3개 링 시차 재생)를 넣고, "종료하기"(빨강) 버튼은 이펙트 없음.
- 비고: 이 화면은 BackHeader/BottomNav가 없는 풀스크린 디자인이라 `(main)` 라우트 그룹 밖(`src/app/learn/[caseId]/call/`)에 배치함 — `(main)/learn/[caseId]/page.tsx`와는 다른 물리적 트리지만 URL은 `/learn/[caseId]` 하위로 자연스럽게 이어짐. "시작하기" 클릭 후 실제 통화 시뮬레이션 화면은 아직 미구현 — 현재는 두 버튼 모두 시나리오 상세로 돌아감. 처음엔 Tailwind `animate-ping`을 썼다가 시각적으로 더 자연스럽게 커스텀 키프레임(`call-ring`)으로 교체하는 과정에서, 클래스 이름을 `animate-call-ring`으로 지었더니 Tailwind v4가 이를 자기 유틸리티로 오인해 조용히 무시하는 버그를 발견 — `call-ring-pulse`로 개명해서 해결 (AGENTS.md에 규칙 추가).

## [2026-07-16] 회원 탈퇴 완료 화면 Figma 업데이트 반영
- 수정/생성 파일: src/app/(main)/settings/account/page.tsx, public/check.svg(삭제)
- 변경 내용: "탈퇴 완료" 확인 화면을 최신 Figma(node-id 28-825)에 맞춰 재구현 — 3D 체크 이미지 대신 파란 원+체크 아이콘(react-icons), 전체너비 파란 버튼 대신 작은 회색 "확인" 버튼(101×36px)으로 변경. 카드 크기는 처음엔 고정 px(246×305)로 넣었다가, 전역 글자 크기 조정 기능과 반응형 컨벤션에 맞춰 clamp 기반 패딩/최대너비로 다시 변경 — 기준 화면에서 목표 크기에 근접하면서 좁은 화면에서도 자연스럽게 줄어듦.
- 비고: 안 쓰이게 된 public/check.svg 삭제.

## [2026-07-16] 회원 탈퇴를 다시 별도 페이지로 전환 + 탈퇴사유 조건부 노출
- 수정/생성 파일: src/app/(main)/settings/account/page.tsx(재생성), src/app/(main)/settings/page.tsx, src/lib/routes.ts, AGENTS.md
- 변경 내용: 회원 탈퇴를 설정 페이지 내 모달에서 다시 `/settings/account` 전용 페이지로 전환 (Figma 업데이트: BackHeader+BottomNav가 있는 풀페이지로 디자인됨). "탈퇴사유" 텍스트 입력란은 "기타" 선택 시에만 노출되도록 변경. 강조색을 orange(#f2994a)에서 앱 기본 블루(#60a5fa)로 통일. 부제 텍스트를 "피싱안전교실을 떠나는 이유를 알려주세요."로 변경(서비스명 표기 통일, 로그인 페이지와 동일).
- 비고: 이전에 모달로 바꿨던 걸 다시 페이지로 되돌린 것 — Figma 쪽 디자인이 페이지 레이아웃(헤더/하단내비 포함)으로 업데이트되어 이를 반영함.

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
