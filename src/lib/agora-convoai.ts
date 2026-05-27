import { env, basicAuthHeader } from "@/lib/env";

interface JoinOptions {
  channel: string;
  remoteUid: string;
  agentName: string;
  agentRtcUid: string;
  agentRtcToken: string;
  greeting: string;
  failureMessage: string;
  systemPrompt: string;
}

interface JoinResponse {
  agent_id?: string;
  status?: string;
  message?: string;
  [key: string]: unknown;
}

export async function startConvoAiAgent(opts: JoinOptions): Promise<JoinResponse> {
  const url = `${env.agoraRestBaseUrl}/api/conversational-ai-agent/v2/projects/${encodeURIComponent(env.agoraAppId)}/join`;

  // ASR vendor is omitted to use Agora's default ASR (Deepgram managed).
  const ttsBlock =
    env.ttsVendor === "openai"
      ? {
          vendor: "openai",
          params: {
            base_url: env.openAiTtsBaseUrl,
            api_key: env.openAiApiKey,
            model: env.openAiTtsModel,
            voice: env.openAiTtsVoice,
            instructions: env.openAiTtsInstructions,
            speed: 1,
          },
        }
      : {
          vendor: "elevenlabs",
          params: {
            base_url: "wss://api.elevenlabs.io/v1",
            key: env.elevenLabsApiKey,
            model_id: env.elevenLabsModelId,
            voice_id: env.elevenLabsVoiceId,
            sample_rate: 24000,
          },
        };

  const payload = {
    name: opts.agentName,
    properties: {
      channel: opts.channel,
      token: opts.agentRtcToken,
      agent_rtc_uid: opts.agentRtcUid,
      remote_rtc_uids: [opts.remoteUid],
      enable_string_uid: true,
      idle_timeout: 180,
      llm: {
        // Channel travels via query string so the proxy can route insights back to the right session.
        url: `${env.publicBaseUrl.replace(/\/$/, "")}/api/llm/chat/completions?channel=${encodeURIComponent(opts.channel)}`,
        api_key: env.llmProxySecret,
        system_messages: [
          {
            role: "system",
            content: opts.systemPrompt,
          },
        ],
        greeting_message: opts.greeting,
        failure_message: opts.failureMessage,
        max_history: 32,
        params: {
          model: env.geminiModel,
          stream: false,
        },
      },
      asr: { language: env.asrLanguage },
      tts: ttsBlock,
    },
  };

  const response = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: basicAuthHeader(env.agoraRestKey, env.agoraRestSecret),
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
    cache: "no-store",
  });

  const text = await response.text();
  let parsed: JoinResponse;
  try {
    parsed = JSON.parse(text) as JoinResponse;
  } catch {
    throw new Error(`ConvoAI join non-JSON response (${response.status}): ${text.slice(0, 300)}`);
  }

  if (!response.ok) {
    throw new Error(
      `ConvoAI join failed: ${response.status} ${parsed.message ?? text.slice(0, 200)}`,
    );
  }

  return parsed;
}

export async function queryConvoAiAgent(agentId: string): Promise<JoinResponse> {
  const url = `${env.agoraRestBaseUrl}/api/conversational-ai-agent/v2/projects/${encodeURIComponent(
    env.agoraAppId,
  )}/agents/${encodeURIComponent(agentId)}`;
  const response = await fetch(url, {
    method: "GET",
    headers: { Authorization: basicAuthHeader(env.agoraRestKey, env.agoraRestSecret) },
    cache: "no-store",
  });
  const text = await response.text();
  try {
    return JSON.parse(text) as JoinResponse;
  } catch {
    return { status: String(response.status), message: text.slice(0, 300) };
  }
}

export async function stopConvoAiAgent(agentId: string): Promise<JoinResponse> {
  const url = `${env.agoraRestBaseUrl}/api/conversational-ai-agent/v2/projects/${encodeURIComponent(
    env.agoraAppId,
  )}/agents/${encodeURIComponent(agentId)}/leave`;

  const response = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: basicAuthHeader(env.agoraRestKey, env.agoraRestSecret),
    },
    cache: "no-store",
  });

  const text = await response.text();
  let parsed: JoinResponse;
  try {
    parsed = text ? (JSON.parse(text) as JoinResponse) : { status: "ok" };
  } catch {
    parsed = { status: "ok", raw: text };
  }

  if (!response.ok) {
    throw new Error(`ConvoAI leave failed: ${response.status} ${text.slice(0, 200)}`);
  }

  return parsed;
}
