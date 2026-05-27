function readRequired(key: string): string {
  const value = process.env[key];
  if (!value || value.trim() === "") {
    throw new Error(`Missing required env: ${key}`);
  }
  return value.trim();
}

function readOptional(key: string, fallback = ""): string {
  return (process.env[key] ?? fallback).trim();
}

export const env = {
  get agoraAppId() {
    return readRequired("AGORA_APP_ID");
  },
  get agoraAppCertificate() {
    return readRequired("AGORA_APP_CERTIFICATE");
  },
  get agoraRestKey() {
    return readRequired("AGORA_REST_KEY");
  },
  get agoraRestSecret() {
    return readRequired("AGORA_REST_SECRET");
  },
  get agoraRestBaseUrl() {
    return readOptional("AGORA_REST_BASE_URL", "https://api.agora.io");
  },
  get publicBaseUrl() {
    return readRequired("PUBLIC_BASE_URL");
  },
  get llmProxySecret() {
    return readRequired("LLM_PROXY_SECRET");
  },
  get geminiApiKey() {
    return readRequired("GEMINI_API_KEY");
  },
  get geminiModel() {
    return readOptional("GEMINI_MODEL", "gemini-2.5-flash");
  },
  get asrLanguage() {
    return readOptional("ASR_LANGUAGE", "en-US");
  },
  get ttsVendor() {
    return readOptional("TTS_VENDOR", "elevenlabs");
  },
  get elevenLabsApiKey() {
    return readRequired("ELEVENLABS_API_KEY");
  },
  get elevenLabsVoiceId() {
    return readOptional("ELEVENLABS_VOICE_ID", "pNInz6obpgDQGcFmaJgB");
  },
  get elevenLabsModelId() {
    return readOptional("ELEVENLABS_MODEL_ID", "eleven_flash_v2_5");
  },
  get openAiApiKey() {
    return readRequired("OPENAI_API_KEY");
  },
  get openAiTtsBaseUrl() {
    return readOptional("OPENAI_TTS_BASE_URL", "https://api.openai.com/v1");
  },
  get openAiTtsModel() {
    return readOptional("OPENAI_TTS_MODEL", "gpt-4o-mini-tts");
  },
  get openAiTtsVoice() {
    return readOptional("OPENAI_TTS_VOICE", "coral");
  },
  get openAiTtsInstructions() {
    return readOptional(
      "OPENAI_TTS_INSTRUCTIONS",
      "Please use standard American English, natural tone, moderate pace, and steady intonation",
    );
  },
};

export function basicAuthHeader(key: string, secret: string): string {
  const encoded = Buffer.from(`${key}:${secret}`).toString("base64");
  return `Basic ${encoded}`;
}
