<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# 보이스쉴드 (VoiceShield) 프로젝트

보이스피싱 예방 교육을 위한 Next.js PWA. 실제 시나리오 학습, 긴급 신고 안내, TTS 기반 음성 시뮬레이션을 제공한다. 현재 **프론트엔드 + 목데이터** 단계이며, 실제 백엔드 API는 없다 — `POST /api/tts`만 실제 외부 서비스(Google Cloud TTS)와 통신하고, 나머지는 전부 목데이터 또는 `localStorage`로 동작한다.

## 기술 스택

- **Framework**: Next.js 16.2.10 (App Router, Turbopack)
- **Runtime**: React 19.2.4
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4
- **Icons**: react-icons v5
- **TTS**: `@google-cloud/text-to-speech` (서버 API 라우트 경유) — 실패 시 브라우저 `speechSynthesis`(Web Speech API)로 자동 폴백
- **Package manager**: npm

## 폴더 구조 규칙

```
src/
  app/
    page.tsx               # 로그인 화면 (US-01), ROUTES.login = "/"
    layout.tsx              # 루트 레이아웃 — FontScaleProvider, FOUC 방지 inline script
    globals.css              # 디자인 토큰(--text-*, --font-scale), 전역 규칙(cursor, user-select 등)
    api/
      tts/route.ts           # 유일하게 실제 네트워크 통신이 있는 라우트 (Google Cloud TTS)
    (main)/                  # 로그인 이후 라우트 그룹 — layout.tsx에서 BottomNav 렌더
      home/page.tsx          # US-02 메인 화면
      learn/
        page.tsx             # US-03 학습하기 (카테고리 필터, useSearchParams → 반드시 Suspense로 감쌀 것)
        [caseId]/page.tsx    # US-03 학습 시나리오 상세
      emergency/page.tsx     # US-09 긴급 신고 안내
      settings/
        page.tsx             # US-10 설정
        account/page.tsx     # US-10 회원 탈퇴 (탈퇴 사유 → 완료 확인 모달)
  components/
    layout/                  # BackHeader(모든 하위 페이지 공통 뒤로가기 헤더), BottomNav
    cards/                   # ScenarioCard, ContinueLearningCard, RecommendedCard, CaseStatsGrid
    learn/                   # CategoryTagRow 등 학습 페이지 전용 컴포넌트
    icons/                   # home-icons.tsx, kakao-icons.tsx 등 커스텀 SVG 아이콘
    providers/               # FontScaleProvider — localStorage 기반 전역 글자 크기 배율
  lib/
    routes.ts                # 전체 라우트 상수(US ID 주석 포함) — 경로는 항상 여기서 가져다 쓸 것
    mock-cases.ts             # PhishingCase 목데이터 (실제 DB 없음, 여기가 유일한 소스)
    case-meta.ts               # 카테고리/난이도 라벨·색상 매핑 (CATEGORY_META, DIFFICULTY_META)
    auth.ts                   # AUTH_STORAGE_KEY — localStorage 기반 mock 로그인 플래그
  types/index.ts               # 전역 타입 (PhishingCase, CaseCategory, CaseDifficulty 등)
public/
  manifest.json, logo.svg, learn-*.png/svg 등 PWA·정적 에셋
```

## 개발 원칙

### 백엔드 연결 대비 (현재는 없음)
- 실제 네트워크 호출은 `/api/tts` 하나뿐이다. 그 외 시나리오 데이터, 로그인 상태, 알림 설정, 글자 크기 등은 전부 `lib/mock-cases.ts` 또는 `localStorage`로 관리된다.
- 로그인/게스트 구분은 진짜 인증이 아니라 `lib/auth.ts`의 `AUTH_STORAGE_KEY`(`voiceshield-logged-in`) localStorage 플래그로만 판단한다. 백엔드가 붙기 전까지 이 패턴을 유지한다.
- 새 설정값을 추가할 때는 기존 localStorage 키 네이밍 규칙(`voiceshield-<feature>`, 예: `voiceshield-reminder-on`, `voiceshield-font-size`)을 따른다.

### 스타일링
- Tailwind CSS v4, 클래스 기반 스타일링만 사용한다.
- 반응형은 미디어쿼리 브레이크포인트보다 **컨테이너 쿼리 기반 `clamp(min, Ncqw, max)` 패턴을 우선 사용**한다 (`<body>`에 `@container` 적용됨, 예: `w-[clamp(50px,25cqw,100px)]`).
- 텍스트 크기는 `globals.css`의 `--text-*`(xs/sm/base/xl/3xl) 토큰을 사용한다 — 전부 `calc(var(--font-scale, 1) * clamp(...))`로 감싸져 있어 설정 페이지의 "글자 크기 조정" 기능과 자동 연동된다. 임의 px보다 이 토큰을 우선 사용할 것.
- 카테고리/난이도 색상은 `lib/case-meta.ts`(`CATEGORY_META`, `DIFFICULTY_META`)가 유일한 출처다. 페이지마다 색상을 새로 정의하지 않는다.
- `overflow-hidden` + 절대 위치 자식 조합은 Chromium에서 부모 높이가 찌그러지는 버그가 있다 — hover 등 시각 효과는 `box-shadow: inset 0 0 0 999px rgba(...)` 방식을 우선 사용한다.
- `globals.css`에 커스텀 애니메이션 클래스를 추가할 때 클래스 이름을 **`animate-`로 시작하면 안 된다** — Tailwind v4가 이를 자기 유틸리티 네임스페이스로 가로채서, 매칭되는 테마 값이 없으면 `@layer components`에 직접 정의한 커스텀 클래스까지 조용히 무시해버린다(브라우저 콘솔 에러 없이 `animation-name: none`으로 렌더링됨). 커스텀 키프레임 클래스는 `call-ring-pulse`처럼 다른 접두사를 쓸 것 (`src/app/globals.css`의 `.call-ring-pulse` 참고).

### 컴포넌트
- 인터랙션(useState/이벤트 핸들러/localStorage)이 필요한 페이지는 `"use client"` — 이 프로젝트는 대부분의 페이지가 클라이언트 컴포넌트다.
- `useSearchParams()`를 쓰는 컴포넌트는 반드시 `<Suspense>`로 감싼 별도 하위 컴포넌트로 분리한다 — 그렇지 않으면 프로덕션 빌드가 prerender 단계에서 실패한다 (`/learn` 페이지에서 실제로 겪은 이슈).
- 여러 페이지에서 반복되는 UI(통계 그리드, 태그 행, 헤더 등)는 즉시 컴포넌트로 추출한다.

### 상태 관리
- 별도 상태관리 라이브러리 없이 **React Context + localStorage** 패턴을 사용한다. `FontScaleProvider`가 표준 예시: Context로 값 제공 + localStorage로 영속 + `layout.tsx`의 동기 inline `<script>`로 FOUC 방지.
- 새 전역 설정에서 FOUC(깜빡임)가 문제되면 `FontScaleProvider`의 패턴(마운트 전 inline script + `suppressHydrationWarning`)을 따른다.
- localStorage 값을 useEffect로 "읽기"와 "쓰기"를 분리하면 마운트 시점에 레이스 컨디션이 생길 수 있다 (읽기 effect의 상태 업데이트가 반영되기 전에 쓰기 effect가 구값으로 덮어씀). 쓰기는 상태를 변경하는 이벤트 핸들러 안에서 직접 수행한다.

## 기능 범위 (US ID는 `01. 유저스토리 - 시트1.pdf` 기준, `lib/routes.ts` 주석과 1:1 매핑)

| ID | 기능 | 라우트 | 상태 |
|----|------|--------|------|
| US-01 | 카카오 로그인 / 게스트 시작 | `/` | mock 구현 (localStorage 플래그만, 실제 OAuth 없음) |
| US-02 | 메인 화면 (진도율, 카테고리별 학습, 추천학습) | `/home` | 구현 |
| US-03 | 학습하기(카테고리 필터) / 시나리오 상세 | `/learn`, `/learn/[caseId]` | 구현 |
| US-04~08 | 미확인 (기록 탭 포함, 유저스토리 문서 재확인 필요) | `기록` 탭(`BottomNav`에서 `placeholder: true`) | 미구현 |
| US-09 | 긴급 신고 안내 (112/1332, 대응·예방 수칙) | `/emergency` | 구현 |
| US-10 | 설정 (글자 크기, TTS, 알림, 로그아웃/회원탈퇴) | `/settings`, `/settings/account` | 구현 |

## 데이터/API 현황

- **실제 네트워크 요청이 나가는 건 `POST /api/tts` 하나뿐**이다 (`src/app/api/tts/route.ts`). Google Cloud TTS 서비스 계정 키를 `.env.local`의 `GOOGLE_TTS_PROJECT_ID` / `GOOGLE_TTS_CLIENT_EMAIL` / `GOOGLE_TTS_PRIVATE_KEY`로 관리한다. 실패 시 브라우저 `speechSynthesis`로 자동 폴백한다.
- 시나리오/사례 데이터는 `lib/mock-cases.ts`의 `MOCK_CASES` 배열이 유일한 소스다. 실제 DB 연결 전까지 여기에 추가한다.
- 로그인 상태·알림 설정·글자 크기 등은 전부 `localStorage`(`voiceshield-*` 키)로 관리되며 서버에는 저장되지 않는다.
- 매일 학습 알림은 서비스워커/Web Push가 아니라 **탭이 열려 있는 동안만 동작하는 `setTimeout` 기반 로컬 알림**이다. iOS Safari는 홈 화면에 추가해도 이 방식으로는 알림이 오지 않을 가능성이 높다 (Web Push + 서비스워커 필요).

## 사용자 역할

사용자는 아래 3개 용어로 구분한다. **새 기능을 만들 때는 반드시 이 중 어디에 해당하는지 정하고, 회원 전용이면 게스트 게이팅(비활성화 스타일 + 로그인 안내 모달)을 적용한다.**

- **학습자 (전체)**: 게스트 + 회원을 모두 포함하는 가장 넓은 개념. 별도 언급이 없으면 새 기능은 기본적으로 이 레벨(로그인 여부 무관 접근 가능)로 만든다.
- **게스트**: 학습자 중 미로그인 상태. `voiceshield-logged-in`이 없거나 `"false"`. 회원 전용 기능은 비활성화 스타일로 보여주고, 클릭 시 로그인 안내 모달이 뜬다 (예: "매일 학습 알림" 토글 — `src/app/(main)/settings/page.tsx`의 `isLoggedIn` 가드 참고).
- **회원 (Kakao 로그인, mock)**: 학습자 중 로그인 상태. `voiceshield-logged-in`이 `"true"`. 회원 전용 기능까지 전부 이용 가능. 로그아웃 시 이 플래그와 회원 전용 설정(알림 등)이 모두 초기화되어, 재로그인해도 다시 꺼진 상태로 시작한다.

**게이팅 구현 시 주의**: 토글/버튼의 표시 상태(색상, 체크 여부, 하위 카드 노출 등)는 해당 상태값 하나만이 아니라 반드시 `isLoggedIn && <상태값>` 형태로 회원 여부와 함께 조건을 걸 것 — localStorage에 남아있는 이전 값(stale state) 때문에 게스트인데도 활성화된 것처럼 보이는 버그가 실제로 있었다 (`알림 시간` 카드가 게스트에게도 보이던 문제).

### 현재 기능별 접근 범위

| 기능 | 접근 범위 |
|------|-----------|
| 홈, 학습하기, 시나리오 상세, 긴급 신고 안내 | 학습자(전체) — 게스트도 이용 가능 |
| 글자 크기 조정, TTS 속도/음성 설정 | 학습자(전체) |
| 매일 학습 알림 (토글·시간 설정·알림 예약) | 회원 전용 — 게스트는 비활성화 + 로그인 안내 모달 |
| 회원 탈퇴 | 회원 전용 |

## 개발 명령어

```bash
npm run dev        # 개발 서버 (localhost:3000, Turbopack)
npm run build       # 프로덕션 빌드
npm run start        # 프로덕션 서버 실행
npm run lint          # ESLint 검사
npx tsc --noEmit        # 타입 체크
```

## UI 검증 워크플로우

UI를 변경했다면 실제 렌더링으로 검증한다:
1. `npm install --no-save playwright` — package.json에 저장하지 않는 임시 설치
2. 스크린샷/상호작용으로 검증 (모바일 뷰포트 포함, `devices["iPhone 13"]` 등)
3. 검증 후 `npm uninstall playwright` + 임시 테스트 스크립트 삭제 + 개발 서버 프로세스 종료까지 반드시 정리한다

# UI conventions

- Every clickable element must show `cursor: pointer`. All native `<button>` elements get this automatically via the global `button { cursor: pointer; }` rule in `src/app/globals.css` — do not remove it. Any `<div>`/`<span>`/etc. acting as a button via `onClick` (not a native `<button>` or `<a>`) needs `cursor-pointer` added explicitly in its className.

## 변경 이력 관리

기능을 구현하거나 수정할 때마다 `CHANGELOG.md` 파일에 아래 형식으로 기록을 추가할 것 (기존 내용은 지우지 말고 맨 위에 추가):

```
## [날짜] 기능명
- 수정/생성 파일: src/app/(main)/settings/page.tsx
- 변경 내용: 매일 학습 알림 토글에 로그인 필요 게이팅 추가
- 비고: 실제 백엔드 인증 붙기 전까지는 localStorage mock으로 대체
```
