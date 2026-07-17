export const TTS_SPEEDS = ["X 0.5", "X 1.0", "X 1.5", "X 2.0"] as const;
export const TTS_VOICES = ["V1", "V2", "V3", "V4"] as const;

export const TTS_VOICE_STORAGE_KEY = "voiceshield-tts-voice";
export const TTS_SPEED_STORAGE_KEY = "voiceshield-tts-speed";

/** 설정 페이지에서 저장한 TTS 음성/속도 선호값을 읽어온다. 저장된 값이 없거나 유효하지 않으면 기본값(V1, 1배속)을 반환한다. */
export function getStoredTtsPreference(): { voice: (typeof TTS_VOICES)[number]; rate: number } {
  if (typeof window === "undefined") return { voice: "V1", rate: 1 };

  const storedVoice = localStorage.getItem(TTS_VOICE_STORAGE_KEY);
  const voice = (TTS_VOICES as readonly string[]).includes(storedVoice ?? "")
    ? (storedVoice as (typeof TTS_VOICES)[number])
    : "V1";

  const storedSpeed = localStorage.getItem(TTS_SPEED_STORAGE_KEY);
  const rate = storedSpeed ? parseFloat(storedSpeed.replace("X ", "")) || 1 : 1;

  return { voice, rate };
}

const ttsBlobCache = new Map<string, Promise<Blob>>();

function ttsCacheKey(text: string, voice: string, rate: number) {
  return `${voice}:${rate}:${text}`;
}

/**
 * `/api/tts` 요청을 캐시와 함께 시작한다. 같은 (text, voice, rate) 조합으로 이미 요청 중이거나
 * 완료된 게 있으면 그걸 그대로 재사용한다 — 수신 전화 화면에서 미리 불러둔 첫 대사를 통화 진행
 * 화면에서 다시 fetch하지 않고 바로 이어받아, 실제 재생까지 걸리는 체감 시간을 줄이기 위함.
 */
export function prefetchTts(text: string, voice: string, rate: number): Promise<Blob> {
  const key = ttsCacheKey(text, voice, rate);
  const cached = ttsBlobCache.get(key);
  if (cached) return cached;

  const request = fetch("/api/tts", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text, voice, rate }),
  }).then((res) => {
    if (!res.ok) throw new Error("TTS request failed");
    return res.blob();
  });

  request.catch(() => ttsBlobCache.delete(key));
  ttsBlobCache.set(key, request);
  return request;
}
