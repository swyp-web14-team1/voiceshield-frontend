# CHANGELOG

기능을 구현하거나 수정할 때마다 아래 형식으로 최상단에 추가한다 (기존 내용은 지우지 않음).

## [2026-07-18] 첫 대사 TTS 프리페치로 체감 속도 개선 + 말하는 대사 텍스트 색상 복원 + 종료 모달 반응형
- 수정/생성 파일: src/lib/tts.ts, src/app/learn/[caseId]/call/page.tsx, src/app/learn/[caseId]/call/progress/page.tsx
- 변경 내용:
  1. **"시작하기" 눌렀을 때 TTS가 너무 늦게 나온다"는 피드백으로 첫 대사 프리페치 추가**: `src/lib/tts.ts`에 `(text, voice, rate)` 조합을 키로 하는 `/api/tts` 요청 캐시(`prefetchTts`)를 추가하고, 수신 전화(벨 울리는) 화면이 마운트되자마자 첫 번째 발신자 대사를 미리 요청해둠. 사용자가 벨소리를 보고 "시작하기"를 누르기까지의 시간(최소 1~2초) 동안 네트워크 요청이 이미 진행되므로, 통화 진행 화면에 도착했을 때 대부분 즉시(또는 훨씬 빨리) 재생 가능. `playLine`도 같은 캐시 함수를 사용하도록 통일해 중복 요청 없이 프리페치 결과를 그대로 이어받음.
  2. **말하는 대사만 진하고 나머지는 30% 회색이던 것을 되돌림**: "그냥 원래색으로 하자" 피드백에 따라 대사 텍스트는 항상 원래 색(`#1a2332`)으로 표시하고, 말하는 중인 대사인지 여부는 빨간 테두리로만 구분.
  3. **학습 종료 확인 모달**: 카드 크기를 360×206px 기준으로 `clamp()` 반응형 전환, 종료하기/계속하기 버튼 높이도 고정 44px에서 `clamp(36px, 12cqw, 44px)`로 반응형화.
- 비고: Playwright로 확인한 결과, 프리페치 덕분에 벨 화면에서 이미 1건의 `/api/tts` 요청이 나가고, 통화 진행 화면에서 같은 대사에 대해 중복 요청이 발생하지 않음을 확인함.

## [2026-07-18] 퀴즈 카드 패딩 반응형 전환(축소) + 질문 텍스트 단어 단위 줄바꿈
- 수정/생성 파일: src/app/learn/[caseId]/call/progress/page.tsx
- 변경 내용: 퀴즈 카드의 고정 px 패딩(헤더 `px-4 py-2.5`, 선택지 영역 `px-8 pt-6.25 pb-5.5`, 버튼 `px-3.5 py-3`)을 전반적으로 줄이면서 `clamp(min, Ncqw/cqh, max)` 기반 반응형으로 전환. 퀴즈 질문 텍스트에 `break-keep`(`word-break: keep-all`)을 추가해 글자 단위가 아니라 단어(공백) 단위로만 줄바꿈되도록 함.
- 비고: AGENTS.md의 컨테이너 쿼리 clamp 반응형 규칙을 뒤늦게 반영 — 처음 패딩을 넣을 때 고정 px로 만들었다가 "반응형 잘 좀 해봐, 패딩 좀 줄이고"라는 피드백을 받고 다시 손봄.

## [2026-07-18] 통화 진행 화면 헤더 아이콘/발신자 아바타 색상 미세조정
- 수정/생성 파일: src/app/learn/[caseId]/call/progress/page.tsx
- 변경 내용: 종료(X)/음소거 아이콘 크기를 반응형으로 키움(X: `clamp(15px,4.5cqw,19px)`, 스피커: `clamp(15px,5cqw,21px)`, 최소 15px 유지). 두 아이콘의 위치 패딩을 좌우 16px→26px, 상단 clamp(16~21px)→고정 20px로 조정. 발신자 아바타 원 배경색을 `bg-gray-700`에서 `#1a2332`로 변경.

## [2026-07-18] 카라오케 글자 채움 효과 롤백 + 퀴즈 등장 지연/패딩 조정
- 수정/생성 파일: src/app/learn/[caseId]/call/progress/page.tsx
- 변경 내용: 바로 전에 추가한 카라오케식 글자 채움 효과("글자채우는거다시 되돌려놔" 요청)를 롤백 — `speakProgress` state, `playLine`의 `requestAnimationFrame`/`onboundary` 진행률 추적, 말풍선의 글자별 `<span>` 렌더링을 모두 제거하고 말하는 중엔 텍스트 전체가 한 번에 진한 색이 되는 이전 방식으로 되돌림. 퀴즈 카드 등장 지연을 600ms로 재조정(400→200→600). 대화 영역과 퀴즈 선택지 영역의 패딩을 Figma 기준으로 맞춤 — 채팅 영역 좌우 패딩 20px→38px, 퀴즈 선택지 영역 패딩을 `p-3`(12px 전체)에서 좌우 38px/위 25px/아래 22px로 세분화.

## [2026-07-18] 말하는 대사 카라오케식 글자 채움 효과 + 오답 효과음 톤 수정
- 수정/생성 파일: src/app/learn/[caseId]/call/progress/page.tsx
- 변경 내용: 말하는 중인 대사가 30% 옅은 색 → 진한 색으로 한번에 바뀌던 것을, 실제 오디오 재생 위치(`currentTime`/`duration`)에 맞춰 글자가 앞에서부터 하나씩 진한 색으로 채워지는 카라오케 효과로 바꿈. `speakProgress`(0~1) state를 `requestAnimationFrame`으로 갱신해 각 글자(`Array.from(line.text)`)의 색을 개별 `<span>`으로 제어. 브라우저 `speechSynthesis` 폴백 경로에서는 `utterance.onboundary`의 `charIndex`를 사용해 마찬가지로 진행률을 맞춤.
- 비고: Google Cloud TTS REST 응답에는 단어별 타임스탬프가 없어서, 정확한 발음 타이밍이 아니라 "오디오 재생 시간에 비례해 균등하게 채워지는" 근사 방식임 — 그래도 시각적으로는 자연스러운 카라오케 효과로 보임. 오답 시 효과음이 "땡(bright ding)"이 아니라 "뚱(dull thud)"처럼 들린다는 피드백을 받아, sawtooth 220→140Hz 하강음에서 triangle 880Hz 단발음으로 교체해 더 밝고 짧은 버저음으로 수정. 퀴즈 카드 등장 지연도 400ms→200ms로 단축.

## [2026-07-18] 웨이브폼을 Figma 실제 막대로 애니메이션 + 퀴즈 타이밍/오답 효과음 조정
- 수정/생성 파일: src/app/learn/[caseId]/call/progress/page.tsx, src/app/globals.css, src/lib/waveform-bars.ts(신규), public/call-waveform.svg(삭제)
- 변경 내용:
  1. **웨이브폼을 실제 디자인 막대로 개별 애니메이션**: 정적 아이콘(idle)과 대충 흉내낸 개별 막대(active)를 상태에 따라 다르게 렌더링하던 방식이 "디자인이 아니다"라는 피드백을 받아, Figma 원본 SVG(`imgUnion`, node-id 34-775)의 Union 경로를 30개의 개별 막대 path로 실제로 분해(`src/lib/waveform-bars.ts`)해 항상 동일한 실제 디자인을 그리고, 말하는 중일 때만 막대마다 서로 다른 지연시간(0~0.75s)·재생시간(1.6~2.35s)으로 살짝(scaleY 0.85~1.12) 흔들리도록 함 — 이전에 시도했던 손으로 어림잡은 막대 배열은 삭제.
  2. **웨이브폼 속도**: 처음 붙인 애니메이션이 너무 빨라 보인다는 피드백으로 재생시간을 0.9~1.35s → 1.6~2.35s로 늦춤.
  3. **퀴즈 등장 타이밍**: 마지막 대사가 나타난 뒤 퀴즈 카드가 뜨기까지의 대기시간을 400ms → 200ms로 단축.
  4. **오답 효과음**: 정답 선택 시 "띵동" 차임벨만 있고 오답에는 아무 소리가 없던 것을, 오답 선택 시 낮은 톤이 아래로 떨어지는 "땡" 버저음(sawtooth, 220Hz→140Hz)이 나도록 추가.
- 비고: SVG의 Union 경로를 개별 막대로 분해하기 위해 각 서브패스(M...Z)를 파싱하는 임시 Node 스크립트를 스크래치패드에서 실행해 좌표를 추출함 — 처음엔 단순히 경로 안의 숫자를 x,y 쌍으로 순서대로 묶어 바운딩박스를 구했다가 `V`(수직선) 커맨드가 좌표 하나만 갖는다는 걸 놓쳐서 잘못된 값이 나왔고, 커맨드별로 제대로 좌표를 추적하는 파서로 다시 작성해 해결함.

## [2026-07-17] 전화 시뮬레이션 오디오 컨트롤 버그 수정 + 말하는 대사 강조 + 순차 등장 애니메이션
- 수정/생성 파일: src/app/learn/[caseId]/call/progress/page.tsx, src/app/globals.css
- 변경 내용:
  1. **음소거 버그**: 재생 중 음소거를 눌러도 소리가 안 끊기던 문제 수정 — `muted`가 true로 바뀌는 순간 `audioRef`를 pause하고 speechSynthesis도 cancel하도록 함. 다만 단순히 pause만 하면 `ended` 이벤트가 안 와서 다음 대사로 못 넘어가고 멈춰버리는 문제가 있어, `audio.onpause`도 재생 완료로 취급해 `ended` Promise를 resolve하도록 함께 수정.
  2. **페이지 이동 시 오디오 안 끊기던 문제**: 컴포넌트 언마운트 시 오디오를 정지하는 cleanup effect를 추가하고, 종료 확인 모달의 "종료하기" 버튼에서도 라우팅 전에 명시적으로 오디오/음성합성을 정지하도록 함.
  3. **말하는 대사 강조**: Figma(node-id 38-958) 기준, 현재 TTS로 읽고 있는 대사 말풍선은 빨간 테두리(`rgba(255,0,0,0.3)`)+본문 텍스트 진하게, 그 외 대사는 테두리 없이 텍스트를 30% 옅게(`rgba(26,35,50,0.3)`) 표시하도록 함.
  4. **말풍선 순차 등장 애니메이션**: 대사가 처음부터 전부 보이던 것을, 각 대사가 자기 차례(재생 시작 시점)가 됐을 때 아래에서 위로 살짝 슬라이드하며 페이드인(`bubble-enter`, translateY 12px→0 + opacity)되도록 변경 — `revealedCount` state로 지금까지 등장한 대사 개수만 슬라이스해서 렌더링.
  5. **웨이브폼 애니메이션 자연스럽게**: 웨이브폼 전체를 하나로 묶어 "숨쉬듯" 펄스시키던 방식이 부자연스럽다는 피드백을 받아, 다시 개별 막대(37개) 각각이 서로 다른 지연시간/재생시간(`i % 6`, `i % 4` 기반)으로 위아래 늘었다 줄었다 하는 방식으로 되돌림 — 단, 말하지 않을 때는 Figma 원본 SVG 아이콘(`public/call-waveform.svg`)을 정적으로 보여주고, 실제로 말하는 중일 때만 개별 막대 애니메이션으로 전환.
  6. **스피커 버튼 색상**: 음소거 아이콘 버튼을 항상 `text-white/90`로 쓰던 것을, 켜짐(스피커 나옴) 상태는 흰색, 음소거 상태는 회색(`text-gray-500`)으로 구분.
- 비고: 웨이브폼을 하나의 SVG로 통일했다가 "각 막대가 다른 타이밍으로 움직여야 한다"는 피드백을 받고 다시 막대 방식으로 되돌린 시행착오가 있었음 — 정적 아이콘(디자인 정확도)과 개별 막대 애니메이션(자연스러운 움직임) 둘 다 필요해서 상태에 따라 렌더링 방식 자체를 다르게 분기하는 방식으로 절충함.

## [2026-07-17] 통화 진행 화면 웨이브폼을 Figma 원본 아이콘으로 교체 + 말할 때만 애니메이션
- 수정/생성 파일: src/app/learn/[caseId]/call/progress/page.tsx, src/app/globals.css, public/call-waveform.svg(신규)
- 변경 내용: 직접 CSS 막대(bar)로 흉내 낸 웨이브폼이 Figma 디자인(node-id 34-775, `imgUnion` 에셋)과 다르다는 피드백을 받고, 해당 노드를 SVG로 직접 다운로드해 `public/call-waveform.svg`로 저장 후 `next/image`로 교체 — 실제 디자인과 동일한 촘촘한 막대 패턴이 됨(배경 사각형은 Figma 캔버스 내보내기 잔재라 제거하고 fill을 흰색으로 변경). 웨이브폼 전체에 은은한 "숨쉬는" 펄스 애니메이션(`call-waveform-pulse`, scaleY 0.85~1.05 + opacity)을 추가하되, TTS가 실제로 재생 중일 때(`playingLineIndex !== null`)만 적용되고 그 외에는 정적으로 보이도록 함.
- 비고: 처음에 37개의 `<span>` 막대를 개별 애니메이션시키는 방식으로 만들었다가 "너무 이상하다"는 피드백을 받음 — 지연시간이 애니메이션 주기보다 길어 막대들이 뒤죽박죽으로 움직이는 문제였음. 이후 실제 디자인이 하나의 고정된 SVG 아이콘이라는 걸 다시 확인하고, 개별 막대 애니메이션 대신 아이콘 전체를 은은하게 펄스시키는 방식으로 단순화함. Playwright 검증 중 자동재생 정책 때문에 오디오 재생이 막혀 "말하는 중" 상태를 재현하지 못하는 현상을 겪었는데, 이는 헤드리스 브라우저의 autoplay 정책 아티팩트였고 `--autoplay-policy=no-user-gesture-required` 플래그로 재현·확인함 (실제 앱 동작과는 무관).

## [2026-07-17] 퀴즈 중앙 정답 팝업 제거 + 오답 선택지에 회색 + X 표시 추가
- 수정/생성 파일: src/app/learn/[caseId]/call/progress/page.tsx, src/app/globals.css
- 변경 내용: 화면 중앙에 뜨던 초록색 "정답입니다!" 팝업(+ 관련 `quiz-correct-pop` 키프레임)을 제거함 (띵동 효과음은 유지). 대신 오답을 선택하면 정답 선택지의 남색 그라데이션+체크 표시와 대칭되도록, 선택한 오답 버튼이 회색(`bg-gray-300`) 배경에 X 표시(`IoClose`)로 바뀌도록 추가.
- 비고: 정답/오답 모두 선택지 버튼 자체의 색상+아이콘 변화만으로 피드백을 주는 방식으로 통일함 — 별도 오버레이 팝업 없이도 한눈에 정답 여부를 알 수 있음.

## [2026-07-17] 퀴즈 정답 선택지에 진한 남색 그라데이션 + 체크 표시 추가
- 수정/생성 파일: src/app/learn/[caseId]/call/progress/page.tsx
- 변경 내용: 퀴즈에서 정답을 선택하면, 선택한 버튼 자체가 회색 하이라이트 대신 헤더와 동일한 `HEADER_GRADIENT`(진한 남색, `linear-gradient(165deg, #1a2035 0%, #2d1f4e 100%)`) 배경 + 흰 텍스트로 바뀌고 오른쪽에 체크 아이콘(`IoCheckmark`)이 나타나도록 추가. 기존 중앙 "정답입니다!" 팝업/띵동 효과음과 함께 동작함 (팝업이 사라진 뒤에도 선택지 자체의 강조는 다음 문항으로 넘어가기 전까지 남아있음).
- 비고: 오답 선택 시에는 기존과 동일하게 회색(bg-gray-200) 하이라이트만 표시함.

## [2026-07-17] 퀴즈 정답 시 띵동 효과음 + 중앙 "정답입니다!" 팝업 추가
- 수정/생성 파일: src/app/learn/[caseId]/call/progress/page.tsx, src/app/globals.css
- 변경 내용: 통화 진행 화면의 퀴즈에서 정답을 선택하면, Web Audio API로 합성한 2음(E6→C6) "띵동" 차임벨을 재생하고 화면 중앙에 초록 체크 아이콘 + "정답입니다!" 팝업이 0.9초간 나타났다 사라지도록 추가. 다음 문항/완료 화면으로 넘어가는 지연 시간도 700ms→900ms로 늘려 팝업이 보일 시간을 확보함.
- 비고: 오답 선택 시에는 기존과 동일하게 선택 표시만 되고 별도 팝업은 띄우지 않음 (요청 범위가 정답 케이스였음, 완료 화면에서 문항별 정답/오답 리캡을 이미 보여주고 있어 오답까지 팝업을 넣으면 중복이라 판단). 팝업 애니메이션은 Tailwind 커스텀 클래스 대신 인라인 `style={{ animation: ... }}`으로 `globals.css`의 `@keyframes quiz-correct-pop`을 직접 참조해 `animate-` 접두사 충돌 문제를 애초에 피함. 음소거 상태면 띵동도 재생하지 않도록 `mutedRef`를 재사용함. Playwright로 오실레이터 2개가 실제로 시작되는지, 팝업이 렌더링되는지 확인함.

## [2026-07-17] 전화 시뮬레이션 첫 대사 이중 재생 방지 + 대사 종료 시 자동 스크롤
- 수정/생성 파일: src/app/learn/[caseId]/call/progress/page.tsx
- 변경 내용: (1) 첫 번째 대사에서 목소리 두 명이 겹쳐 읽는 것처럼 들리던 문제 수정 — 클라우드 TTS 오디오의 `.play()`가 (자동재생 정책 등으로) 실패해 브라우저 `speechSynthesis` 폴백으로 넘어가는 경로에서, 실패했던 오디오 엘리먼트를 완전히 멈추지 않아 나중에 뒤늦게 재생되며 폴백 음성과 겹치던 것이 원인 — catch 진입 시 `audio.pause(); audio.src = ""`로 확실히 정지시킴. 재생 요청마다 증가하는 토큰(`playTokenRef`)으로 오래된 재생 요청이 뒤늦게 오디오를 재생하는 경우도 함께 방지. (2) 모바일에서 퀴즈 카드가 화면 아래 고정되며 대화 영역이 좁아져 매번 수동으로 스크롤해야 했던 문제 수정 — 각 대사의 TTS 재생이 끝날 때마다 그 말풍선이 대화 영역 맨 위로 오도록 자동 스크롤.
- 비고: 대사 종료 시점에 스크롤을 시도해도, 그 시점엔 아직 퀴즈 카드가 뜨기 전이라 대화 영역이 넉넉해서(스크롤할 내용 자체가 없어서) 스크롤이 아무 효과가 없던 케이스가 있었음 — 퀴즈 카드가 실제로 나타나 대화 영역이 좁아지는 시점(`phase === "quiz"`)에도 마지막 발신자 대사를 다시 맨 위로 올리는 스크롤을 한 번 더 시도하도록 보강. `scrollIntoView` 대신 컨테이너·타깃 엘리먼트의 `getBoundingClientRect()` 차이로 직접 오프셋을 계산해 스크롤(`container.scrollTo`)하는 방식을 사용 — 레이아웃이 막 바뀌는 타이밍에도 스크롤 대상이 어긋나지 않음.

## [2026-07-17] 설정 페이지 이탈 시 TTS 미리듣기 오디오가 안 끊기던 문제 수정
- 수정/생성 파일: src/app/(main)/settings/page.tsx
- 변경 내용: TTS 음성 미리듣기 재생 중 BottomNav로 다른 탭(홈/학습 등)으로 이동해도 오디오가 멈추지 않고 계속 재생되던 문제 수정. 컴포넌트 unmount 시 `audioRef`의 오디오를 pause하고 `speechSynthesis.cancel()`도 호출하는 cleanup effect 추가.
- 비고: 기존에도 음성 버튼을 다시 누를 때는 `audioRef.current?.pause()`로 이전 재생을 끊었지만, 페이지 자체를 벗어나는 경우(라우트 이동)는 처리하지 않아 발생한 문제였음.

## [2026-07-17] 설정의 TTS 음성/속도 선택을 실제로 저장·적용
- 수정/생성 파일: src/lib/tts.ts(신규), src/app/(main)/settings/page.tsx, src/app/learn/[caseId]/call/progress/page.tsx
- 변경 내용: 설정 페이지의 "TTS 속도 변경"/"TTS 음성 설정"이 컴포넌트 state에만 있고 localStorage에 저장되지 않아, 다른 화면에는 전혀 반영되지 않던 문제를 수정. `voiceshield-tts-voice`/`voiceshield-tts-speed` 키로 저장하도록 하고, 전화 시뮬레이션(통화 진행 화면)의 TTS 재생(`/api/tts` 호출 및 `speechSynthesis` 폴백)이 이 저장된 값을 읽어서 사용하도록 연결함.
- 비고: TTS_SPEEDS/TTS_VOICES 상수와 저장 키, 읽기 헬퍼(`getStoredTtsPreference`)를 `src/lib/tts.ts`로 분리해 설정 페이지와 전화 시뮬레이션 페이지가 동일한 값을 공유하도록 함 (`lib/auth.ts`의 `AUTH_STORAGE_KEY` 패턴과 동일). Playwright로 설정에서 V3/X1.5로 바꾼 뒤 통화 시뮬레이션의 실제 `/api/tts` 요청 바디에 `voice:"V3", rate:1.5`가 반영되는 것을 확인함.

## [2026-07-17] 전화 시뮬레이션 오디오 개선 (자동 TTS 재생 + 수신 벨소리 추가 후 제거)
- 수정/생성 파일: src/app/learn/[caseId]/call/progress/page.tsx, src/app/learn/[caseId]/call/page.tsx
- 변경 내용: 통화 진행 화면에서 "다시 듣기"를 눌러야만 재생되던 대사를, 시뮬레이션 시작/재시작 시 발신자 대사를 순서대로 자동 TTS 재생하도록 변경 (`playLine`이 오디오 종료 시점까지 대기하는 Promise를 반환하도록 재작성해 순차 재생 구현, 재생이 모두 끝나면 퀴즈 단계로 자동 전환 — 기존 고정 1.4초 타이머 방식 제거).
- 비고: 수신 전화(벨 울리는) 화면에 Web Audio API 오실레이터로 합성한 벨소리도 추가해봤으나("소리 너무 이상한데") 사용자가 바로 제거 요청 — 별도 오디오 에셋 없이 합성음으로 실제 벨소리를 만드는 시도는 품질이 기대에 못 미쳐 롤백함, 해당 화면은 시각적 링 펄스 이펙트만 유지. TTS 자동 재생은 `mutedRef`로 최신 음소거 상태를 참조해, 재생 도중 음소거를 켜면 다음 대사부터 바로 반영되도록 함.

## [2026-07-17] 전화 시뮬레이션(통화 진행/퀴즈/완료 화면) 신규 구현
- 수정/생성 파일: src/app/learn/[caseId]/call/progress/page.tsx(신규), src/app/learn/[caseId]/call/page.tsx, src/lib/routes.ts, src/types/index.ts, src/lib/mock-cases.ts, src/app/globals.css
- 변경 내용: Figma(node-id 33-673, 34-775, 34-869, 34-926, 34-944) 기준 "보이스 시뮬레이션(진행중/문제/완료)" 화면을 하나의 페이지(`/learn/[caseId]/call/progress`)에서 상태 전환으로 구현. 대화 내용(다시 듣기 → `/api/tts` 재생, 실패 시 `speechSynthesis` 폴백) → 퀴즈 2문항(선택 시 하이라이트 후 자동 다음 단계로 전환) → 완료 화면(문항별 정답/오답 리캡 + "올바른 대응 N/2회") 순으로 진행. 상단 X 버튼은 "학습을 종료 하시겠습니까?" 확인 모달을 띄우고, 음소거 토글(`IoVolumeHigh`/`IoVolumeMute`)로 "다시 듣기" 음성 재생을 켜고 끌 수 있음. 수신 전화 화면의 "시작하기" 버튼이 이 화면으로 연결되도록 변경.
- 비고: 퀴즈 문항은 Figma의 예시 문구(소방기관 사칭)를 그대로 쓰지 않고, `MOCK_CASES`의 실제 5개 시나리오별 `phoneDialogue` 내용에 맞춰 `callerLabel`/`quiz` 필드를 새로 추가해 case별로 다르게 작성함. "AI 분석 결과 보기", "마무리 퀴즈 하러 가기" 버튼은 실제 기능(US-04~08, AI 분석)이 아직 없어 "(준비중)" 표기와 함께 비활성화 상태로만 배치함 — 가짜 데이터를 만들어 채우지 않음.

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
