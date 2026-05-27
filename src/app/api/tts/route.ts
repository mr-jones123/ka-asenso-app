import { NextResponse } from "next/server";
import { z } from "zod";
import { env } from "@/lib/env";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const TtsSchema = z.object({
  text: z.string().trim().min(1).max(5000),
});

interface GeminiInlineData {
  data?: string;
  mimeType?: string;
}

interface GeminiTtsResponse {
  candidates?: Array<{
    content?: {
      parts?: Array<{
        inlineData?: GeminiInlineData;
        inline_data?: GeminiInlineData;
      }>;
    };
  }>;
  error?: {
    message?: string;
    status?: string;
  };
}

function wavFromPcm(pcm: Buffer, sampleRate = 24000, channels = 1, bitsPerSample = 16) {
  const header = Buffer.alloc(44);
  const byteRate = (sampleRate * channels * bitsPerSample) / 8;
  const blockAlign = (channels * bitsPerSample) / 8;

  header.write("RIFF", 0);
  header.writeUInt32LE(36 + pcm.length, 4);
  header.write("WAVE", 8);
  header.write("fmt ", 12);
  header.writeUInt32LE(16, 16);
  header.writeUInt16LE(1, 20);
  header.writeUInt16LE(channels, 22);
  header.writeUInt32LE(sampleRate, 24);
  header.writeUInt32LE(byteRate, 28);
  header.writeUInt16LE(blockAlign, 32);
  header.writeUInt16LE(bitsPerSample, 34);
  header.write("data", 36);
  header.writeUInt32LE(pcm.length, 40);

  return Buffer.concat([header, pcm]);
}

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  const parsed = TtsSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "invalid_payload", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const model = env.geminiTtsModel;
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(
    model,
  )}:generateContent`;
  const text = `${env.geminiTtsPrompt}\n\n${parsed.data.text}`;
  const geminiPayload = JSON.stringify({
    contents: [
      {
        parts: [{ text }],
      },
    ],
    generationConfig: {
      responseModalities: ["AUDIO"],
      speechConfig: {
        voiceConfig: {
          prebuiltVoiceConfig: {
            voiceName: env.geminiTtsVoice,
          },
        },
      },
    },
  });

  let response: Response;
  try {
    response = await fetchGeminiTts(url, geminiPayload);
    if (response.status >= 500) {
      await new Promise((resolve) => setTimeout(resolve, 300));
      response = await fetchGeminiTts(url, geminiPayload);
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : "unknown_error";
    return NextResponse.json({ error: "tts_request_failed", message }, { status: 502 });
  }

  const payloadText = await response.text();
  let payload: GeminiTtsResponse;
  try {
    payload = JSON.parse(payloadText) as GeminiTtsResponse;
  } catch {
    return NextResponse.json(
      { error: "tts_invalid_response", message: payloadText.slice(0, 300) },
      { status: 502 },
    );
  }

  if (!response.ok) {
    return NextResponse.json(
      {
        error: "tts_failed",
        message: payload.error?.message ?? (payloadText.slice(0, 300) || response.statusText),
      },
      { status: 502 },
    );
  }

  const part = payload.candidates?.[0]?.content?.parts?.find(
    (candidatePart) => candidatePart.inlineData?.data ?? candidatePart.inline_data?.data,
  );
  const inlineData = part?.inlineData ?? part?.inline_data;
  if (!inlineData?.data) {
    return NextResponse.json(
      {
        error: "tts_no_audio",
        message: payloadText.slice(0, 300) || "Gemini TTS response did not include audio data",
      },
      { status: 502 },
    );
  }

  const pcm = Buffer.from(inlineData.data, "base64");
  const wav = wavFromPcm(pcm);

  return new Response(new Uint8Array(wav), {
    status: 200,
    headers: {
      "Content-Type": "audio/wav",
      "Cache-Control": "no-store",
    },
  });
}

function fetchGeminiTts(url: string, body: string) {
  return fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-goog-api-key": env.geminiApiKey,
    },
    body,
    cache: "no-store",
  });
}
