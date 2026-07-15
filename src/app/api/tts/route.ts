import { NextRequest, NextResponse } from "next/server";
import textToSpeech from "@google-cloud/text-to-speech";

const client = new textToSpeech.TextToSpeechClient({
  projectId: process.env.GOOGLE_TTS_PROJECT_ID,
  credentials: {
    client_email: process.env.GOOGLE_TTS_CLIENT_EMAIL,
    private_key: process.env.GOOGLE_TTS_PRIVATE_KEY?.replace(/\\n/g, "\n"),
  },
});

const VOICE_MAP: Record<string, { name: string; ssmlGender: "MALE" | "FEMALE" }> = {
  V1: { name: "ko-KR-Chirp3-HD-Erinome", ssmlGender: "FEMALE" },
  V2: { name: "ko-KR-Chirp3-HD-Gacrux", ssmlGender: "FEMALE" },
  V3: { name: "ko-KR-Chirp3-HD-Umbriel", ssmlGender: "MALE" },
  V4: { name: "ko-KR-Chirp3-HD-Algieba", ssmlGender: "MALE" },
};

export async function POST(request: NextRequest) {
  const { text, voice, rate } = await request.json();

  const voiceConfig = VOICE_MAP[voice] ?? VOICE_MAP.V1;

  const [response] = await client.synthesizeSpeech({
    input: { text },
    voice: { languageCode: "ko-KR", name: voiceConfig.name, ssmlGender: voiceConfig.ssmlGender },
    audioConfig: { audioEncoding: "MP3", speakingRate: rate ?? 1 },
  });

  return new NextResponse(new Uint8Array(response.audioContent as Buffer), {
    headers: { "Content-Type": "audio/mpeg" },
  });
}
