# CHANGELOG

기능을 구현하거나 수정할 때마다 아래 형식으로 최상단에 추가한다 (기존 내용은 지우지 않음).

## [2026-07-21] `QuizResultCard` 추출 시 임의로 통일했던 배지+질문 줄 레이아웃을 각 페이지 원래 디자인대로 복원
- 수정 파일: `src/components/learn/QuizResultCard.tsx`, `src/app/learn/[caseId]/message/progress/page.tsx`
- 변경 내용: 직전 추출 때 call/progress(항상 가로 정렬)와 message/progress(좁으면 세로, 450px 이상에서 가로) 중 message 쪽으로 임의 통일했는데, 이는 순수 리팩터링 범위를 벗어난 디자인 변경이었음(사용자 확인 없이 call/progress의 기존 모습이 바뀜). `stackOnNarrow` prop을 추가해 기본값(false)은 call/progress의 원래 방식(항상 가로), message/progress에서만 `stackOnNarrow`를 명시적으로 켜서 원래의 반응형 스택 방식을 그대로 복원 — 두 페이지 모두 추출 이전과 동일한 디자인으로 되돌아감.

## [2026-07-21] 전화·문자 시뮬레이션 완료 화면의 판단 퀴즈 결과 카드를 `QuizResultCard` 컴포넌트로 추출
- 수정/생성 파일: `src/components/learn/QuizResultCard.tsx`(신규), `src/app/learn/[caseId]/call/progress/page.tsx`, `src/app/learn/[caseId]/message/progress/page.tsx`
- 변경 내용: "선택N 배지 + 정답/오답 pill(아이콘 포함) + 정확합니다!/위험합니다 라벨 + 회색 해설 박스" 카드가 두 화면에서 거의 그대로 중복돼 있었음(call은 여러 퀴즈를 반복 렌더링, message는 퀴즈 1개). `index`, `question`, `isCorrect`, `chosenLabel`, `explanation` props만 받는 `QuizResultCard`로 추출. 배지+질문 줄 레이아웃이 call은 항상 가로 정렬(`flex items-start`), message는 좁은 컨테이너에서 세로로 쌓이는 반응형(`@[450px]:flex-row`)으로 서로 달랐는데, 추출하면서 message 쪽(더 안전한 반응형 버전)으로 통일함 — 500px 셸 폭에서는 어차피 항상 가로 정렬이라 실사용에는 차이 없음.
- 비고: Playwright로 통화 시뮬레이션을 판단 퀴즈 2개까지 풀어 "시뮬레이션 완료" 화면에서 `QuizResultCard`가 정상 렌더링되는지 확인.

## [2026-07-21] 전화·문자 시뮬레이션 완료 화면 공용 액션 버튼을 `SimulationCompleteActions` 컴포넌트로 추출
- 수정/생성 파일: `src/components/learn/SimulationCompleteActions.tsx`(신규), `src/app/learn/[caseId]/call/progress/page.tsx`, `src/app/learn/[caseId]/message/progress/page.tsx`
- 변경 내용: "다시 하기 / AI 분석 결과 보기 / 마무리 퀴즈 하러 가기" 3개 버튼이 두 화면에서 className까지 완전히 동일하게 중복돼 있었음(다만 문자 쪽은 아이콘이 빠져 있었음 — 통일하면서 아이콘도 맞춤). `caseId`, `onRestart`, `analysisInput`(`AnalyzeRequest`)만 props로 받는 공용 컴포넌트로 추출해 두 페이지 모두 이걸 사용하도록 교체. 각 페이지에 남아있던 `saveAnalysisInput`/`RiShiningLine`/(문자 쪽은 `MdOutlineReplay`) 관련 import도 더는 필요 없어져 정리.
- 비고: Playwright로 통화 시뮬레이션을 실제로 판단 퀴즈 2개까지 풀어 "시뮬레이션 완료" 화면까지 진행시켜 컴포넌트가 정상 렌더링되는지 확인.

## [2026-07-21] 마지막 대사 스크롤 여백(spacer) 로직 제거 — 그냥 자연스럽게 최대한 위로만 스크롤
- 수정 파일: `src/app/learn/[caseId]/call/progress/page.tsx`
- 변경 내용: 직전 두 차례 수정(고정 `60cqh` 여백 → 동적 계산+96px 상한 여백)까지도 여전히 부자연스럽다는 피드백을 받아, 여백을 만들어 억지로 "정확히 맨 위"까지 끌어올리는 접근 자체를 포기함. `scrollLastLineToTop`/`scrollSpacerRef`/여백용 `<div>`를 전부 제거하고, 다시 `scrollLineToTop(lastDialogueIndex)`만 호출 — 대화가 짧아 스크롤 여유가 부족하면 자연스러운 최대 위치까지만 올라가고, 억지 여백으로 인한 빈 공간은 생기지 않음.
- 비고: "재생 시작 시점에 스크롤"과 "대상을 마지막 caller가 아닌 진짜 마지막 대사로" 두 가지 수정은 그대로 유지됨 — 이번엔 여백 관련 부분만 되돌림.

## [2026-07-21] 마지막 대사 스크롤용 여백을 고정값 대신 동적 계산 + 상한으로 교체
- 수정 파일: `src/app/learn/[caseId]/call/progress/page.tsx`
- 변경 내용: 직전 수정에서 마지막 대사를 스크롤 맨 위로 올리기 위해 리스트 끝에 `height: 60cqh` 고정 여백을 추가했는데, 짧은 대화(대사 카드 자체가 컨테이너보다 훨씬 작은 경우)에서는 그 여백이 그대로 화면 하단에 큰 빈 공간으로 남아 어색했음. 고정값 대신 스크롤 직전(`scrollLastLineToTop`)에 `컨테이너 높이 - 대사 카드 높이`로 필요한 만큼만 계산해서 여백 엘리먼트(`scrollSpacerRef`)에 채우도록 변경하고, 그마저도 최대 96px로 상한을 둠(대사 카드가 아주 짧으면 정확히 "맨 위"까지는 안 올라가고 최대한 가깝게만 올라감 — 정확한 top 정렬보다 과도한 빈 공간을 피하는 쪽을 택함).
- 비고: Playwright로 institution-01 케이스(대사 3줄, 마지막 대사 카드 높이 57px)에서 여백 적용 전/후 스크린샷을 비교 — 적용 전엔 마지막 대사와 퀴즈 카드 사이에 큰 빈 공간이 남았고, 적용 후엔 대사가 상단 가까이(40px 여백) 위치하고 퀴즈 카드까지의 간격도 자연스러워짐을 확인.

## [2026-07-21] `currentAudio.play()`에 타임아웃 보호 추가
- 수정 파일: `src/app/learn/[caseId]/call/progress/page.tsx`
- 변경 내용: `playLine`에서 `await currentAudio.play()`에는 타임아웃이 없어서, 이 프로미스가 resolve도 reject도 안 하고 멈추는 경우(재사용 중인 엘리먼트의 재생 요청이 브라우저에 따라 안정적으로 처리되지 않는 경우 등) 대화 전체가 영영 멈추는 구조였음. `currentAudio.load()`를 호출해 새 소스를 확실히 반영시키고, `play()` 자체도 `withTimeout(..., 4000)`으로 감싸 멈춰도 반드시 다음 단계로 넘어가게 함.
- 비고: 실제로 재현한 "대화가 안 넘어감" 증상은 이 이슈가 아니라 스크롤 확인용 테스트 스크립트가 존재하지 않는 문구("정답 제출")를 기다리고 있었던 테스트 실수였음(대화 자체는 정상 진행되고 있었음) — 다만 `play()`에 타임아웃이 없던 건 실기기에서 재현될 수 있는 별개의 실질적인 위험이라 방어적으로 남겨둠.

## [2026-07-21] 통화 시뮬레이션 대사 자동 스크롤 로직을 재생 시작 시점 기준으로 재구성
- 수정 파일: `src/app/learn/[caseId]/call/progress/page.tsx`
- 변경 내용: 기존엔 "재생이 끝난 대사"를 스크롤 맨 위로 올리고(playLine의 finally), 퀴즈 전환 시에는 "마지막 caller 대사"(`lastCallerIndex`)를 올리고 있었는데, 실제로 원하던 동작은 "지금 TTS로 읽고 있는 대사가 상단에 오고, 대화가 다 끝나면 진짜 마지막 대사(caller/user 상관없이)가 상단에 오는 것"이었음. `scrollLineToTop(index)` 호출을 `playLine` 시작 시점(`setPlayingLineIndex` 직후)으로 옮기고, 퀴즈 전환 시 스크롤 대상도 `lastCallerIndex` 대신 `phishingCase.phoneDialogue.length - 1`(실제 마지막 항목)로 변경.
  - 추가로, 마지막 대사는 그 아래에 남은 콘텐츠가 없어서 스크롤 가능한 최대 위치가 부족해 "맨 위"까지 끌어올리는 게 물리적으로 불가능한 경우가 있었음(스크롤 컨테이너가 짧은 대화에서는 스크롤 여유 자체가 없음) — 대화가 전부 공개된 뒤(`revealedCount`가 전체 길이에 도달했을 때)에만 `height: 60cqh`짜리 여백을 리스트 맨 끝에 추가해 항상 충분한 스크롤 여유를 확보.
- 비고: Playwright로 음소거 후 대화를 빠르게 진행시켜 퀴즈 전환 시점의 실제 마지막 대사 `getBoundingClientRect().top`이 컨테이너 상단과 거의 일치하는지 확인(여백 추가 전엔 스크롤이 최대치에 막혀 마지막 대사가 상단에 도달하지 못함을 직접 재현·확인 후 수정).

## [2026-07-21] 통화 시뮬레이션 대사 재생 타이밍 조정 — 첫 대사 0.6초 지연, 다음 대사 미리 prefetch
- 수정 파일: `src/app/learn/[caseId]/call/progress/page.tsx`
- 변경 내용: `runDialogue` 루프에서 첫 번째(`i===0`) caller 대사는 화면 진입 즉시 재생되던 것을 0.6초 지연 후 재생하도록 변경(너무 갑작스럽게 시작되는 느낌 완화, 처음엔 0.2초로 했다가 0.6초로 조정). 또한 caller 대사를 재생하기 시작할 때 그다음 caller 대사의 TTS를 `prefetchTts`로 미리 요청해둬서, 현재 대사가 끝나자마자 다음 대사가 fetch 대기 없이 바로 이어지도록 함(`lib/tts.ts`의 캐시 덕분에 이미 fetch된 요청은 재사용됨).
- 비고: 수신 전화 화면(`call/page.tsx`)에서 이미 첫 대사만 미리 prefetch해두던 것과 같은 방식을 두 번째 이후 대사에도 연쇄적으로 적용한 것.

## [2026-07-21] 모바일에서 퀴즈 전환 시 마지막 대사가 위로 스크롤되지 않던 문제 수정
- 수정 파일: `src/app/learn/[caseId]/call/progress/page.tsx`
- 변경 내용: `phase`가 `"quiz"`로 바뀔 때 마지막 caller 대사를 스크롤 영역 맨 위로 올리는 효과가 `requestAnimationFrame` 한 번만 기다렸는데, 같은 렌더에서 `QuizCard`가 함께 마운트되며 대화 스크롤 영역(`flex-1`)의 높이가 줄어드는 레이아웃 변화가 모바일에서는 그 한 프레임 안에 다 반영되지 않는 경우가 있어 스크롤 위치 계산이 어긋났음(그래서 마지막 대사가 위로 안 올라간 것처럼 보임). `requestAnimationFrame`을 중첩해서 한 프레임 더 기다린 뒤(double rAF) 스크롤 위치를 계산하도록 수정.
- 비고: 실기기 검증은 못 함 — 레이아웃 반영 타이밍 문제라는 진단에 근거한 수정.

## [2026-07-21] 통화 시뮬레이션 완료 화면의 "마무리 퀴즈 하러 가기" 버튼을 문자 시뮬레이션과 동일한 단색 테두리로 변경
- 수정 파일: `src/app/learn/[caseId]/call/progress/page.tsx`
- 변경 내용: 같은 버튼이 문자 시뮬레이션 완료 화면(`message/progress/page.tsx`)에서는 `border border-[#1a2035]` 단색 테두리로 되어있는데, 통화 시뮬레이션 쪽만 바깥 `div`에 그라데이션 배경 + `p-[1.5px]`로 그라데이션 테두리처럼 보이게 하는 방식이라 서로 달랐음. 감싸던 `div`를 없애고 문자 쪽과 동일하게 버튼에 `border border-[#1a2035]`를 직접 적용.

## [2026-07-21] 모바일 홈 화면 설치 안내 후에도 매일 학습 알림이 활성화 상태로 남던 문제 수정
- 수정 파일: `src/app/(main)/settings/page.tsx`
- 변경 내용: `handleToggleReminder`가 토글을 켤 때 `reminderOn`을 즉시 `true`로 저장한 다음에야 모바일+비-standalone 여부를 확인해 "홈 화면에 추가해주세요" 안내 모달을 띄웠음 — 그래서 사용자가 실제로 홈 화면에 추가했는지와 무관하게 토글은 항상 "활성화"로 표시됐음. 이제 모바일 브라우저 탭에서(standalone 아님) 켜려고 하면 안내 모달만 띄우고 `return`해서 토글 자체를 켜지 않음 — 실제로 홈 화면에 추가해 standalone으로 열었을 때만 토글이 켜지고 알림 권한을 요청함.
- 비고: 탭이 열려 있는 동안만 동작하는 `setTimeout` 기반 로컬 알림이라는 근본 구조(AGENTS.md에 문서화됨)는 그대로 — 이번 수정은 "설치 안 했는데도 켜진 것처럼 보이는" UI 오해만 해소한 것이고, iOS Safari에서 홈 화면 추가 후에도 실제 알림이 안 올 수 있다는 한계 자체는 여전히 남아있음.

## [2026-07-21] 마무리 퀴즈 결과 화면에서 종료(X) 버튼 제거
- 수정 파일: `src/app/learn/[caseId]/call/quiz/page.tsx`
- 변경 내용: 헤더의 종료(X) 버튼이 `isDone` 여부와 무관하게 항상 노출되어, 정답 제출 후 결과 화면에서도 눌러서 "학습을 종료하시겠습니까?" 확인 모달이 뜨던 것을 `!isDone`일 때만(퀴즈를 아직 안 푼 상태) 보이도록 수정 — 결과 화면에서는 X 버튼 자체를 렌더링하지 않음.
- 비고: `ExitConfirmModal`은 그대로 유지되며 퀴즈 진행 중(문제 노출 상태)에는 기존과 동일하게 동작.

## [2026-07-21] 모바일에서 통화 시뮬레이션 두 번째 대사부터 TTS가 안 나오던 문제 수정
- 수정 파일: `src/app/learn/[caseId]/call/page.tsx`, `src/app/learn/[caseId]/call/progress/page.tsx`
- 변경 내용:
  - 모바일 브라우저(특히 iOS Safari)는 오디오 재생을 사용자 제스처와 이어진 흐름 안에서 시작해야 허용하는 경향이 있는데, 실제 대사 재생(`call/progress`의 `playLine`)은 `useEffect`에서 `fetch`(TTS API) 이후 재생을 시작해 이 조건을 만족하지 못했음. 1차로 수신 전화 화면의 "시작하기" 버튼(진짜 사용자 제스처) 클릭 핸들러에서 무음 WAV 재생 + 빈 `SpeechSynthesisUtterance` 발화로 오디오/TTS를 미리 "잠금 해제"하는 `unlockMobileAudio()`를 추가함(`call/page.tsx`).
  - 그런데도 "두 번째 대사부터 TTS가 안 나온다"는 문제가 남아있었음 — `playLine`이 대사마다 `new Audio(url)`로 완전히 새 엘리먼트를 만들었는데, 모바일 사파리 등은 사용자 제스처 이후 생성된 "새" 미디어 엘리먼트를 다시 제스처와 무관한 것으로 취급해 두 번째 대사부터 막는 경우가 있음. `audioRef`에 엘리먼트를 한 번만 만들어두고 이후 대사에서는 `src`만 교체해 재사용하도록 변경(이미 한 번 재생에 성공한 엘리먼트는 이후 재생도 계속 허용되는 경향을 이용).
- 비고: 실기기 검증은 하지 못함 — iOS Safari의 정확한 자동재생 정책은 버전마다 다르고 문서화가 제한적이라, 코드 흐름과 알려진 모바일 자동재생 정책 패턴에 근거해 진단·수정함. `npm run build && npm run start` 후 실기기로 재확인 권장.

## [2026-07-21] 기록 화면 카테고리 아이콘·긴급 신고 안내 경고 아이콘을 반응형으로 전환
- 수정 파일: `src/app/(main)/record/page.tsx`, `src/app/(main)/emergency/page.tsx`
- 변경 내용:
  - `record/page.tsx`의 `CategoryIcon`(완료한 학습 목록·취약 유형 태그에서 공용으로 쓰는 카테고리 아이콘)이 `size` prop을 고정 px 숫자로 받아 배지·아이콘 크기가 전혀 반응형이 아니었음 — 주변 텍스트·패딩은 `cqw`로 줄어드는데 이 아이콘만 고정폭이라 좁은 화면에서 상대적으로 커 보였음. `size`를 CSS 길이 문자열로 바꾸고 호출부(`CompletedCaseRow`는 `clamp(12px, 4cqw, 16px)`, `WeakCategoryTag`는 `clamp(8px, 2.6cqw, 10px)`)를 반응형 clamp로 교체. 배지 크기도 `size + 14`(숫자 연산) 대신 `calc(${size} + 14px)`로 변경.
  - `emergency/page.tsx`의 `TipCard` 상단 경고 아이콘(`FiAlertTriangle`)이 `size={30}` 고정값이었던 것을, 감싸는 스트립(`clamp(56px, 15cqw, 75px)`)은 이미 반응형인데 아이콘만 고정이라 좁은 화면에서 큼직해 보이는 문제가 있어 `clamp(20px, 6cqw, 30px)`로 교체.
- 비고: 둘 다 사용자가 스크린샷으로 "반응형 했어? 크기가 왜케 크지"라고 지적한 지점 — 컨테이너/텍스트는 반응형인데 아이콘만 고정 px로 남아있던 동일 패턴의 버그.

## [2026-07-21] 학습하기 목록의 기관사칭 아이콘 상한만 홈 화면과 다르게 분리
- 수정 파일: `src/lib/case-meta.ts`, `src/components/cards/ScenarioCard.tsx`
- 변경 내용: 홈 화면(28~40px 반응형 배지)과 학습하기 목록(`ScenarioCard`, 고정 20px 배지)이 같은 `INSTITUTION_ICON_SIZE`(상한 19px)를 공유해서, 고정 20px 배지 쪽에서는 여전히 아이콘이 배지를 거의 꽉 채워 보였음. 홈 화면용 `INSTITUTION_ICON_SIZE`(상한 19px)는 그대로 두고, 학습하기 목록 전용 `INSTITUTION_ICON_SIZE_LEARN`(`clamp(10px, 3cqw, 14px)`, 상한 14px)을 새로 추가해 `ScenarioCard`에만 적용.
- 비고: 시나리오 상세 헤더(`learn/[caseId]/page.tsx`)·기록 화면(`record/page.tsx`)은 이번 요청 범위(학습하기 목록)가 아니라 손대지 않음 — 동일한 고정 20px 배지 패턴이라 필요하면 같은 상수를 적용할 수 있음.

## [2026-07-21] 기관사칭 아이콘 반응형 최소 크기만 축소, "이어서 학습하기" 카드도 다른 화면과 동일한 파란 배경 사용
- 수정 파일: `src/lib/case-meta.ts`, `src/components/cards/ContinueLearningCard.tsx`
- 변경 내용:
  - `INSTITUTION_ICON_SIZE`의 clamp 하한만 `14px` → `10px`로 축소(`clamp(14px, 4cqw, 19px)` → `clamp(10px, 4cqw, 19px)`). 상한(19px)·비례 계수(4cqw)는 기존 그대로 유지 — 좁은 컨테이너에서 아이콘이 필요 이상으로 커 보이던 것만 보정.
  - `ContinueLearningCard`("이어서 학습하기")에서 기관사칭 아이콘 배경을 다른 화면과 다르게 옅은 남색(`rgba(138,155,188,0.44)`)으로 예외 처리해뒀던 것을 제거 — 이제 다른 화면들과 동일하게 `CATEGORY_META`의 `#2b7fff`를 그대로 사용.
- 비고: `ContinueLearningCard`의 회색 예외는 이전 세션에서 명시적으로 요청받아 추가했던 것인데, 이번에 사용자가 다시 통일해달라고 요청해 되돌림.

## [2026-07-21] 데스크톱 배경 웨이브를 손으로 트레이싱한 SVG 대신 Figma 원본 에셋(`public/bg.svg`)으로 교체
- 수정 파일: `src/app/layout.tsx`
- 변경 내용: 직전까지 스크린샷을 눈대중으로 트레이싱해 만든 베지어 곡선 근사치를 쓰고 있었는데, Figma에서 실제 벡터를 그대로 export한 `public/bg.svg`(1920×1080, mask+gradient 방식, node 86:1467 배경과 동일)로 교체 — 근사가 아닌 원본 그대로. `<svg>` 인라인 마크업을 `next/image`의 `<Image src="/bg.svg" fill priority sizes="100vw" className="object-cover" />`로 교체(부모 div가 이미 `fixed`라 `fill` 사용 가능). 기존과 동일하게 부모 div에 `min-[1400px]:block`이 걸려 있어 1400px 미만에서는 그대로 노출되지 않음.
- 비고: Playwright로 1300px 뷰포트에서 배경 div `display: none` 확인, 1920px 뷰포트에서 셸 양옆에 웨이브가 끊김 없이 이어지는지 육안 확인.

## [2026-07-21] 데스크톱 배경 웨이브 곡선을 Figma(node 91:1745) 실제 형태로 재보정
- 수정 파일: `src/app/layout.tsx`
- 변경 내용: 기존 웨이브 곡선은 왼쪽에서 오른쪽 끝까지 단조 증가(계속 위로만 휘어짐)하는 형태였는데, Figma 레퍼런스를 다시 확인하니 실제로는 왼쪽에서 살짝 아래로 꺼졌다가(트로프) 화면 중앙~우측에서 정점을 찍고 다시 살짝 내려오는 완만한 S자(사인파) 형태였음. 스크린샷을 1920×1080 기준 좌표로 환산해 두 겹(연한 `#e8f0fd`, 진한 `#cfe1fb`) 곡선의 제어점을 다시 잡아 실제 굴곡과 정점 위치를 맞춤.
- 비고: Figma MCP(`get_screenshot`)로 받은 node 91:1745 래스터 이미지를 좌표 격자로 눈대중 트레이싱해 베지어 제어점을 산출(벡터 패스 자체는 마스크 이미지로 export되어 있어 직접 추출 불가). Playwright로 1920×1000 뷰포트 스크린샷을 찍어 육안 대조.

## [2026-07-21] 데스크톱 마케팅 패널 텍스트/로고 배치를 Figma(node 86:1467) 순서·크기로 재정렬
- 수정 파일: `src/app/layout.tsx`
- 변경 내용: Figma 레퍼런스(node 86:1467) 확인 결과 패널 내부 순서가 실제 디자인(서브타이틀 → 헤드라인(+반짝이 장식) → 로고 랙업 순, 로고 랙업은 헤드라인만큼 큰 사이즈로 맨 아래 배치)과 반대로 구현돼 있었음(기존엔 작은 로고+텍스트가 맨 위). 순서를 서브타이틀 → 헤드라인 → 로고 랙업으로 수정하고, 헤드라인 강조 문구 옆에 별 3개짜리 반짝이 SVG 장식 추가. 로고는 아이콘+텍스트를 별도 마크업으로 조합하던 것을, Figma에서 그대로 추출한 통짜 랙업 SVG(`public/logo-j.svg`, `viewBox 0 0 410 73`)로 교체하고 동일 비율(clamp 폭·높이를 같은 vw 계수로 스케일)로 크게 표시.
- 비고: Figma MCP(`get_design_context`, `get_screenshot`)로 node 86:1467의 정확한 텍스트/로고 순서·상대 크기·위치(1920×1080 캔버스 기준 inset %)를 확인 후 반영. 사용자가 동시에 같은 파일을 직접 편집 중이라 로고 크기(clamp 값)는 사용자가 마지막으로 조정한 값을 유지하고, Next.js `Image`에 누락돼 있던 필수 `width`/`height`만 보완.

## [2026-07-21] 데스크톱 마케팅 패널 브레이크포인트 1400px로 상향, 웨이브 배경을 화면 전체를 가로지르는 단일 SVG로 재구성, 셸 그림자 대비 강화
- 수정 파일: `src/app/layout.tsx`
- 변경 내용:
  - 아이패드 프로 가로(1366px)에서도 데스크톱 마케팅 패널이 잘못 노출되는 문제가 있어, 브레이크포인트를 `xl:`(1280px)에서 Tailwind 임의값 `min-[1400px]:`(1400px)로 상향. Playwright로 1366px 뷰포트에서 `aside` `display: none` 확인.
  - 패널 내부 장식을 기존 blur 원형 blob 방식에서 인라인 `<svg>` 웨이브로 교체하는 과정에서, 처음엔 왼쪽 패널과 오른쪽 388px 여백(`mr-97`)에 각각 별도의 작은 웨이브 SVG(`viewBox 0 0 856 481`, 오른쪽은 좌우 반전)를 따로 그렸으나, 셸을 사이에 두고 곡선이 끊겨 두 조각처럼 보이는 문제가 있었음(Figma node 91:1745 확인 결과 원래는 화면 전체를 가로지르는 하나의 매끄러운 S자 곡선). 이를 셸 뒤에 뷰포트 전체(`inset-0`, `viewBox 0 0 1920 1080`)를 덮는 고정 배경 SVG 한 장으로 교체하고, 왼쪽 패널·오른쪽 여백은 자체 배경을 비워 이 공용 배경이 비쳐 보이게 한 뒤 셸(흰 배경)만 그 위에 얹어 가운데를 가리는 구조로 재구성 — 웨이브가 셸 양옆에서 하나로 이어져 보임.
  - 셸 그림자가 오른쪽(`min-[1400px]:mr-97` 388px 여백 구간)에서는 거의 안 보인다는 지적 확인 — 원인은 그 여백 구간이 셸과 동일한 순백(`rgb(255,255,255)`) 배경이라 `rgba(0,0,0,0.1)` 블러 그림자가 백-온-백으로 묻혔기 때문. 그림자 자체를 강화(`0px_0px_7px_0px_rgba(0,0,0,0.1)` → `0px_0px_16px_0px_rgba(0,0,0,0.18)`)해 양쪽 모두 보이도록 함(이후 웨이브 배경 재구성으로 오른쪽 여백도 더는 순백이 아니게 되어 대비 문제 자체는 완화됨).
- 비고: Figma MCP(`get_screenshot`)로 node 91:1745 레퍼런스를 직접 확인 후 곡선 형태를 재구성. Playwright로 1920×1000 뷰포트 스크린샷을 찍어 웨이브가 셸 양옆에서 끊김 없이 이어지는지 육안 확인.

## [2026-07-21] 키 큰 터치 디바이스에서 콘텐츠 짧은 페이지의 BottomNav가 화면 하단에 붙지 않던 문제 수정
- 수정 파일: `src/app/(main)/layout.tsx`
- 변경 내용: `(main)` 라우트 그룹의 공용 래퍼가 `[@media(min-height:950px)_and_(hover:none)_and_(pointer:coarse)]:flex-none`(키 크고 세로로 긴 터치 디바이스에서 콘텐츠 영역을 `flex-1`→`flex-none`으로 바꾸는 규칙)를 갖고 있었는데, 이 조건에서는 콘텐츠 영역이 뷰포트 전체 높이를 채우도록 늘어나지 않아 `BottomNav`가 짧은 콘텐츠 바로 아래(화면 중간)에 떠버리고 그 밑에 빈 여백이 생기는 문제가 있었음(학습 기록·긴급·설정처럼 콘텐츠가 짧은 페이지에서 특히 심함). 이 미디어쿼리는 `src/app/(main)/home/page.tsx`의 `<main>` 자체에도 별도로 이미 존재해 홈 화면 자체의 의도(카테고리 그리드 등이 큰 화면에서 과도하게 늘어나는 것 방지)는 그쪽에서 이미 충족되고 있었으므로, `(main)/layout.tsx`의 공용 래퍼에 있던 중복 규칙만 제거 — 콘텐츠 영역은 항상 `flex-1`을 유지해 BottomNav가 페이지·기기 조건과 무관하게 항상 화면 최하단에 고정되도록 함.
- 비고: Playwright로 `viewport 390×1000 + hasTouch` 조건을 재현해 수정 전/후 모든 `(main)` 라우트(홈/학습하기/기록/긴급/설정)에서 `gapBelowNav`를 직접 측정 — 수정 전엔 기록 253px/긴급 135px/설정 258px의 빈틈이 있었고, 수정 후 전부 0으로 확인.

## [2026-07-21] 데스크톱 마케팅 랜딩 패널을 로그인 전용→전체 라우트 공통으로 확장, 배치 방식 재설계 (바로 아래 항목의 후속 수정)
- 수정 파일: `src/app/layout.tsx`(신규 배치), `src/app/page.tsx`(기존 로그인 전용 구현 제거 — 되돌림)
- 변경 내용: 바로 아래 항목에서 로그인 화면("/") 전용으로 구현했던 마케팅 패널을 `layout.tsx`로 옮겨 **모든 라우트 공통**으로 변경(어느 화면에 있든 데스크톱에서 왼쪽엔 카피, 오른쪽엔 지금 보고 있는 실제 화면이 그대로 보임). 배치 방식도 재설계:
  - 브레이크포인트를 `lg:`(1024px)에서 **`xl:`(1280px)로 상향** — 아이패드(세로 768/가로 1024)까지는 지금처럼 셸이 `mx-auto`로 완전히 중앙 정렬되고 패널이 아예 렌더링되지 않으며, 1280px 이상에서만 데스크톱 레이아웃이 적용됨(처음엔 뷰포트 폭에 유동적으로(fluid) 반응하도록 만들었으나, 500~1280px 사이 중간 폭에서 셸이 중앙이 아니라 왼쪽으로 쏠려 보이는 문제가 있어 브레이크포인트 방식으로 되돌림).
  - 셸은 1280px 이상에서 `mx-auto` 대신 `xl:ml-auto xl:mr-97`(388px, Tailwind 97 step = 97×4px)로 오른쪽에 고정 여백을 두고 붙이고, 패널은 `right: 888px`(500+388)로 그 왼쪽 남은 공간에 고정 배치.
  - `body { background: var(--background) }`가 `globals.css`에서 `@layer` 밖에 정의돼 있어 Tailwind 유틸리티 클래스(`bg-white` 등)보다 우선순위가 높다는 걸 발견 — body 배경은 인라인 `style={{ backgroundColor: "var(--surface)" }}`로 덮어써야 실제로 흰색이 적용됨.
  - 셸에 `shadow-[...]`를 추가해 좌우로 살짝 뜬 느낌을 줌(정확한 blur/opacity 값은 반복 조정 중 — 최신 값은 코드 참고).
- 비고: 원래 계획은 오른쪽에 Figma의 홈 화면 정적 목업을 별도로 만드는 것이었으나, 로그인 화면에만 있던 걸 전체 라우트로 넓히면서 "오른쪽 = 그 라우트의 실제 화면"이 되어 애초에 별도 목업이 필요 없어짐(계획대로 실제 화면 재사용 방침 유지).

## [2026-07-21] 로그인 화면에 데스크톱 전용 마케팅 랜딩 패널 추가 (Figma node 86:1467)
- 수정 파일: `src/app/page.tsx`
- 변경 내용: 앱 전체가 `layout.tsx`에서 `max-w-125`(500px) 모바일 셸로 감싸져 중앙 정렬되기 때문에 데스크톱에서는 화면 양옆에 빈 공간이 생기는데, 로그인 화면("/")에서 창 폭이 1024px(Tailwind `lg:`) 이상일 때 그 왼쪽 여백에 헤드라인("읽는 교육이 아닌, 직접 대응하며 배우는 새로운 학습 경험")·서브텍스트("체험형 피싱 예방 학습")·로고 랙업을 보여주는 `<aside>`를 추가. `position: fixed`로 뷰포트 좌측 여백(`right: calc(50% + 250px)`)에 배치해 모바일 셸과 겹치지 않도록 함. 오른쪽(중앙)은 Figma의 홈 화면 정적 목업을 별도로 복제하지 않고 기존 로그인 폼을 그대로 재사용(중복 코드 방지). 장식 배경은 새 이미지 자산 없이 blur된 radial 톤(`#60a5fa`/`#2d1f4e`, 기존 브랜드 컬러 재사용)의 CSS만으로 구현. 헤드라인은 1024px 경계에서 단어가 한 줄씩 끊기지 않도록 `clamp(22px, 2.4vw, 36px)`로 반응형 처리.
- 비고: 이 프로젝트 최초의 `min-width` 미디어쿼리(`lg:`) 사용 — 모바일 셸 컨테이너 "바깥" 실제 브라우저 폭에 반응해야 해서 기존 컨테이너 쿼리(cqw/cqh) 패턴으로는 불가능했던 유일한 예외. Figma 원본 텍스트 "피싱안심교실"은 기존 코드베이스 브랜딩("피싱안전교실")과 달라 기존 표기를 그대로 따름.

## [2026-07-20] 긴급 신고 안내 화면을 Figma 디자인(node 67:1222/67:1095/67:1112)에 맞춰 재작업
- 수정/생성 파일:
  - `src/app/(main)/emergency/page.tsx` — "바로 전화 하기" 제목 아래 "보이스피싱 피해 시 즉시 신고하세요" 서브타이틀 추가. 112/1332 연락처 카드에 그라데이션과 어울리는 `border-2`(빨강/파랑) 추가하고, Figma 레이어 패널에서 확인한 정확한 값으로 그라데이션 수정(경찰청 카드: `#e33a3d→#7d2022`였던 것을 `#ffcbcc→#df1e21`로, 두 카드 모두 방향을 `135deg`에서 `to top right`로 — Figma 그라데이션 핸들이 좌하단→우상단으로 나 있는 것과 일치). "피해 발생 대응"·"예방 수칙" 섹션을 체크리스트(초록 체크 아이콘 + 평문)에서 새 디자인으로 교체 — 카드 상단에 색상 스트립(연빨강/연파랑 배경) 위에 경고 삼각형 아이콘 + 색상 제목을 올리고, 각 항목은 회색 배경의 개별 박스 안에 핵심 문구만 굵게+색상 강조하는 방식(`TipSegment[]` 배열로 강조 구간을 데이터로 표현). 두 섹션이 구조가 동일해 `TipCard` 컴포넌트로 추출해 재사용, 카드 상단 여백은 `mt-3.5`. `IoCheckmarkCircle` import 제거, `FiAlertTriangle` 추가.
  - 신고 확인 팝업(취소/신고 버튼)은 기존 구현이 이미 새 Figma(67:1095)와 동일해 변경 없음.

## [2026-07-20] 문자 시뮬레이션 판단 퀴즈·마무리 퀴즈 정답/오답 피드백을 전화 버전과 통일, 기관사칭 아이콘/색상 변경
- 수정/생성 파일:
  - `src/app/learn/[caseId]/message/progress/page.tsx` — 문자 시뮬레이션의 "어떻게 행동 하시겠습니까?" 판단 퀴즈가 플레인 버튼 목록이라 선택해도 아무 시각 피드백 없이 곧장 완료 화면으로 넘어가던 것을, 전화 시뮬레이션(`call/progress`)과 동일한 `QuizCard` 컴포넌트로 교체 — 선택 즉시 정답(그라데이션+체크)/오답(회색+X) 색상과 아이콘이 표시된 뒤 900ms 후 완료 화면으로 전환(`ANSWER_REVEAL_DELAY_MS`). 전환 타이밍을 `answer`(선택값, 즉시 반영)와 `revealComplete`(완료 화면 전환 여부, 지연 반영) 두 상태로 분리해 구현. 메시지 말풍선 텍스트 `leading-relaxed`→`leading-normal`로 줄간격 소폭 축소.
  - `src/app/learn/[caseId]/call/quiz/page.tsx` (마무리 퀴즈, 전화·문자 공용) — 정답 선택 시에만 체크 아이콘이 보이고 오답 선택 시에는 빨간 배경만 있고 아이콘이 없던 것을, 오답에도 `MdCancel` X 아이콘을 표시하도록 수정(`call/progress`의 판단 퀴즈 완료 리뷰 카드와 동일한 패턴).
  - `src/lib/case-meta.ts`, `src/app/(main)/home/page.tsx` — 기관사칭 카테고리 아이콘을 커스텀 SVG(`CategoryGovernmentIcon`, 이제 미사용이라 `home-icons.tsx`에서 삭제)에서 `react-icons/go`의 `GoOrganization`으로 교체(기존처럼 `text-white`로 흰색 렌더링). 기관사칭 아이콘 배경색을 옅은 남색(`rgba(138,155,188,0.44)`)에서 `#2b7fff`로 변경 — 홈 카테고리 타일, 학습하기 목록 ScenarioCard, 시나리오 상세, 학습 기록 등 전 화면에 적용.
  - `src/components/cards/ContinueLearningCard.tsx` — 단, "이어서 학습하기" 카드의 아이콘 배경만은 기존 톤(`rgba(138,155,188,0.44)` = `#8A9BBC` 44%)을 그대로 유지하도록 예외 처리(`iconBg` 계산 시 `category === "institution"`이면 기존 값 사용).
  - `src/lib/case-meta.ts`(`INSTITUTION_ICON_SIZE = "clamp(14px, 4cqw, 19px)"` 추가), `src/components/cards/ScenarioCard.tsx`, `src/app/(main)/learn/[caseId]/page.tsx`, `src/app/(main)/record/page.tsx`, `src/app/(main)/home/page.tsx` — 기관사칭 아이콘이 다른 카테고리보다 한 단계 크게 보이도록(반응형 상한 19px) 아이콘이 나오는 모든 위치에 적용. 단 `ContinueLearningCard`("이어서 학습하기")는 기존 아이콘 크기 그대로 유지.
- 비고: 문자 퀴즈와 마무리 퀴즈 모두 "선택 즉시 정답/오답 아이콘+색 표시"라는 동일 UX 원칙을 전화 시뮬레이션 기준으로 통일.

## [2026-07-20] 설정 화면 "매일 학습 알림" 게스트에게 완전히 숨김
- 수정/생성 파일:
  - `src/app/(main)/settings/page.tsx` — "매일 학습 알림" `SettingsCard`를 게스트에게 비활성화 스타일(반투명 토글)+클릭 시 `LoginPromptModal`로 보여주던 것을, `isLoggedIn && (...)`로 감싸 섹션 자체를 렌더링하지 않도록 변경(다른 게스트 게이팅 섹션들과 동일한 "숨김" 패턴으로 통일). 더 이상 게스트가 토글을 누를 경로가 없어져 `handleToggleReminder`의 로그인 체크 분기, `showLoginRequired` 상태, `LoginPromptModal` 사용을 모두 제거.
- 비고: 홈/학습하기/학습 기록에 적용한 "잠금 표시 대신 숨김" 원칙(바로 위 항목 참고)을 설정 화면에도 동일하게 적용.

## [2026-07-20] 게스트 화면을 Figma 디자인(node 61:2032/2063/2111/2193)에 맞춰 재작업
- 수정/생성 파일:
  - `src/lib/auth.ts` — `useIsLoggedIn()` 훅 추가(마운트 후 `AUTH_STORAGE_KEY` 읽는 공통 패턴을 재사용 컴포넌트에서 쓰기 위함).
  - `src/components/auth/GuestSaveProgressCard.tsx` (신규) — "간편 로그인 하고 이번 학습을 저장해보세요!" + Kakao 버튼 + 3개 기능 뱃지(학습 진행률 저장/완료한 학습 기록/취약 유형 분석) 카드를 공용 컴포넌트로 추출. 배경은 `style` prop으로 주입(퀴즈 결과는 그라데이션 배너, 학습 기록은 솔리드 `#1a2035` 오버레이 카드).
  - `src/app/learn/[caseId]/call/quiz/page.tsx` — 위 배너 인라인 구현을 `GuestSaveProgressCard`로 교체.
  - `src/app/(main)/record/page.tsx` — 게스트일 때 섹션마다 "로그인 후 이용 가능합니다" 버튼+모달을 띄우던 방식을, 실제 콘텐츠를 `backdrop-blur-md`로 흐리게 보여주고 그 위에 `GuestSaveProgressCard`를 중앙 오버레이로 띄우는 방식으로 변경(Figma의 블러+카드 패턴). `LoginPromptModal` 제거. 오버레이 카드 높이는 Figma 원본 프레임 값(217px)에 맞춰 `paddingBlock: "55px"`로 조정(`GuestSaveProgressCard`의 기본 패딩을 인라인 스타일로 덮어씀).
  - `src/lib/case-meta.ts`는 변경 없음. `src/components/cards/CaseStatsGrid.tsx` — 완료율 셀은 회원의 실제 학습 기록 기준이라 게스트에게는 노출하지 않음(4칸→3칸, 빈 칸은 `aria-hidden` placeholder로 그리드 위치 유지). 이후 사용자 피드백으로 추천도를 왼쪽, 완료율을 오른쪽 칸으로 순서 변경.
  - `src/components/cards/ScenarioCard.tsx` — "학습 완료" 배지와 버튼 문구("이어서 학습하기" 등)도 완료율과 동일하게 회원 전용 데이터라 게스트에게는 숨기고 버튼은 항상 "학습하기"로 고정.
  - `src/app/(main)/learn/page.tsx` — 게스트에게는 "최근 학습한 사례" 배너(회원 진행 기록 기반)를 숨김.
  - `src/app/(main)/home/page.tsx` — "전체 학습 진도율"/"오늘 학습 시간·완료 시나리오"/"이어서 학습하기" 섹션을 게스트에게 잠금(반투명+로그인 모달) 형태로 보여주던 것을, Figma 게스트 화면 기준으로 섹션 자체를 렌더링하지 않도록 변경. 인사말도 로그인 여부에 따라 "홍길동"/"게스트"로 표시.
  - `src/components/cards/ContinueLearningCard.tsx` — home 페이지에서만 쓰이던 `locked`/`onLockedClick` prop이 더 이상 쓰이지 않아 제거.
- 비고: Figma의 "게스트용" 검토 섹션(디자이너 주석 "게스트용은 이대로 진행하면 될 것 같아요")을 실제 앱과 대조한 결과 위와 같은 차이를 발견해 반영. 완료율/학습 완료 여부처럼 회원 전용 실제 데이터에 기반한 UI는 게스트에게 "잠금 표시"가 아니라 "숨김"으로 통일.

## [2026-07-19] 학습 기록 "취약 유형" 뱃지를 한 줄에 3개씩 배치
- 수정/생성 파일:
  - `src/app/(main)/record/page.tsx` — 취약 유형 뱃지 컨테이너를 `flex flex-wrap`(내용 길이에 따라 줄바꿈)에서 `grid grid-cols-3`로 변경, 항상 한 줄에 3개씩 배치되도록 함. 좁아진 칼럼 폭 때문에 5글자 카테고리명("메신저사기" 등)이 두 줄로 줄바꿈되던 문제는 뱃지 내부 패딩을 줄이고 `whitespace-nowrap`을 추가해 해결. 뱃지가 grid 기본 stretch로 칼럼 전체 너비를 채워 오른쪽에 빈 공간이 남던 것은 `w-fit`으로 내용 크기만큼만 차지하도록 수정. 이후 패딩(`px-1.5`→`px-2`→`px-2.5`)을 단계적으로 키우고 그리드 가로 간격(`gap-2`→`gap-x-1.5`→`gap-x-1`)을 줄여 320px/375px 두 폭에서 잘림 없이 균형 잡히도록 조정.

## [2026-07-20] 문자(메시지) 시뮬레이션 신규 구현 (US-58~64)
- 수정/생성 파일:
  - `src/types/index.ts` — `PhishingCase`에 `textMessages: string[]`(문자 시뮬레이션에서 순서대로 등장하는 사기범 발신 메시지), `textQuiz: QuizQuestion`(문자 시뮬레이션의 "어떻게 행동 하시겠습니까?" 2지선다 판단 퀴즈), `textFeedback: { correct; wrong }`(완료 직후 상단 요약 피드백 문구) 추가.
  - `src/lib/mock-cases.ts` — 5개 케이스 전부에 위 3개 필드 채움(기존 phoneDialogue/quiz와 같은 시나리오를 문자 버전으로 각색).
  - `src/lib/routes.ts` — `ROUTES.messageProgress(caseId)` 추가.
  - `src/app/learn/[caseId]/message/progress/page.tsx` (신규) — 문자 시뮬레이션 진행/완료 화면. Figma(node 54:715 "메세지 확인중", 54:678/54:749 "완료 화면")를 기준으로 구현. TTS 없이 문자 메시지가 550ms 간격으로 하나씩 등장(`bubble-enter` 애니메이션 재사용), 전부 등장해야 2지선다 선택지가 활성화됨. 선택 즉시 배지가 "메세지 확인중"(빨강)→"시뮬레이션 완료"(파랑)로 바뀌고, 정답/오답에 따라 요약 피드백 문구 + `call/progress`의 완료 리뷰 카드와 동일한 패턴(선택 배지+정답 배지+설명)을 보여줌. "다시 하기"/"AI 분석 결과 보기"/"마무리 퀴즈 하러 가기" 버튼은 기존 `call/analysis`·`call/quiz` 라우트를 그대로 재사용(모드 구분 없이 caseId만으로 동작하는 공용 페이지라 신규 구현 불필요).
  - `src/app/(main)/learn/[caseId]/page.tsx` — 지금까지 아무 동작이 없던 "문자로 시작" 버튼을 `ROUTES.messageProgress(caseId)`로 연결.
- 비고: 사용자가 공유한 Figma 4개 프레임(54:715/54:678/54:749/54:797) 기준으로 구현. `call/analysis`·`call/quiz` 페이지는 원래 모드 독립적으로 설계되어 있어 그대로 재사용 가능함을 확인 후 중복 구현하지 않기로 결정.
- 추가로 `AGENTS.md`의 "US-04~08 기록 탭 미구현" 표기가 실제로는 이미 구현되어 있어 오래전에 stale 해진 것을 발견, 함께 정정.

## [2026-07-20] 문자 시뮬레이션을 전화 시뮬레이션과 동일한 구조로 조정
- 수정/생성 파일:
  - `src/app/learn/[caseId]/message/progress/page.tsx` — 메시지 등장 간격을 550ms → 1800ms로 늘려 더 천천히 하나씩 등장하도록 조정. 판단 퀴즈 카드를 메시지 스크롤 영역 안에 항상 렌더링(비활성화 스타일)하던 구조에서, `call/progress`의 `QuizCard`와 동일하게 **메시지가 전부 등장한 뒤에만 렌더링되고 스크롤 영역 밖(`shrink-0`)에 하단 고정**되는 구조로 변경. 완료 화면도 `call/progress`처럼 별도 `key`(`"messages"`/`"complete"`)를 준 독립 스크롤 영역으로 분리(리액트가 두 상태의 DOM을 재사용해 스크롤 위치가 새는 것을 방지하는, 이전에 전화 시뮬레이션에서 고쳤던 것과 동일한 패턴).
- 비고: "전화 시뮬레이션이랑 완전히 똑같아야 한다"는 피드백에 따라 구조를 최대한 일치시킴. Playwright로 퀴즈 카드가 메시지 등장 완료 전에는 보이지 않는 것, 등장 간격이 실제로 늘어난 것, 완료 화면이 정상 동작하는 것을 확인.

## [2026-07-20] 문자 시뮬레이션 퀴즈 등장 딜레이 추가 + 완료 화면에서 메시지 목록 제거
- 수정/생성 파일:
  - `src/app/learn/[caseId]/message/progress/page.tsx` — 마지막 메시지가 등장한 뒤 곧바로 퀴즈 카드가 뜨지 않고 1.2초(`QUIZ_DELAY_MS`) 대기 후 나타나도록 `showQuiz` 상태 추가. 완료(complete) 화면에서 메시지 목록을 제거 — `call/progress`의 완료 화면이 대화 내용 없이 리뷰 카드만 보여주는 것과 동일하게 맞춤(Figma에는 메시지가 남아있었지만, "전화 시뮬레이션이랑 완전히 똑같아야 한다"는 방향에 맞춰 제거).
- 비고: Playwright로 마지막 메시지 등장 후 퀴즈가 약 1.2초 뒤에 나타나는 것, 완료 화면에 메시지 버블이 하나도 없는 것(`bubble-enter` 요소 0개)을 확인.

## [2026-07-19] 학습 기록 화면 나머지 섹션 게이팅 + 게스트 학습 기록 저장 자체를 차단
- 수정/생성 파일:
  - `src/lib/progress.ts` — `recordCaseProgress`/`recordAnalysisAccuracy` 함수 내부에서 `AUTH_STORAGE_KEY`를 직접 확인해 게스트(비로그인)면 조용히 no-op. 호출부(call/progress, call/quiz, call/analysis)는 수정 불필요.
  - `src/lib/daily-stats.ts` — `addTodaySeconds`도 동일하게 게스트는 저장하지 않도록 가드.
  - `src/app/(main)/record/page.tsx` — "전체 학습 진행률"/"완료 시나리오 개수"/"완료 학습 조회"/"최근 진행한 학습" 섹션을 "취약 유형"과 동일한 방식(자물쇠 아이콘 + 로그인 모달)으로 게이팅. 이제 학습 기록 화면 전체가 회원 전용.
- 비고: 유저스토리 US-56(학습 기록 저장)이 회원 전용으로 명시되어 있어, 단순히 진도율 "표시"만 막는 걸 넘어 게스트 시뮬레이션 진행 자체가 기록되지 않도록 저장 단계에서부터 차단하기로 사용자와 확인 후 결정. Playwright로 게스트 상태에서 시뮬레이션 진행 후 `localStorage.getItem("voiceshield-case-progress")`가 `null`인 것, 로그인 상태에서는 정상 저장되는 것을 각각 확인.
  또한 `01. 유저스토리 - 시트1.pdf` 전체를 다시 검토해 "사례 목록 조회"(US-18) 등 게스트 체험(US-06)과 충돌하는 항목은 스프레드시트 오기로 판단해 게이팅하지 않기로 결정 — `AGENTS.md`에 근거 명시.

## [2026-07-19] 홈 화면 진도율/통계/이어서 학습하기, 학습 기록 취약 유형에 회원 전용 게이팅 추가
- 수정/생성 파일:
  - `src/components/auth/LoginPromptModal.tsx` (신규) — 기존 `settings/page.tsx`에 인라인으로 있던 "로그인 후 이용 가능합니다" 모달을 공용 컴포넌트로 추출(`open`/`onClose`/`onLoggedIn` props). Kakao 버튼 클릭 시 `AUTH_STORAGE_KEY`를 직접 저장.
  - `src/app/(main)/settings/page.tsx` — 인라인 모달 제거하고 `LoginPromptModal`로 교체(동작 동일, 코드만 정리).
  - `src/components/cards/ContinueLearningCard.tsx` — `locked`/`onLockedClick` prop 추가. `locked`일 때 클릭을 가로채(`preventDefault`) 네비게이션 대신 콜백을 호출하고 `opacity-50`으로 표시.
  - `src/app/(main)/home/page.tsx` — "전체 학습 진도율", "오늘 학습 시간/완료 시나리오", "이어서 학습하기"를 회원 전용으로 게이팅. 게스트에게는 자물쇠 아이콘 + "로그인 후 이용 가능합니다" 안내를 보여주고 클릭 시 `LoginPromptModal`을 띄움.
  - `src/app/(main)/record/page.tsx` — "취약 유형" 섹션을 동일한 방식으로 회원 전용 게이팅.
- 비고: `01. 유저스토리 - 시트1.pdf`의 US-11(최근 학습 이어하기)/US-12(학습 진행률 확인)/US-13(오늘의 학습 시간 확인)/US-14(완료한 시나리오 확인)/US-78(취약 유형 확인)이 모두 "회원만"으로 명시되어 있었는데, 지금까지는 게스트에게도 노출되고 있었음 — 이번에 유저스토리 기준으로 맞춤. 학습 기록의 나머지 섹션(전체 진행률/완료 학습 조회/최근 진행한 학습, US-76/77/79도 "회원만")은 이번 범위에서 제외했고 추후 필요 시 별도 처리.

## [2026-07-19] 홈 화면 "오늘의 학습 진도율"을 "전체 학습 진도율"로 변경하고 실제 데이터 연결
- 수정/생성 파일:
  - `src/app/(main)/home/page.tsx` — 상단 진도율 섹션을 "오늘의 학습 진도율"(하드코딩 68%) + "오늘 완료: 68%"에서 "전체 학습 진도율"로 변경. `applyProgressOverrideToAll`로 전체 케이스 중 완료(`isCompleted`) 개수를 세어 `completedCaseCount / totalCaseCount` 기반 퍼센트로 프로그레스 바를 채우고, 우측에 "완료 수 / 전체 수"를 표시. "오늘 완료" 텍스트는 제거.
- 비고: `record/page.tsx`의 "전체 학습 진행률" 섹션과 동일한 계산 로직 재사용. localStorage에 완료 케이스 2개를 심어 40%(2/5)로 정확히 반영되는 것 Playwright로 확인.

## [2026-07-19] 취약 유형 뱃지를 화면 폭에 따라 자연스럽게 3~4개씩 배치
- 수정/생성 파일:
  - `src/app/(main)/record/page.tsx` — 처음엔 `grid-cols-4`로 고정했으나, 좁은 모바일 폭에서 4칼럼을 억지로 맞추다 보니 뱃지 패딩을 키울 여유가 없다는 문제가 있었음(칼럼 폭 자체가 좁아 패딩을 키우면 다시 잘림). `grid-template-columns: repeat(auto-fill, minmax(90px, 1fr))`로 바꿔 칼럼 개수를 고정하지 않고 화면 폭에 맞게 브라우저가 자동으로 결정하도록 변경 — 실측 결과 320px에서는 2개, 360~414px(대부분의 모바일 폭)에서는 3개, 500px 이상에서는 4개가 한 줄에 들어가며, 칼럼 수가 적을수록 남는 공간이 뱃지 패딩(반응형 `cqw` 기반)에 자연스럽게 반영되어 모바일에서도 패딩이 커 보임. 모든 구간에서 잘림 없음(diff=0) 확인.

## [2026-07-19] 모바일에서 대사 재생이 특정 줄에서 멈춘 채 "다시 듣기" 아이콘이 계속 도는 문제 방지
- 수정/생성 파일:
  - `src/app/learn/[caseId]/call/progress/page.tsx` — `playLine`의 오디오/브라우저 TTS 재생 대기에 15초 타임아웃(`withTimeout`)을 추가. 모바일(특히 iOS Safari)에서 `speechSynthesis`의 `onend`/`onerror`가 아예 발화하지 않는 경우가 있어, 이때 `await`가 영원히 끝나지 않으면 해당 줄의 "다시 듣기" 스핀 아이콘이 멈추지 않고 대화 진행 루프 전체가 멈춰버렸음.
- 비고: "두 번째 대사부터 도돌이표가 계속 돈다 / 새로고침하면 첫 번째부터 돈다" 제보 기반. Playwright(헤드리스 Chromium)로는 재현되지 않아(자동재생 제약이 실기기보다 느슨함) 근본 원인을 100% 확증하지는 못했고, 재발 방지용 타임아웃 안전장치로 방어. 실기기에서 재현되면 추가 확인 필요.

## [2026-07-19] 전화 시뮬레이션 종료(X) 버튼 크기 반응형 조정
- 수정/생성 파일:
  - `src/app/learn/[caseId]/call/progress/page.tsx`, `call/quiz/page.tsx`, `call/analysis/page.tsx` — 종료 버튼 아이콘 크기를 `clamp(15px, 4.5cqw, 21px)` → `clamp(18px, 5cqw, 22px)`로 조정(좁은 화면에서 최소 크기가 너무 작았음, 최대 크기는 기존과 비슷하게 유지).

## [2026-07-19] 홈 화면 "오늘 학습 시간"/"오늘 완료 시나리오"를 실제 데이터에 연결
- 수정/생성 파일:
  - `src/lib/daily-stats.ts` (신규) — `voiceshield-daily-study-seconds` localStorage 키에 날짜별 학습 체류 시간(초)을 누적. `useStudyTimeTracker()` 훅을 학습 화면에 붙이면 10초 주기 flush + `visibilitychange`로 오늘 날짜에 시간을 누적하고, `getTodayStudyMinutes()`로 분 단위 조회.
  - `src/lib/progress.ts` — `StoredCaseProgress`에 `completedAt?: number` 추가(처음 완료된 시각만 기록, 재방문 시 갱신 안 함), `getTodayCompletedCount()` 추가.
  - `src/app/learn/[caseId]/call/progress/page.tsx`, `call/quiz/page.tsx`, `call/analysis/page.tsx` — `useStudyTimeTracker()` 호출 추가(전화 시뮬레이션 각 단계에 머무는 시간을 실제 학습 시간으로 집계).
  - `src/app/(main)/home/page.tsx` — "오늘 학습 시간 (분)"/"오늘 완료 시나리오" 하드코딩 값(12, 3)을 `getTodayStudyMinutes()`/`getTodayCompletedCount()` 실제 값으로 교체.
- 비고: "오늘의 학습 진도율"(68%, 68/100 프로그레스 바)은 이번에 다루지 않음 — 별도 요청 시 진행. Playwright로 localStorage를 직접 세팅해 완료 시각/누적 시간이 홈 화면 숫자에 정확히 반영되는 것 확인.

## [2026-07-19] 학습 종료 시 오디오가 계속 재생되던 버그 수정
- 수정/생성 파일:
  - `src/app/learn/[caseId]/call/progress/page.tsx` — `exitedRef`를 추가해 "학습 종료" 확인 시 `true`로 설정하고, 대화 재생 루프(`runDialogue`)와 `playLine`이 이 플래그를 확인해 즉시 멈추도록 변경.
- 비고: `router.push()`는 페이지를 즉시 언마운트하지 않으므로, 종료 버튼이 현재 재생 중인 오디오만 멈추고 진행 중이던 `runDialogue`의 `for` 루프는 그대로 다음 대사로 넘어가 새 오디오를 재생하는 레이스 컨디션이 실제로 있었다. Playwright로 `HTMLMediaElement.prototype.play/pause`를 몬키패치해 종료 클릭 후에도 새 `play()` 호출이 발생하는 것을 직접 확인 후 수정, 재발하지 않음을 재확인.

## [2026-07-19] 마무리 퀴즈 결과 화면에서 오답 X 아이콘 제거
- 수정/생성 파일:
  - `src/app/learn/[caseId]/call/quiz/page.tsx` — 학습 흐름의 마지막 화면(마무리 퀴즈 결과)에서만 오답 선택 시 표시되던 `MdCancel`(X) 아이콘 제거, 정답일 때의 체크 아이콘만 유지.
- 비고: 실시간 QuizCard(전화 시뮬레이션 중 판단 퀴즈)와 진행 화면 완료 카드는 X 아이콘 유지 — 마지막 페이지만 지워달라는 요청이었음.

## [2026-07-18] 학습하기 화면 카테고리 태그 반응형화
- 수정/생성 파일:
  - `src/components/learn/CategoryTagRow.tsx` — 태그 간 간격(`gap-2.5`)과 각 태그의 좌우/상하 패딩·글자 크기를 고정값에서 `clamp()` 기반 반응형으로 변경.
  - `src/app/(main)/learn/page.tsx` — 검색창·태그 영역과 "최근 학습한 사례" 카드 사이 간격(`pb-6` 고정값)을 `clamp(16px,6cqw,24px)`로 반응형화.
- 비고: 320px/500px 두 폭에서 Playwright로 태그 크기·간격이 자연스럽게 늘고 줄어드는 것을 확인.

## [2026-07-18] "취약 유형"을 AI 분석 정답률 기준으로 계산하도록 연결
- 수정/생성 파일:
  - `src/lib/progress.ts` — `StoredCaseProgress`에 `accuracy?: number` 필드 추가, `recordAnalysisAccuracy(caseId, accuracy)` 함수 추가 (completionRate/isCompleted는 건드리지 않고 accuracy만 갱신).
  - `src/app/learn/[caseId]/call/analysis/page.tsx` — AI 분석(`/api/analyze`) 응답을 받은 직후, 클라이언트에서 계산한 퀴즈 정답률(quizAccuracy)을 `recordAnalysisAccuracy`로 저장.
  - `src/app/(main)/record/page.tsx` — "취약 유형" 계산 로직 변경: 카테고리에 AI 분석을 본 적 있는 케이스가 있으면 그 정답률 평균(70% 미만이면 취약)을 우선 사용하고, 아직 한 번도 분석을 안 본 카테고리는 기존처럼 completionRate 평균(50% 미만이면 취약)으로 판단.
- 변경 내용: "AI 분석으로 나왔던 취약 유형을 학습 기록에 반영해달라"는 요청 — 이전에는 "취약 유형"이 실제 퀴즈 정답 여부와 무관하게 진행 단계(completionRate)만으로 계산됐는데, 이제 AI 분석까지 완료한 케이스는 실제 정답률이 반영됨.
- 비고: 오답 1개·정답 1개(정답률 50%)로 institution-01의 AI 분석을 완료시킨 뒤, "기관사칭"이 취약 유형 목록에 정확히 나타나는 것을 Playwright로 확인.

## [2026-07-18] 학습 기록 "최근 진행한 학습" 정렬을 실제 시간 기준으로 수정
- 수정/생성 파일: src/app/(main)/record/page.tsx
- 변경 내용: "최근 진행한 학습" 목록이 실제 시간이 아니라 `completionRate` 순으로 정렬돼 있던 버그 수정 — `lib/progress.ts`에 이미 저장되고 있던 `updatedAt` 타임스탬프 기준 내림차순으로 정렬하도록 변경. 진행 기록이 아예 없는 케이스는 목록에서 제외하고, 하나도 없으면 "아직 진행한 학습이 없어요" 빈 상태 문구를 보여줌. 표시되는 "어제"/"3일 전" 등도 고정 배열을 순서대로 매기던 가짜 값이었는데, `updatedAt` 기준으로 실제 상대 시간("N분 전"/"N시간 전"/"N일 전" 등)을 계산하는 `formatRelativeTime`으로 교체.
- 비고: 사용자가 "최근 진행한 학습이 실제 활동과 연결됐냐"고 물어봐서 점검하다 발견한 버그. "취약 유형"은 별도로 점검했는데, 케이스별 `completionRate`(도달한 시뮬레이션 단계) 평균으로 계산되는 게 맞게 동작 중임을 확인 — 다만 AI 분석 결과(좋았던 점/놓친 부분 등)는 어디에도 저장되지 않고 매번 새로 생성만 되므로, 실제 퀴즈 정답 여부나 AI 피드백 내용이 "취약 유형" 계산에는 반영되지 않는다는 점은 현재 구조상 한계로 남아있음.

## [2026-07-18] 시뮬레이션 완료 화면이 스크롤 중간부터 보이던 버그 수정
- 수정/생성 파일: src/app/learn/[caseId]/call/progress/page.tsx
- 변경 내용: 대화(dialogue) 단계와 완료(complete) 단계의 스크롤 컨테이너(`<div className="no-scrollbar flex-1 overflow-y-auto">`)가 JSX 트리에서 같은 위치에 있어 React가 DOM 엘리먼트를 그대로 재사용하고 있었음 — 그 결과 대화가 진행되며 아래로 스크롤됐던 위치(scrollTop)가 완료 화면에도 그대로 남아, 완료 화면이 맨 위가 아니라 스크롤 중간(약 160px 아래)부터 보이는 버그가 있었음. 두 컨테이너에 각각 `key="dialogue"`/`key="complete"`를 지정해 phase가 바뀔 때 React가 완전히 새로운 DOM으로 마운트하도록 수정 — 새로 마운트된 요소는 기본적으로 scrollTop이 0이라 완료 화면이 항상 맨 위부터 보이게 됨.
- 비고: 사용자가 "완료 화면이 아래에서부터 나온다"고 보고한 현상 — Playwright로 두 스크롤 컨테이너의 `scrollTop`을 직접 측정해 재현(수정 전 160px, 수정 후 0px)한 뒤 확인.

## [2026-07-18] QuizCard 선택지 세부 정렬/레이아웃 수정
- 수정/생성 파일:
  - `src/components/learn/QuizCard.tsx` — 번호("1." 등)와 선택지 텍스트를 감싼 flex의 `items-start`를 `items-center`로 변경해, 2줄 이상으로 줄바꿈되는 선택지에서도 번호가 전체 텍스트 세로 중앙에 오도록 수정. 선택지 텍스트에 `break-keep` 추가(단어 단위 줄바꿈). 정답/오답 아이콘이 선택 후에만 나타나면서 텍스트 영역이 좁아져 줄바꿈이 밀리던 문제 — 아이콘 자리를 `size-5` 고정 슬롯으로 항상 확보해 선택 전후 레이아웃이 흔들리지 않도록 수정. 선택지 버튼의 내부 패딩(`paddingInline`/`paddingBlock`)도 더 작은 최솟값으로 축소.
  - `src/app/learn/[caseId]/call/progress/page.tsx` — 통화 대화 영역 wrapper의 좌우 패딩(`px-8` 고정값)을 `clamp(16px,8cqw,32px)`로 반응형화.
- 비고: 아이콘 등장 시 텍스트가 밀려 줄 수가 바뀌던 문제와, 좁은 화면에서 번호가 텍스트 첫 줄에만 붙어 있던 문제를 Playwright로 선택 전/후 스크린샷 비교하여 검증.

## [2026-07-18] 학습 시나리오 상세 화면 간격 반응형화
- 수정/생성 파일: src/app/(main)/learn/[caseId]/page.tsx
- 변경 내용: 완료율/난이도 카드, 요약/실제 사례/예시 문자/예시 전화 대화 섹션 사이의 고정 `mt-6.25`/`mt-7.75` 간격을 `clamp()` 기반 반응형으로 변경. 하단 "전화로 시작"/"문자로 시작" 버튼도 고정 너비(`w-31.75`)·간격(`gap-9`)·패딩을 모두 `clamp()`로 축소 및 반응형화 (버튼 사이 간격은 이후 `clamp(10px, 3cqw, 20px)`로 한 번 더 줄임).

## [2026-07-18] 학습 진행률/완료 상태를 실제 활동 기반으로 추적하도록 변경
- 수정/생성 파일:
  - `src/lib/progress.ts` (신규) — `voiceshield-case-progress` localStorage 키에 케이스별 `{completionRate, isCompleted, updatedAt}`을 저장. `recordCaseProgress(caseId, phase)`로 단계 진입 시 기록(dialogue 30% → quiz 60% → complete 90% → finalQuiz 100%+완료 처리, 더 낮은 값으로는 덮어쓰지 않음), `readProgressSnapshot()`으로 전체 기록과 "가장 최근에 진행했지만 미완료인 케이스"를 읽고, `applyProgressOverride(All)`로 `mock-cases.ts`의 정적 값을 실제 기록으로 덮어씀.
  - `src/app/learn/[caseId]/call/progress/page.tsx` — `phase` 변경마다 `recordCaseProgress` 호출.
  - `src/app/learn/[caseId]/call/quiz/page.tsx` — "정답 제출" 클릭 시 `recordCaseProgress(caseId, "finalQuiz")` 호출(완료 처리).
  - `src/app/(main)/home/page.tsx` — "use client"로 전환. "이어서 학습하기" 카드가 하드코딩된 `institution-01` 대신, 진행 기록이 있으면 가장 최근에 진행한(미완료) 케이스를 보여주고 진행률도 실제 값을 표시.
  - `src/app/(main)/learn/page.tsx` — "최근 학습한 사례" 카드와 시나리오 목록 전체에 동일하게 실제 진행률 반영.
  - `src/app/(main)/record/page.tsx` — 전체 학습 진행률/완료 시나리오 개수/취약 유형/최근 진행한 학습 정렬 모두 실제 기록 기준으로 계산하도록 변경.
- 비고: localStorage는 서버에서 읽을 수 없어, 진행 기록을 반영하는 4개 페이지 모두 초기 상태는 서버·클라이언트 동일한 빈 스냅샷으로 고정하고 마운트 후 `useEffect`에서만 읽어오는 패턴(이 세션에서 반복적으로 다졌던 하이드레이션 안전 패턴)을 그대로 적용. family-01 시뮬레이션을 실제로 진행한 뒤 홈/학습하기 화면에 즉시 반영되는 것을 Playwright로 확인.

## [2026-07-18] "퀴즈N/선택N" 배지+문항을 행잉 인덴트에서 단순 상하 배치로 되돌림
- 수정/생성 파일: src/app/learn/[caseId]/call/quiz/page.tsx, src/app/learn/[caseId]/call/progress/page.tsx
- 변경 내용: "퀴즈1"/"선택N" 배지와 문항 텍스트가 한 줄을 공유하던 행잉 인덴트 방식을, 배지가 항상 자기 줄을 차지하고 문항 텍스트는 그 아래에서 시작하는 단순 `flex-col` 배치로 되돌림. 정답/오답 선택 배지(아이콘+선택한 답변 텍스트)에도 같은 행잉 인덴트를 시도했다가("아이콘 옆에 텍스트가 줄바꿈되면 아이콘 위치에 맞춰 정렬") 첫 줄의 왼쪽 패딩이 사라지는 부작용이 있어(음수 text-indent가 첫 줄의 padding을 상쇄하는 게 원인) 요청에 따라 원래의 단순 `flex items-center` 아이콘+텍스트 배치로 되돌림.
- 비고: 행잉 인덴트 자체는 잘 동작했으나, 요구사항이 "문항은 배지 아래" + "정답 배지는 아이콘 옆 그대로"로 정리되어 배지+문항만 상하 배치를 유지하고 나머지는 원복함.
- 수정/생성 파일:
  - `src/app/learn/[caseId]/call/quiz/page.tsx` — 배지 실측 너비(48.375px) + 여백(8px) = 56.375px인데 `padding-left`/`text-indent`를 60px로 잡아 약 4px 어긋나 있던 것을 56px로 정확히 맞춤.
  - `src/app/learn/[caseId]/call/progress/page.tsx` — 완료 화면의 "선택N" 배지+문항 텍스트도 동일한 행잉 인덴트 패턴으로 변경 (기존 `@[450px]:flex-row` 반응형 전환 방식 대체). 배지를 포함한 문단이 하나로 합쳐지면서, 좁은 화면에서는 자연스러운 텍스트 줄바꿈으로 배지 아래에 문항이 내려가고, 넓으면 배지 옆에 이어지는 동작이 별도 브레이크포인트 없이도 그대로 유지됨.
- 비고: 행잉 인덴트는 텍스트가 배지 옆에 붙을 공간이 없으면 자동으로 다음 줄로 넘어가므로, 기존 컨테이너 쿼리 기반 반응형 전환 없이도 "좁으면 아래로, 넓으면 옆으로"가 자연스럽게 재현됨.
- 수정/생성 파일: src/app/learn/[caseId]/call/quiz/page.tsx
- 변경 내용: `@[450px]:flex-row` 반응형 전환(넓으면 배지·문항이 한 줄, 좁으면 배지 아래로 문항이 내려감) 대신, 배지+문항을 하나의 `<p>`로 합치고 `padding-left`와 음수 `text-indent`를 이용한 행잉 인덴트(hanging indent)로 변경 — 문항이 여러 줄로 줄바꿈되어도 모든 줄이 배지 바로 뒤(첫 줄 텍스트 시작 위치)에 맞춰 정렬됨.
- 비고: 처음 구현 시 배지 안의 "퀴즈1" 글자가 배지 테두리 밖으로 빠져나와 렌더링되는 버그가 있었음 — 원인은 `text-indent`가 상속 속성이라, `inline-block`인 배지가 부모의 음수 `text-indent`를 그대로 물려받아 배지 자신의 텍스트 위치에도 다시 적용됐기 때문. 배지에 `textIndent: 0`을 명시해서 해결.
- 수정/생성 파일: src/app/learn/[caseId]/call/quiz/page.tsx
- 변경 내용:
  - 배너 바깥 컨테이너를 `justify-between`에서 `justify-center`로 변경 — 텍스트+버튼 그룹과 체크리스트 그룹이 카드 양 끝에 붙지 않고 가운데로 모이도록 함.
  - "간편 로그인 하고 / 이번 학습을 저장해보세요!" 문구는 왼쪽 정렬(`text-left`) 유지, 그 컬럼 자체만 배너 중앙으로 이동.
  - 체크리스트 pill 3개(`학습 진행률 저장` 등)를 부모 `items-end`에서 `items-stretch` + 각 pill `justify-center`로 변경해 텍스트 길이와 무관하게 모두 같은 너비로 맞춤.
  - "Kakao로 시작하기" 버튼: `justify-between`이 버튼 내부 요소(아이콘+텍스트 / 화살표)를 양 끝으로 밀어버리는 문제가 있어 제거하고 `gap-6`만으로 간격 고정. 오타로 깨져 있던 `font-ㅡ` 클래스를 `font-semibold`로 수정. 아이콘·텍스트·화살표가 한 줄로 안 맞아 보이던 것은 `text-xs`의 기본 line-height가 원인 — 버튼에 `leading-none`을 추가하고, 내부 span의 효과 없는 `text-center`(flex 자식에는 적용 안 됨)를 `items-center`로 교체해 해결.
- 비고: 사용자가 IDE에서 동시에 파일을 직접 편집하고 있어 저장 충돌(디스크가 더 최신이라는 경고)이 있었음 — 충돌 발생 시 무조건 덮어쓰지 말고 diff를 확인하도록 안내함.
- 수정/생성 파일: src/app/learn/[caseId]/call/quiz/page.tsx
- 변경 내용: pill 형태(가로로 긴 캡슐)에서 대각선이 잘 안 보인다고 판단해 그라디언트 각도를 `100deg`로 임의 조정했었으나, 사용자가 "홈 것을 그대로 가져오면 된다"고 재요청 — 각도·색상 정지점을 홈 화면 `CATEGORY_TILES`의 `135deg` 값과 완전히 동일하게 되돌림.

## [2026-07-18] 간편 로그인 배너 체크리스트를 홈 화면과 동일한 글래스모피즘 스타일로 변경
- 수정/생성 파일: src/app/learn/[caseId]/call/quiz/page.tsx
- 변경 내용: "학습 진행률 저장" 등 체크리스트 항목을 단순 텍스트+체크 문자(`✓`)에서, `src/app/(main)/home/page.tsx`의 `CATEGORY_TILES` 카드와 동일한 글래스모피즘 pill로 변경 — `bg-white/8` + `backdrop-blur-lg` + `shadow-[...]` + 그라디언트 테두리(마스크 트릭으로 구현한 1px 그라디언트 보더) + `FiCheck` 아이콘. 체크리스트 폭이 넓어지면서 "Kakao로 시작하기" 버튼이 2줄로 줄바꿈되던 부작용도 `whitespace-nowrap`/`shrink-0`으로 함께 수정.
- 비고: "홈에서 했던 코드 그대로 가져오면 된다"는 피드백에 따라, 처음 시도했던 단순 `bg-white/10` pill(반투명감이 부족하다는 피드백을 받음) 대신 홈 화면의 실제 글래스 카드 코드를 그대로 이식함.

## [2026-07-18] 마무리 퀴즈 결과 화면 간편 로그인 배너 구조를 Figma(node 44:812)에 맞게 수정
- 수정/생성 파일: src/app/learn/[caseId]/call/quiz/page.tsx
- 변경 내용: "Kakao로 시작하기" 버튼이 그라디언트 카드 밖에 별도로 떠 있던 것을, Figma 디자인대로 카드 내부의 왼쪽 컬럼(텍스트 아래)으로 이동. 왼쪽 컬럼(안내 문구 + 버튼)과 오른쪽 컬럼(학습 진행률 저장/완료한 학습 기록/취약 유형 분석 체크리스트)이 한 카드 안에서 나란히 배치되도록 구조 변경.
- 비고: 실제 Figma 링크(node-id=44-812)와 비교해 발견한 차이 — 기존 구현은 버튼을 카드 밖에 별도 엘리먼트로 두고 있었음.

## [2026-07-18] 퀴즈 정답/오답 효과음 공용화 + 종료 확인 모달 컴포넌트 추출 + 배지 스타일 조정
- 수정/생성 파일:
  - `src/lib/sound.ts` (신규) — `playFeedbackTone(correct)`을 `quiz/page.tsx`에서 이 파일로 추출. 통화 중 판단 퀴즈(`QuizCard`)와 마무리 퀴즈가 동일한 효과음을 공유하도록 함.
  - `src/components/learn/QuizCard.tsx` — 선택지 클릭 시 `playFeedbackTone`을 호출해 정답/오답 효과음이 나도록 추가 ("시나리오 퀴즈랑 똑같은 효과음으로 해달라"는 요청 반영 — 기존에는 통화 중 퀴즈에 효과음이 없었음).
  - `src/components/learn/ExitConfirmModal.tsx` (신규) — `call/progress`, `call/analysis`, `call/quiz` 세 화면에 동일하게 복붙돼 있던 "학습을 종료하시겠습니까?" 모달을 `open`/`onExit`/`onCancel` props를 받는 공용 컴포넌트로 추출. 세 페이지 모두 이 컴포넌트를 사용하도록 변경 (`call/progress`는 종료 시 재생 중인 오디오/TTS를 멈추는 로직을 `onExit` 콜백으로 그대로 유지).
  - `src/app/learn/[caseId]/call/quiz/page.tsx`, `src/app/learn/[caseId]/call/progress/page.tsx` — 결과 배지 텍스트의 `leading-none`을 `leading-tight`로 변경 (2줄로 줄바꿈될 때 줄 간격이 너무 빽빽해 보이던 문제). 마무리 퀴즈 결과 배지의 좌우 패딩을 고정 30px(`px-7.5`)에서 `clamp(8px,2.5cqw,16px)`로 다시 반응형화 — 좁은 화면에서 고정 30px 패딩 때문에 텍스트 줄바꿈이 부자연스러웠던 문제 수정.
- 비고: `ExitConfirmModal` 추출은 사용자가 "컴포넌트로 하는 게 낫지 않냐"고 제안해서 진행 — AGENTS.md의 "반복되는 UI는 즉시 컴포넌트로 추출한다" 원칙에 맞춰 이번에 정리함.

## [2026-07-18] 추천학습 카드 "학습하기" 버튼 텍스트 수직 정렬 수정 + 마무리 퀴즈 아이콘 색상
- 수정/생성 파일:
  - `src/components/cards/RecommendedCard.tsx` — "학습하기" 버튼에 `leading-none` 추가. `text-xs`의 기본 line-height(16px)가 12px 폰트 대비 여유가 있어, `items-center`로 정렬해도 한글 폰트 특성상 텍스트가 시각적으로 살짝 위로 치우쳐 보이던 문제 수정 (line-height를 폰트 크기에 맞게 압축). 이 컴포넌트는 홈 화면과 마무리 퀴즈 결과 화면에서 공용으로 쓰여 두 곳 모두에 적용됨.
  - `src/app/learn/[caseId]/call/quiz/page.tsx` — "오늘의 추천학습" 옆 아이콘(`FiBookOpen`) 색상을 `text-gray-600`으로 지정 (기존에는 부모의 `text-[#1a2035]`를 그대로 상속).
- 비고: 버튼 텍스트 정렬 문제는 line-height 자체보다, line-height가 폰트 크기보다 커서 생기는 여유 공간이 문제였음 — `leading-none`으로 정리.

## [2026-07-18] 마무리 퀴즈 정답 제출 시 효과음/색상 피드백 + 세부 스타일 조정
- 수정/생성 파일:
  - `src/app/learn/[caseId]/call/quiz/page.tsx`:
    - 기존 통화 중 퀴즈(`QuizCard`)처럼, "정답 제출" 클릭 시 정답이면 상승하는 2음(660Hz→880Hz sine), 오답이면 낮은 버저음(220Hz sawtooth)을 Web Audio API로 합성해 재생 (`playFeedbackTone`) — 별도 음원 파일 없이 오실레이터로 생성. 결과 화면의 정답/오답 아이콘·색상은 기존 구현을 그대로 사용.
    - "정답 제출" 버튼에 명시적 `bg-white` 추가 (배경 없이 부모색이 비치던 것을 수정)
    - 결과 화면의 선택한 답변 배지 좌우 패딩을 `clamp(12px,4cqw,24px)`에서 `px-7.5`(30px 고정)로 변경
    - "다음 학습이 궁금하다면?" 섹션 위 여백을 부모의 `gap-3.5`(14px)에 `mt-1`(4px)을 더해 총 18px로 조정
    - 본문 콘텐츠 좌우 패딩을 `px-4`에서 `px-4.25`(17px)로, 상하 패딩을 `py-5`에서 `py-3.5`(14px)로 변경
  - `src/app/learn/[caseId]/call/analysis/page.tsx`:
    - "놓친 부분" 목록 텍스트 색을 `text-gray-700`에서 `text-[#df1e21]/60`으로 변경 (놓친 부분임을 시각적으로 더 명확히 강조)
    - 본문 콘텐츠 좌우 패딩도 동일하게 `px-4.25`, 상하 패딩 `py-3.5`로 변경
  - `src/app/learn/[caseId]/call/progress/page.tsx` — 완료 화면 문항 카드 리스트 wrapper도 동일하게 `px-4.25 py-3.5`로 변경
- 변경 내용: 세 화면(마무리 퀴즈/AI 분석 결과/통화 완료) 모두 본문 여백을 동일한 규격(좌우 17px, 상하 14px)으로 통일. Playwright로 버튼 배경색, 배지 패딩, 섹션 간격, 텍스트 색상값을 모두 실측 검증.

## [2026-07-18] 마무리 퀴즈 화면 구현 (Figma node 44:765/44:812/44:810 기반)
- 수정/생성 파일:
  - `src/types/index.ts` — `PhishingCase`에 `finalQuiz: QuizQuestion` 필드 추가 (마무리 퀴즈용 단일 문항, 통화 중 퀴즈와 같은 주제의 다른 문항)
  - `src/lib/mock-cases.ts` — `MOCK_CASES` 5개 케이스 전부에 `finalQuiz` 데이터 추가
  - `src/lib/routes.ts` — `ROUTES.callQuiz` 추가
  - `src/components/learn/QuizCard.tsx` (신규) — 기존 `call/progress/page.tsx`에 로컬로 정의돼 있던 `QuizCard`(선택 즉시 정답/오답 표시)를 공용 컴포넌트로 추출. `call/progress/page.tsx`는 이 컴포넌트를 import하도록 변경
  - `src/app/learn/[caseId]/call/quiz/page.tsx` (신규) — 마무리 퀴즈 화면. 두 단계로 구성:
    1. 퀴즈 풀이 화면: A/B/C/D 원형 배지 선택지 + 별도 "정답 제출" 버튼(선택 전 비활성) — `QuizCard`(선택 즉시 채점)와 달리 선택과 제출이 분리된 2단계 인터랙션이라 이 화면 전용으로 새로 구현
    2. 결과 화면: 선택한 답/정오답 배지/해설/"다시 풀기" + "다음 학습이 궁금하다면?"(`RecommendedCard` 재사용) + 게스트 전용 로그인 유도 배너("간편 로그인 하고 이번 학습을 저장해보세요!" + Kakao 로그인 버튼, 로그인 상태면 미노출) + `BottomNav`
  - `src/app/learn/[caseId]/call/progress/page.tsx`, `src/app/learn/[caseId]/call/analysis/page.tsx` — "마무리 퀴즈 하러 가기" 버튼을 placeholder(`disabled`)에서 실동작(`ROUTES.callQuiz`로 이동)으로 변경
- 변경 내용: 시뮬레이션 완료 화면과 AI 분석 결과 화면의 "마무리 퀴즈 하러 가기" 버튼이 실제로 동작하도록 화면을 새로 구현. `call/quiz` 라우트는 `(main)` 그룹 밖에 있어 레이아웃상 `BottomNav`가 자동으로 붙지 않으므로, Figma 디자인대로 페이지에서 직접 `<BottomNav />`를 렌더링함 (통화 시뮬레이션 화면들과 달리 이 화면은 다시 브라우징으로 돌아가는 느낌을 의도한 디자인).
- 비고: 로그인 상태(`isLoggedIn`)도 `localStorage` 값이라 렌더링 중 바로 읽으면 하이드레이션 에러가 나므로, `AI 분석 결과` 화면에서 겪었던 것과 동일한 패턴(초기값 고정 + `useEffect`에서 읽기)으로 처리. Playwright로 퀴즈 풀이→제출→결과, 다시 풀기, 로그인 클릭 시 배너 숨김, 종료 모달, 두 화면에서의 버튼 연결까지 전부 검증 완료.

## [2026-07-18] 통화중/AI분석 상태 배지 반응형 크기 축소 + 정답 배지 단어 단위 줄바꿈 수정
- 수정/생성 파일:
  - `src/app/learn/[caseId]/call/progress/page.tsx` — 헤더의 "통화중"/"시뮬레이션 완료" 상태 배지(높이/패딩/점/텍스트)를 고정 크기(`h-8`, `px-4`, `text-sm`)에서 `clamp(min, Ncqw, max)` 기반으로 변경해 좁은 화면에서 더 작게 줄어들도록 함. 완료 화면의 정답/오답 선택 배지와 "선택N" 옆 문항 텍스트에 모두 `break-keep`을 추가해 좁은 화면에서 "확인한다" 같은 단어가 "확인한"/"다."처럼 글자 단위로 끊기던 문제를 단어 단위 줄바꿈으로 수정. 정답/오답 배지 좌우 패딩도 `clamp(12px,4cqw,24px)`로 반응형화. "선택N" 옆 문항 텍스트는 부모(`text-center`)로부터 정렬을 물려받아 문항에 따라 중앙/왼쪽 정렬이 뒤섞여 보이던 문제가 있어, `text-left`를 명시해 항상 왼쪽 정렬되도록 고정.
  - `src/app/learn/[caseId]/call/analysis/page.tsx` — "AI 분석 결과" 상태 배지도 동일하게 `clamp()` 기반 반응형 크기로 축소.
- 변경 내용: 실제 스크린샷으로 문제였던 글자 단위 줄바꿈이 단어 단위로 바뀐 것과, 좁은 뷰포트(320px)에서 배지들이 작게 줄어드는 것을 Playwright로 확인. "선택N" 배지와 문항 텍스트를 담은 컨테이너에 `@[450px]:flex-row`(기본은 `flex-col`)를 적용해, 컨테이너 폭 450px 이하에서는 문항 텍스트가 배지 옆이 아니라 배지 아래 줄로 내려가도록 함 — 440px(세로)/460px(가로)에서 `flex-direction` 실측으로 경계값 검증 완료. 완료 화면 문항 카드의 상단 패딩(`pt-8.5` 고정값)도 `clamp(20px, 6cqw, 34px)`로 반응형화 — 320px 컨테이너에서 20px, 500px에서 30px로 스케일링되는 것을 실측 확인.

## [2026-07-18] AI 분석 결과 화면 색상/아이콘 세부 조정
- 수정/생성 파일: src/app/learn/[caseId]/call/analysis/page.tsx
- 변경 내용: 헤더의 시나리오 제목 문구 제거, 헤더 상단 아이콘을 `RiShiningFill`에서 `RiShiningLine`으로 변경, "AI 피드백" 옆 아이콘 색상을 `#60A5FA`로, "행동수칙" 옆 아이콘 색상을 `gray-500`으로, "놓친 부분" 카드 테두리 투명도를 50%에서 60%로 변경.

## [2026-07-18] Gemini 모델 폴백 체인 추가 + AI 분석 화면 하이드레이션 버그 수정
- 수정/생성 파일:
  - `src/app/api/analyze/route.ts` — 모델을 하나만 호출하던 것을 `MODEL_FALLBACK_CHAIN`(`gemini-flash-latest` → `gemini-2.0-flash` → `gemini-2.0-flash-lite` → `gemini-2.5-flash` → `gemini-2.5-flash-lite` → `gemini-pro-latest`) 순서로 시도하도록 변경. 앞 모델이 할당량 소진(429)이나 서비스 종료(404) 등으로 실패하면 자동으로 다음 모델로 넘어가고, 전부 실패했을 때만 502를 반환한다.
  - `src/app/learn/[caseId]/call/analysis/page.tsx` — 검증 중 발견한 하이드레이션 에러 수정. `sessionStorage`는 브라우저 전용 API라 서버 렌더 시점엔 항상 비어 있는데, 기존 코드는 `useState(() => readAnalysisInput(caseId))` 형태의 lazy initializer로 렌더링 중 바로 읽어서 초기 `status`(loading/error)가 서버·클라이언트 간 달라져 React 하이드레이션 불일치가 발생했음. `input`/`status`의 초기값을 서버·클라이언트 동일하게(`null`/`"loading"`) 고정하고, 실제 `sessionStorage` 읽기는 마운트 후 effect 안으로 옮겨 해결.
- 변경 내용: 사용자가 "제미나이 크레딧(할당량) 끝나면 다른 버전으로 이어지게 해달라"고 요청 — 특정 모델이 막혀도 서비스가 끊기지 않도록 자동 폴백을 구현.
- 비고: 폴백 체인의 각 후보 모델을 실제로 순서대로 실패시켜(존재하지 않는 가짜 모델명 2개 → 마지막에 진짜 모델) 다음 후보로 넘어가는 로직 자체를 검증 완료. `analysis/page.tsx`는 Playwright 콘솔/pageerror 로그로 하이드레이션 에러를 직접 확인한 뒤 수정 — 스타일 변경(색상/아이콘) 작업 중 검증 단계에서 우연히 발견한 기존 버그였음.

## [2026-07-18] /api/analyze 502 에러 수정 — Gemini 모델명 변경
- 수정/생성 파일: src/app/api/analyze/route.ts
- 변경 내용: `gemini-2.0-flash` 모델이 이 계정 무료 티어에서 항상 429(`limit: 0`)로 막혀 있던 문제 원인 파악. Google AI Studio 사용량 대시보드 확인 결과 "Gemini 2 Flash" 카테고리 자체가 0/0/0 한도였고, `gemini-2.5-flash`/`gemini-2.5-flash-lite`는 이미 "신규 사용자에게 더 이상 제공되지 않음"(404)으로 막혀 있었음. 실제 사용 가능한 별칭 모델 `gemini-flash-latest`로 전환해 정상 200 응답 확인.
- 비고: API 키/프로젝트 문제가 아니라 모델 세대 문제였음 — 이후 특정 Gemini 모델이 404/429로 막히면 `GET https://generativelanguage.googleapis.com/v1beta/models?key=...`로 이 키에서 실제 호출 가능한 모델 목록을 먼저 확인할 것.

## [2026-07-18] AI 분석 결과 화면에도 학습 종료 확인 모달 추가
- 수정/생성 파일: src/app/learn/[caseId]/call/analysis/page.tsx
- 변경 내용: X 버튼 클릭 시 바로 시나리오 상세로 이동하던 것을, `call/progress` 화면과 동일한 "학습을 종료하시겠습니까?" 확인 모달을 거치도록 변경 ("종료하기" → 시나리오 상세 이동, "계속하기" → 모달만 닫힘).

## [2026-07-18] AI 분석 결과 화면 구현 (Google Gemini 연동)
- 수정/생성 파일:
  - `src/app/api/analyze/route.ts` (신규) — Gemini(`gemini-2.0-flash`) 호출, `responseSchema`로 구조화된 JSON 응답 강제
  - `src/app/learn/[caseId]/call/analysis/page.tsx` (신규) — Figma 디자인(node 43-654) 기반 AI 분석 결과 화면
  - `src/lib/analysis.ts` (신규) — `saveAnalysisInput`/`readAnalysisInput`, sessionStorage 기반 화면 간 퀴즈 결과 핸드오프
  - `src/lib/routes.ts` — `ROUTES.callAnalysis` 추가
  - `src/types/index.ts` — `AnalyzeRequest`, `AiAnalysisResult` 타입 추가
  - `src/app/learn/[caseId]/call/progress/page.tsx` — "AI 분석 결과 보기" 버튼을 placeholder(`disabled`)에서 실동작으로 변경 (`saveAnalysisInput` 후 `/call/analysis`로 이동)
  - `.env.local` — `GOOGLE_GEMINI_API_KEY` 항목 추가 (값은 사용자가 Google AI Studio에서 무료 발급 후 직접 입력)
  - `package.json` — `@google/generative-ai` 의존성 추가
  - `AGENTS.md` — 실제 네트워크 라우트가 `/api/tts` 하나뿐이라는 서술을 `/api/tts` + `/api/analyze` 두 개로 수정, sessionStorage 핸드오프 패턴 문서화
- 변경 내용: 전화 시뮬레이션 완료 후 퀴즈 응답을 Gemini에 전달해 AI 피드백(피드백 문장, 반응 속도, 의심도, 좋았던 점, 놓친 부분, 행동수칙)을 생성하고 전용 화면에 렌더링. 정확도(%)는 AI가 아닌 클라이언트에서 퀴즈 정답 여부로 직접 계산해 신뢰성을 보장. sessionStorage에 저장된 입력값이 없는 상태로 화면에 직접 진입하면 시나리오 상세 화면으로 리다이렉트.
- 비고: React Strict Mode에서 `useEffect`가 두 번 실행되며 `/api/analyze`가 중복 호출되는 버그가 있었음 — 최초 시도(`cancelled` 클로저 변수 + `hasFetchedRef` 병행)는 오히려 로딩 상태에서 멈추는 새로운 버그를 유발했고, `hasFetchedRef` 단독 가드로 교체해 해결(첫 실행에서 시작한 요청 하나만 항상 끝까지 살아남아 상태를 반영하므로 별도 취소 플래그 불필요). Playwright로 요청 1회만 발생, 정확도 계산, 미저장 상태 리다이렉트까지 모두 검증 완료.

## [2026-07-18] AI분석/마무리퀴즈 버튼에도 데스크톱 호버 효과 추가
- 수정/생성 파일: src/app/learn/[caseId]/call/progress/page.tsx
- 변경 내용: "다시 하기" 버튼에만 있던 데스크톱 호버 효과를 "AI 분석 결과 보기"(호버 시 배경 살짝 밝게), "마무리 퀴즈 하러 가기"(호버 시 `bg-gray-50`)에도 동일하게 추가. `disabled` 버튼이라도 `:hover` 자체는 CSS상 정상 적용됨.

## [2026-07-18] AI분석/마무리퀴즈 버튼 opacity-50이 색을 washed-out으로 만들던 문제 수정
- 수정/생성 파일: src/app/learn/[caseId]/call/progress/page.tsx
- 변경 내용: "AI 분석 결과 보기"/"마무리 퀴즈 하러 가기" 버튼에 지정한 색(`#1a2035` 등)이 "적용이 안 되는 것 같다"는 피드백 — 실제로는 `opacity-50`(원래 "(준비중)" 문구와 함께 비활성 느낌을 주려던 것)이 색을 흰 배경과 섞어 옅게 보이게 한 것이었음. "(준비중)" 라벨을 이미 제거한 상태라 opacity까지 남아있으면 지정한 색이 그대로 안 보이므로, 두 버튼의 `opacity-50`을 제거해 처음부터 지정한 색이 온전히 보이도록 함.
- 비고: 버튼은 여전히 `disabled`(클릭 불가) 상태 유지 — 시각적으로만 흐릿하게 보이던 걸 정상 밝기로 되돌린 것.

## [2026-07-18] 마무리 퀴즈 버튼 텍스트 색상 통일
- 수정/생성 파일: src/app/learn/[caseId]/call/progress/page.tsx
- 변경 내용: "마무리 퀴즈 하러 가기" 버튼 텍스트 색을 `#1a2332`에서 `#1a2035`로 변경 — "AI 분석 결과 보기" 버튼 배경과 동일한 색으로 통일.

## [2026-07-18] 완료 화면 하단 액션 버튼 스타일 정리 (선택카드 정렬 + 다시하기/AI분석/마무리퀴즈)
- 수정/생성 파일: src/app/learn/[caseId]/call/progress/page.tsx
- 변경 내용:
  1. 완료 화면 결과 카드의 "선택N" 칩+질문 텍스트 줄을 가운데 정렬에서 왼쪽 정렬로 변경(`w-full justify-start`) — 선택1/선택2 카드 모두 동일한 좌측 시작 위치를 갖도록 함(카드 패딩이 같으므로 자연히 정렬됨).
  2. "다시 하기" 버튼: 기본 텍스트 색을 `text-gray-600`→`text-gray-500`으로, 호버 시 `#1a2035`로 변하도록 추가.
  3. "AI 분석 결과 보기": 아이콘을 `HiSparkles`→`RiShiningLine`으로 교체, "(준비중)" 라벨 제거(배경 `#1a2035`는 기존 유지).
  4. "마무리 퀴즈 하러 가기": "(준비중)" 라벨 제거, 기존 단색 테두리(`border-[#1a2035]`)를 `#1a2035→#2d1f4e` 그라데이션 테두리로 변경 — 바깥 div에 그라데이션 배경 + `p-[1.5px]` 패딩을 주고 안쪽에 흰 배경 버튼을 얹는 방식으로 구현(CSS는 순수 `border-image` 그라데이션을 `border-radius`와 함께 깔끔히 쓰기 어려워 흔히 쓰는 우회 기법).
- 비고: 두 버튼 모두 여전히 `disabled` 상태를 유지함 — "(준비중)" 문구만 뺀 것이고 실제 AI 분석/마무리 퀴즈 기능이 생긴 것은 아님(이 프로젝트는 여전히 프론트엔드+목데이터 단계).

## [2026-07-18] 완료 화면 해설 텍스트 왼쪽 정렬
- 수정/생성 파일: src/app/learn/[caseId]/call/progress/page.tsx
- 변경 내용: 완료 화면 결과 카드의 해설(explanation) 텍스트가 상위 컨테이너의 `text-center` 상속으로 가운데 정렬되어 있던 것을 `text-left`로 명시해 왼쪽 정렬로 변경.

## [2026-07-18] 완료 화면 결과 배지 아이콘·텍스트 세로 정렬 수정
- 수정/생성 파일: src/app/learn/[caseId]/call/progress/page.tsx
- 변경 내용: 완료 화면의 정답/오답 배지에서 아이콘(`RiCheckboxCircleFill`/`MdCancel`)과 선택지 텍스트가 미묘하게 세로로 어긋나 보이던 문제 수정 — 텍스트를 `<span className="leading-none">`으로 감싸 line-height로 인한 정렬 오차를 제거함 (기존 학습기록 페이지의 배지 정렬 패턴과 동일).
- 비고: 같은 세션에서 `runDialogue` useEffect의 `eslint-disable-next-line react-hooks/exhaustive-deps` 주석이 파일 수정 과정 중 유실되어 lint 경고가 났던 것도 함께 복원함.

## [2026-07-18] 정답/오답 아이콘을 원형 채움 아이콘으로 교체
- 수정/생성 파일: src/app/learn/[caseId]/call/progress/page.tsx
- 변경 내용: 퀴즈 선택지와 완료 화면 결과 카드에서 정답/오답을 나타내던 `IoCheckmark`/`IoClose`(테두리 없는 단순 체크·X)를 `RiCheckboxCircleFill`/`MdCancel`(배경까지 채워진 원형 체크·X)로 교체.

## [2026-07-18] 통화 진행 화면 세부 간격 미세조정 (헤더/퀴즈카드/완료화면 카드)
- 수정/생성 파일: src/app/learn/[caseId]/call/progress/page.tsx
- 변경 내용: 헤더 상단 패딩 27px 고정, X·음소거 버튼 상단 위치를 20px→21px로 조정해 배지와의 간격을 6px로 맞춤. 배지↔시나리오 제목 간격과 제목↔웨이브폼 간격은 기존 `clamp(10px,3cqh,15px)`을 유지하되, "올바른 대응" 통계 텍스트만 별도로 5px 간격으로 분리(기존엔 컨테이너 `gap`으로 셋이 같은 간격을 공유했음 — `gap` 대신 각 자식에 개별 `marginTop`을 주는 방식으로 구조 변경). 퀴즈 카드 바깥 여백을 위 14px/양옆 17px로, 완료 화면의 문항별 결과 카드 패딩을 위 34px/양옆 25px로 조정.

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
