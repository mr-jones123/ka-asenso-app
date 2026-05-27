import { GoogleGenerativeAI } from "@google/generative-ai";
import { env } from "@/lib/env";
import { appendAssistantToken, appendUserUtterance } from "@/lib/runtime-store";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

interface OpenAiMessage {
  role: "system" | "user" | "assistant" | "developer";
  content: string;
}

interface OpenAiRequest {
  model?: string;
  messages: OpenAiMessage[];
  stream?: boolean;
  channel?: string;
  user?: string;
  metadata?: Record<string, unknown>;
}

function sseChunk(payload: object): string {
  return `data: ${JSON.stringify(payload)}\n\n`;
}

function makeChunk(
  id: string,
  model: string,
  delta: { role?: "assistant"; content?: string },
  finish: string | null,
) {
  return {
    id,
    object: "chat.completion.chunk",
    created: Math.floor(Date.now() / 1000),
    model,
    choices: [
      {
        index: 0,
        delta,
        finish_reason: finish,
      },
    ],
  };
}

function extractChannel(req: OpenAiRequest, request: Request): string {
  if (req.channel) return req.channel;
  if (req.metadata && typeof req.metadata["channel"] === "string") {
    return req.metadata["channel"] as string;
  }
  const url = new URL(request.url);
  const fromQuery = url.searchParams.get("channel");
  if (fromQuery) return fromQuery;
  return "default";
}

function toGeminiHistory(messages: OpenAiMessage[]) {
  const systemBits: string[] = [];
  const turns: { role: "user" | "model"; parts: { text: string }[] }[] = [];

  for (const msg of messages) {
    if (msg.role === "system" || msg.role === "developer") {
      systemBits.push(msg.content);
      continue;
    }
    turns.push({
      role: msg.role === "assistant" ? "model" : "user",
      parts: [{ text: msg.content }],
    });
  }

  return { systemInstruction: systemBits.join("\n\n").trim(), turns };
}

export async function POST(request: Request) {
  // Accept any of: Authorization: Bearer X, Authorization: X, api-key: X, x-api-key: X
  const headers = request.headers;
  const authHeader = (headers.get("authorization") ?? "").trim();
  const apiKeyHeader = (headers.get("api-key") ?? headers.get("x-api-key") ?? "").trim();
  const presented = authHeader.toLowerCase().startsWith("bearer ")
    ? authHeader.slice(7).trim()
    : authHeader || apiKeyHeader;
  if (presented !== env.llmProxySecret) {
    return new Response(JSON.stringify({ error: "unauthorized" }), {
      status: 401,
      headers: { "content-type": "application/json" },
    });
  }

  let body: OpenAiRequest;
  try {
    body = (await request.json()) as OpenAiRequest;
  } catch {
    return new Response(JSON.stringify({ error: "invalid_json" }), {
      status: 400,
      headers: { "content-type": "application/json" },
    });
  }

  const channel = extractChannel(body, request);
  const stream = body.stream !== false;
  const requestedModel = body.model ?? env.geminiModel;

  console.log(`[llm-proxy] channel=${channel} stream=${stream} model=${requestedModel} msgs=${body.messages.length}`);

  const latestUser = [...body.messages].reverse().find((m) => m.role === "user");
  if (latestUser) {
    appendUserUtterance(channel, latestUser.content);
  }

  const { systemInstruction, turns } = toGeminiHistory(body.messages);
  const ai = new GoogleGenerativeAI(env.geminiApiKey);
  const model = ai.getGenerativeModel({
    model: requestedModel,
    systemInstruction: systemInstruction || undefined,
    generationConfig: {
      temperature: 0.7,
      maxOutputTokens: 320,
    },
  });

  const id = `chatcmpl-${Math.random().toString(36).slice(2, 12)}`;

  if (!stream) {
    try {
      const result = await model.generateContent({ contents: turns });
      const text = result.response.text();
      appendAssistantToken(channel, text);
      return new Response(
        JSON.stringify({
          id,
          object: "chat.completion",
          created: Math.floor(Date.now() / 1000),
          model: requestedModel,
          choices: [
            {
              index: 0,
              message: { role: "assistant", content: text },
              finish_reason: "stop",
            },
          ],
        }),
        { status: 200, headers: { "content-type": "application/json" } },
      );
    } catch (error) {
      const message = error instanceof Error ? error.message : "unknown_error";
      return new Response(JSON.stringify({ error: "gemini_failed", message }), {
        status: 502,
        headers: { "content-type": "application/json" },
      });
    }
  }

  const encoder = new TextEncoder();
  const sseStream = new ReadableStream({
    async start(controller) {
      try {
        // OpenAI streaming contract: first chunk announces the assistant role.
        controller.enqueue(
          encoder.encode(sseChunk(makeChunk(id, requestedModel, { role: "assistant" }, null))),
        );

        const result = await model.generateContentStream({ contents: turns });
        for await (const chunk of result.stream) {
          const text = chunk.text();
          if (!text) continue;
          appendAssistantToken(channel, text);
          controller.enqueue(
            encoder.encode(sseChunk(makeChunk(id, requestedModel, { content: text }, null))),
          );
        }
        controller.enqueue(
          encoder.encode(sseChunk(makeChunk(id, requestedModel, {}, "stop"))),
        );
        controller.enqueue(encoder.encode("data: [DONE]\n\n"));
      } catch (error) {
        const message = error instanceof Error ? error.message : "unknown_error";
        console.error(`[llm-proxy] stream error on channel=${channel}:`, message);
        // Return a proper OpenAI error response instead of speaking the error.
        // Agora ConvoAI will use the failure_message configured on the agent.
        controller.enqueue(
          encoder.encode(sseChunk(makeChunk(id, requestedModel, { content: "" }, "error"))),
        );
        controller.enqueue(encoder.encode("data: [DONE]\n\n"));
      } finally {
        controller.close();
      }
    },
  });

  return new Response(sseStream, {
    status: 200,
    headers: {
      "content-type": "text/event-stream; charset=utf-8",
      "cache-control": "no-cache, no-transform",
      connection: "keep-alive",
    },
  });
}
