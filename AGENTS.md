<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# 보이스쉴드 (VoiceShield) 프로젝트

보이스피싱 예방 교육을 위한 Next.js PWA. 실제 시나리오 학습, 긴급 신고 안내, TTS 기반 음성 시뮬레이션, AI 기반 학습 결과 분석을 제공한다. 현재 **프론트엔드 + 목데이터** 단계이며, 별도의 자체 백엔드 서버/DB는 없다 — `POST /api/tts`(Google Cloud TTS), `POST /api/analyze`(Google Gemini) 두 라우트만 실제 외부 서비스와 통신하고, 나머지는 전부 목데이터 또는 `localStorage`/`sessionStorage`로 동작한다.

## 기술 스택

- **Framework**: Next.js 16.2.10 (App Router, Turbopack)
- **Runtime**: React 19.2.4
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4
- **Icons**: react-icons v5
- **TTS**: `@google-cloud/text-to-speech` (서버 API 라우트 경유) — 실패 시 브라우저 `speechSynthesis`(Web Speech API)로 자동 폴백
- **AI 분석**: `@google/generative-ai` (Gemini, 서버 API 라우트 경유) — 시뮬레이션 완료 후 학습자 응답을 분석해 피드백 생성
- **Package manager**: npm

## 폴더 구조 규칙

```
src/
  app/
    page.tsx               # 로그인 화면 (US-01), ROUTES.login = "/"
    layout.tsx              # 루트 레이아웃 — FontScaleProvider, FOUC 방지 inline script
    globals.css              # 디자인 토큰(--text-*, --font-scale), 전역 규칙(cursor, user-select 등)
    api/
      tts/route.ts           # 실제 네트워크 통신 라우트 (Google Cloud TTS)
      analyze/route.ts       # 실제 네트워크 통신 라우트 (Google Gemini, 학습 결과 AI 분석)
    (main)/                  # 로그인 이후 라우트 그룹 — layout.tsx에서 BottomNav 렌더
      home/page.tsx          # US-02 메인 화면
      learn/
        page.tsx             # US-03 학습하기 (카테고리 필터, useSearchParams → 반드시 Suspense로 감쌀 것)
        [caseId]/page.tsx    # US-03 학습 시나리오 상세
        [caseId]/call/analysis/page.tsx  # US-03 전화 시뮬레이션 완료 후 AI 분석 결과 화면
        [caseId]/call/quiz/page.tsx      # US-03 마무리 퀴즈 (같은 시나리오의 다른 문항, 결과 화면에 추천학습·게스트 로그인 유도 배너 포함)
      emergency/page.tsx     # US-09 긴급 신고 안내
      settings/
        page.tsx             # US-10 설정
        account/page.tsx     # US-10 회원 탈퇴 (탈퇴 사유 → 완료 확인 모달)
  components/
    layout/                  # BackHeader(모든 하위 페이지 공통 뒤로가기 헤더), BottomNav
    cards/                   # ScenarioCard, ContinueLearningCard, RecommendedCard, CaseStatsGrid
    learn/                   # CategoryTagRow, QuizCard(전화 시뮬레이션 중 판단 퀴즈 — 선택 즉시 정답/오답 표시), ExitConfirmModal(통화 시뮬레이션 3화면 공용 "학습을 종료하시겠습니까?" 모달) 등 학습 페이지 전용 컴포넌트
    icons/                   # home-icons.tsx, kakao-icons.tsx 등 커스텀 SVG 아이콘
    providers/               # FontScaleProvider — localStorage 기반 전역 글자 크기 배율
  lib/
    routes.ts                # 전체 라우트 상수(US ID 주석 포함) — 경로는 항상 여기서 가져다 쓸 것
    mock-cases.ts             # PhishingCase 목데이터 (실제 DB 없음, 여기가 유일한 소스). 각 케이스는 `quiz`(전화 시뮬레이션 중 판단 퀴즈, 2문항)와 `finalQuiz`(마무리 퀴즈, 같은 주제의 다른 문항 1개)를 모두 가진다 — 새 케이스 추가 시 둘 다 채울 것
    case-meta.ts               # 카테고리/난이도 라벨·색상 매핑 (CATEGORY_META, DIFFICULTY_META)
    auth.ts                   # AUTH_STORAGE_KEY — localStorage 기반 mock 로그인 플래그
    sound.ts                   # playFeedbackTone — 퀴즈 정답/오답 효과음. 음원 파일 없이 Web Audio API 오실레이터로 합성 (QuizCard, 마무리 퀴즈 공용)
    analysis.ts                # sessionStorage 기반 AI 분석 입력값 저장/조회 (call/progress → call/analysis 화면 간 데이터 전달)
    progress.ts                 # localStorage 기반 케이스별 실제 학습 진행률 추적 (voiceshield-case-progress). `recordCaseProgress`로 call/progress·call/quiz에서 단계 진입 시 기록(dialogue 30%→quiz 60%→complete 90%→finalQuiz 100%+완료 처리), `recordAnalysisAccuracy`로 call/analysis에서 AI 분석 완료 시 퀴즈 정답률을 기록. `applyProgressOverride`(All)로 mock-cases.ts의 정적 completionRate/isCompleted를 실제 값으로 덮어씀. 홈/학습하기 화면의 "이어서 학습하기"·"최근 학습한 사례", 기록 화면의 전체 진행률/최근 진행한 학습이 모두 이 기록 기준으로 계산됨. 기록 화면의 "취약 유형"은 AI 분석을 본 적 있는 카테고리는 그 정답률(accuracy, <70이면 취약)로, 아직 분석을 안 본 카테고리는 completionRate(<50이면 취약)로 판단.
  types/index.ts               # 전역 타입 (PhishingCase, CaseCategory, CaseDifficulty, AnalyzeRequest, AiAnalysisResult 등)
public/
  manifest.json, logo.svg, learn-*.png/svg 등 PWA·정적 에셋
```

## 개발 원칙

### 백엔드 연결 대비 (현재는 없음)
- 실제 네트워크 호출은 `/api/tts`, `/api/analyze` 둘뿐이다. 그 외 시나리오 데이터, 로그인 상태, 알림 설정, 글자 크기 등은 전부 `lib/mock-cases.ts` 또는 `localStorage`로 관리된다.
- 라우트 간에 복잡한 구조화 데이터(예: 퀴즈 응답)를 넘겨야 할 때는 URL 쿼리스트링 대신 `sessionStorage`(캐시ID로 키를 구분)로 핸드오프한다 — `lib/analysis.ts`의 `saveAnalysisInput`/`readAnalysisInput` 패턴 참고. 저장된 값이 없으면(직접 URL 진입 등) 해당 화면은 이전 단계로 리다이렉트한다.
- 로그인/게스트 구분은 진짜 인증이 아니라 `lib/auth.ts`의 `AUTH_STORAGE_KEY`(`voiceshield-logged-in`) localStorage 플래그로만 판단한다. 백엔드가 붙기 전까지 이 패턴을 유지한다.
- 새 설정값을 추가할 때는 기존 localStorage 키 네이밍 규칙(`voiceshield-<feature>`, 예: `voiceshield-reminder-on`, `voiceshield-font-size`)을 따른다.

### 스타일링
- Tailwind CSS v4, 클래스 기반 스타일링만 사용한다.
- 반응형은 미디어쿼리 브레이크포인트보다 **컨테이너 쿼리 기반 `clamp(min, Ncqw, max)` 패턴을 우선 사용**한다 (`<body>`에 `@container` 적용됨, 예: `w-[clamp(50px,25cqw,100px)]`). 크기 조절이 아니라 특정 컨테이너 폭 기준으로 레이아웃 자체(`flex-row`↔`flex-col` 등)를 바꿔야 할 때는 `@[Npx]:` 형태의 임의값 컨테이너 쿼리 variant를 사용한다 (예: `flex-col @[450px]:flex-row` — 기본은 세로 배치, 컨테이너 폭이 450px 초과하면 가로 배치. `BottomNav`의 `@max-[410px]:px-7`도 같은 패턴).
- 한글 텍스트가 좁은 화면에서 단어 중간이 아니라 단어 단위로 줄바꿈되어야 하면 `break-keep`(= `word-break: keep-all`)을 명시한다. 지정하지 않으면 기본 CJK 줄바꿈 규칙 때문에 "확인한다"가 "확인한"/"다."처럼 음절 단위로 끊길 수 있다.
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
- `localStorage`/`sessionStorage` 값을 **`useState(() => 읽기)` 같은 lazy initializer로 렌더링 중 바로 읽으면 안 된다** — 서버 렌더링 시점에는 이 값이 항상 비어있어(브라우저 전용 API), 서버가 렌더링한 결과와 클라이언트 첫 렌더 결과가 달라지는 하이드레이션(hydration) 에러가 발생한다 (`call/analysis/page.tsx`에서 실제로 겪은 버그). 대신 초기 상태값은 서버·클라이언트 동일하게 고정하고(예: `useState(false)`, `useState("loading")`), 실제 값은 마운트 후 `useEffect` 안에서 읽어 `setState`한다 — 이때 `react-hooks/set-state-in-effect` 린트 규칙에 걸리는 것은 정상이며, 불가피한 경우이므로 `// eslint-disable-next-line react-hooks/set-state-in-effect -- ...` 주석으로 이유를 남기고 억제한다.

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

- **실제 네트워크 요청이 나가는 라우트는 두 개**다.
  - `POST /api/tts` (`src/app/api/tts/route.ts`) — Google Cloud TTS. 서비스 계정 키를 `.env.local`의 `GOOGLE_TTS_PROJECT_ID` / `GOOGLE_TTS_CLIENT_EMAIL` / `GOOGLE_TTS_PRIVATE_KEY`로 관리한다. 실패 시 브라우저 `speechSynthesis`로 자동 폴백한다.
  - `POST /api/analyze` (`src/app/api/analyze/route.ts`) — Google Gemini(`gemini-2.0-flash`, `@google/generative-ai`). 전화 시뮬레이션 퀴즈 결과를 받아 `responseSchema`로 구조화된 JSON 피드백(`feedback`/`responseSpeed`/`suspicion`/`goodPoints`/`missedPoints`/`actionTips`)을 생성한다. API 키는 `.env.local`의 `GOOGLE_GEMINI_API_KEY`(Google AI Studio에서 무료 발급). 정확도(`accuracy`)는 AI가 생성하지 않고 퀴즈 정답 여부로 클라이언트에서 직접 계산한다 — 수치 정확성을 LLM에 맡기지 않기 위함. 호출 화면(`call/analysis/page.tsx`)은 `useRef` 기반 dedup 가드로 감싸 React Strict Mode의 effect 이중 실행으로 인한 중복 호출(불필요한 API 비용)을 방지한다.
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

**실제 모바일 기기로 테스트할 때 주의**: `npm run dev`(HMR용 웹소켓 필요) + ngrok 조합은 실기기에서 JS가 아예 로드/실행되지 않는 문제가 실제로 있었다 (버튼 클릭 등 모든 onClick 상호작용이 무반응 — `<Link>`의 href 기반 네비게이션만 동작). 실기기 테스트는 `npm run build && npm run start`(프로덕션 빌드, HMR 없음)로 하거나 실제 배포(Vercel) URL로 할 것.

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
