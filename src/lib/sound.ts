/** 퀴즈 정답/오답 선택 시 재생하는 효과음. 별도 음원 파일 없이 Web Audio API 오실레이터로 합성한다. */
export function playFeedbackTone(correct: boolean) {
  if (typeof window === "undefined") return;
  const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
  const ctx = new AudioContextClass();
  const notes = correct ? [660, 880] : [220];
  const noteDuration = correct ? 0.12 : 0.28;

  notes.forEach((frequency, i) => {
    const startTime = ctx.currentTime + i * noteDuration;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = correct ? "sine" : "sawtooth";
    osc.frequency.value = frequency;
    gain.gain.setValueAtTime(0.15, startTime);
    gain.gain.exponentialRampToValueAtTime(0.001, startTime + noteDuration);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(startTime);
    osc.stop(startTime + noteDuration);
  });

  setTimeout(() => ctx.close(), (notes.length * noteDuration + 0.1) * 1000);
}
