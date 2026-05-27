# Ka Asenso

Ka Asenso is a voice AI franchise sales assistant for the Philippine market. It helps franchise buyers discover a best-fit franchise through one guided voice conversation, then turns that conversation into a structured, scored lead for franchisors.

The product combines a public landing page, an ElevenLabs-inspired voice call console, post-call lead summarization, and a franchisor dashboard that shows pipeline health, buyer intent, market signals, and risk flags.

## The problem

Franchise discovery in the Philippines is still fragmented and manual. Buyers often browse scattered Facebook posts, brand pages, reseller groups, and brochures, then submit generic inquiries without knowing whether a franchise fits their budget, location, operating style, or timeline.

For franchisors, the problem is the opposite side of the same funnel:

- Too many inquiries are unqualified.
- Sales teams spend time asking the same budget, location, and readiness questions.
- Call notes are inconsistent and hard to compare.
- Buyer intent is buried inside transcripts, chat logs, or missed calls.
- Follow-up priority is unclear because every lead looks similar in a CRM row.
- Geographic and category demand signals are not visible until much later.

This creates a slow handoff between buyer curiosity and franchisor action. A good lead can go cold before a human sales rep understands the buyer's budget, location, concerns, and next best action.

## Our solution

Ka Asenso turns a short voice call into a scored franchise lead.

A buyer speaks with **Maya**, an AI franchise sales representative. Maya qualifies the buyer, recommends one franchise from a curated catalog, handles an objection, and asks for a next step. When the call ends, the system summarizes the transcript into a structured lead record with budget, location, preferred industry, management style, risk flags, recommended brand, AI fit score, and suggested next action.

For franchisors, the dashboard converts conversations into operating signals:

- Pipeline value from buyer budgets.
- High-intent lead count.
- Stage distribution.
- OFW versus local buyer mix.
- Live recommendation rationales.
- Market signals by region and category.
- Risk flags that need human review.

Instead of giving franchisors raw audio or messy call notes, Ka Asenso gives them an immediately usable lead intelligence layer.

## Product modules

### 1. Customer landing page

The landing page explains the buyer promise: find a best-fit Philippine franchise through one short voice call.

It includes:

- Asymmetric hero section with voice-call positioning.
- Photo collage and live call visual.
- Partner logo strip for emerging Philippine franchisors.
- Three-step animated "How it works" flow: qualify, recommend, handoff.
- Dashboard preview showing how calls become scored leads.
- Calls to action for `/call` and `/dashboard`.

Key files:

- `src/app/page.tsx`
- `src/components/landing/HeroVisual.tsx`
- `src/components/landing/PartnerLogoStrip.tsx`
- `src/components/landing/HowItWorks.tsx`
- `src/components/landing/DashboardPreview.tsx`

### 2. Voice AI call console

The `/call` page is the core buyer experience. It presents a dark, focused voice interface where the buyer talks to Maya.

Call flow:

```text
User speaks
  -> Agora ASR / Deepgram speech recognition
  -> app LLM proxy
  -> Gemini response generation
  -> transcript polling
  -> browser-side Gemini TTS playback
  -> buyer hears Maya
```

Important interaction details:

- Push-to-talk is supported through the call button, keyboard hold, and touch hold.
- The microphone starts muted so Maya can greet the buyer without interruption.
- The browser intentionally disables remote RTC audio playback and uses browser-side Gemini TTS for Maya's voice, avoiding duplicate agent audio.
- The transcript panel polls recent call turns and displays buyer and Maya messages.
- Ending a call triggers post-call summarization.

Key files:

- `src/app/call/page.tsx`
- `src/components/CallConsole.tsx`
- `src/components/call/VoiceOrb.tsx`
- `src/components/call/LiveWaveform.tsx`

### 3. Maya, the AI franchise sales agent

Maya is designed as a consultative sales representative, not a generic chatbot.

Maya's behavior rules:

1. Qualify before recommending.
2. Ask one question at a time.
3. Use budget, location, management style, timeline, and customer type to guide the recommendation.
4. Recommend exactly one franchise from the catalog.
5. Never invent brands, prices, payback periods, or package contents.
6. Use warm, concise English with light Taglish.
7. Explain estimated payback as a range, not a guaranteed return.
8. Handle one objection, then move toward consultation booking.

Current franchise catalog:

| Brand | Category | Capital range | Management style | Estimated payback |
| --- | --- | --- | --- | --- |
| KargaBites Siomai Cart | Food cart | ₱30K to ₱80K | Hands-on | 6 to 10 months |
| BrewBay Coffee Kiosk | Coffee / beverage | ₱150K to ₱350K | Hands-on | 10 to 16 months |
| LabaGo Laundry Hub | Essential service | ₱500K to ₱1.2M | Semi-passive | 14 to 22 months |

Key files:

- `src/lib/sales-prompt.ts`
- `src/lib/mock-data.ts`
- `src/lib/agora-convoai.ts`

### 4. Post-call lead summarization

After the buyer ends the call, the full transcript is sent to the summarization endpoint. Gemini extracts structured lead data in JSON mode and the app computes an AI fit score.

Extracted lead fields include:

- Investor name.
- Customer type, such as OFW or local.
- Budget text and normalized budget value.
- Preferred industry.
- Target location.
- Management style.
- Timeline.
- Recommended franchise brand.
- Recommendation reason.
- Market signal.
- Risk flags.
- Objections raised.
- Conversation summary.
- Next action.
- Pipeline stage.

AI fit score factors:

| Factor | Weight |
| --- | ---: |
| Budget fits franchise capital range | 30 points |
| Industry preference matches category | 25 points |
| Location fits brand's strong provinces | 20 points |
| Management style matches operating model | 15 points |
| Brand is trending | 10 points |

Score labels:

- **High Match:** 80 and above.
- **Good Match:** 60 to 79.
- **Needs Review:** below 60.

Key files:

- `src/app/api/summary/route.ts`
- `src/lib/lead-summarizer.ts`
- `src/lib/runtime-store.ts`

### 5. Franchisor dashboard

The `/dashboard` page gives franchisors a live view of lead quality and pipeline movement.

Dashboard sections:

- Stat grid for total leads, high-intent leads, and contract value.
- Pipeline summary with active value, average AI score, high-intent count, buyer type split, and stage distribution.
- Live insights stream that surfaces recommendation rationales, market signals, and risk flags from lead transcripts.
- Geographic intent card for regional demand.
- Package performance bars for category interest.
- Recent leads table with live polling.

Key files:

- `src/app/dashboard/page.tsx`
- `src/components/dashboard/DashboardStatGrid.tsx`
- `src/components/dashboard/PipelineSummary.tsx`
- `src/components/dashboard/LiveInsightsStream.tsx`
- `src/components/dashboard/GeographicIntentCard.tsx`
- `src/components/dashboard/PackagePerformanceCard.tsx`
- `src/components/dashboard/RecentLeadsTable.tsx`

### 6. Leads management

The `/leads` page provides a fuller table view for lead review and filtering.

It includes:

- Lead stats.
- Filters for budget, industry, location, score, and status.
- AI score progress bars.
- Customer type labels.
- Stage pills.
- Scoring methodology banner.

Key files:

- `src/app/leads/page.tsx`
- `src/components/leads/LeadsStatGrid.tsx`
- `src/components/leads/LeadsFilters.tsx`
- `src/components/leads/LeadsTable.tsx`
- `src/components/leads/LeadsTableClient.tsx`
- `src/components/leads/ScoringBanner.tsx`

## Technical architecture

Ka Asenso is built with:

- Next.js 16 App Router.
- React 19.
- Agora RTC and Conversational AI for real-time voice session orchestration.
- Agora-managed ASR with Deepgram speech recognition.
- Gemini 2.5 Flash for sales dialogue and lead summarization.
- Gemini TTS for browser-side voice playback.
- Configurable agent-side TTS through ElevenLabs or OpenAI.
- Zod for structured response validation.
- In-memory runtime store for development and demo data.

High-level request path:

```text
Browser /call
  -> /api/token for RTC token
  -> /api/agent/start for Agora Conversational AI session
  -> Agora ASR captures buyer speech
  -> /api/llm/chat/completions proxies model calls to Gemini
  -> runtime store records transcript turns
  -> /api/recent-rag returns live transcript
  -> /api/tts generates browser-played Maya voice
  -> /api/summary extracts lead when call ends
  -> /api/leads feeds dashboard and leads pages
```

## API routes

| Method | Route | Purpose |
| --- | --- | --- |
| `POST` | `/api/token` | Mint Agora RTC token for the browser. |
| `POST` | `/api/agent/start` | Start Agora Conversational AI agent session. |
| `POST` | `/api/agent/stop` | Stop the active agent session. |
| `GET` | `/api/agent/status` | Query current agent status. |
| `POST` | `/api/llm/chat/completions` | OpenAI-compatible proxy used by Agora ConvoAI. |
| `POST` | `/api/tts` | Generate browser-side Gemini TTS WAV audio. |
| `GET` | `/api/recent-rag` | Return recent transcript turns for a channel. |
| `POST` | `/api/summary` | Extract and persist a structured lead from a transcript. |
| `GET` | `/api/leads` | Return all leads. |
| `GET` | `/api/leads/[id]` | Return a single lead. |

## Environment variables

Server-side required variables:

| Variable | Purpose |
| --- | --- |
| `AGORA_APP_ID` | Agora project app ID. |
| `AGORA_APP_CERTIFICATE` | Agora certificate for RTC token generation. |
| `AGORA_REST_KEY` | Agora REST API key. |
| `AGORA_REST_SECRET` | Agora REST API secret. |
| `PUBLIC_BASE_URL` | Public app URL used by Agora to reach the LLM proxy. |
| `LLM_PROXY_SECRET` | Shared secret accepted by the LLM proxy. |
| `GEMINI_API_KEY` | Google AI API key for LLM, TTS, and summarization. |
| `ELEVENLABS_API_KEY` | ElevenLabs key for configurable agent-side TTS. |
| `OPENAI_API_KEY` | OpenAI key when OpenAI TTS is selected. |

Client-side required variable:

| Variable | Purpose |
| --- | --- |
| `NEXT_PUBLIC_AGORA_APP_ID` | Agora app ID exposed to the browser for RTC join. |

Useful optional variables:

| Variable | Default / role |
| --- | --- |
| `GEMINI_MODEL` | Defaults to the Gemini Flash model used by the app. |
| `GEMINI_TTS_MODEL` | Gemini TTS model for `/api/tts`. |
| `GEMINI_TTS_VOICE` | Gemini prebuilt TTS voice. |
| `ASR_LANGUAGE` | Defaults to `en-US`. |
| `TTS_VENDOR` | `elevenlabs` or `openai`. |
| `ELEVENLABS_VOICE_ID` | ElevenLabs voice ID. |
| `ELEVENLABS_MODEL_ID` | ElevenLabs speech model. |
| `OPENAI_TTS_MODEL` | OpenAI TTS model. |
| `OPENAI_TTS_VOICE` | OpenAI TTS voice. |

For Vercel deployment, set `PUBLIC_BASE_URL` to the production deployment URL and redeploy after changing `NEXT_PUBLIC_AGORA_APP_ID`, because client-exposed variables are bundled at build time.

## Local development

Install dependencies:

```bash
bun install
```

Run the development server:

```bash
bun dev
```

Open:

```text
http://localhost:3000
```

Useful routes:

| Route | Description |
| --- | --- |
| `/` | Customer landing page. |
| `/call` | Voice AI call console. |
| `/dashboard` | Franchisor dashboard. |
| `/leads` | Lead management table. |
| `/franchise-builder` | Placeholder page. |
| `/analytics` | Placeholder page. |

## Validation

Run lint:

```bash
bun run lint
```

Run production build:

```bash
bun run build
```

## Current limitations

Ka Asenso is currently optimized for hackathon/demo usage.

Known gaps:

- Leads and transcripts are stored in an in-memory `globalThis` runtime store. Data can be lost on server restart or serverless instance rotation.
- Dashboard and leads pages are public. Authentication and role-based access are not implemented yet.
- Franchise Builder and Analytics routes are placeholders.
- Transcript updates use polling, not WebSocket push.
- Voice selection is configured through environment variables, not a dashboard UI.
- The mobile push-to-talk flow works through touch events, but the call interface still needs deeper mobile QA.

Recommended next steps:

1. Add persistent storage, such as Couchbase, Postgres, or another managed database.
2. Add authentication for franchisor-only pages.
3. Add a dashboard call-summary panel for the latest conversation insights.
4. Add franchise catalog management.
5. Replace polling with WebSocket or event-stream transcript updates.
6. Add production monitoring and error tracking.

## Sources and citations

The implementation is based on the project feature reference in `KA-ASENSO-FEATURES.md` plus the following product and framework documentation:

1. Next.js App Router documentation: https://nextjs.org/docs/app
2. Next.js environment variables documentation: https://nextjs.org/docs/app/guides/environment-variables
3. React 19 documentation: https://react.dev/
4. Agora Conversational AI Engine overview: https://docs.agora.io/en/conversational-ai/overview/product-overview
5. Agora RTC token authentication documentation: https://docs.agora.io/en/video-calling/get-started/authentication-workflow
6. Agora Web SDK NG API reference: https://api-ref.agora.io/en/video-sdk/web/4.x/index.html
7. Deepgram speech-to-text documentation: https://developers.deepgram.com/docs/stt
8. Gemini API documentation: https://ai.google.dev/gemini-api/docs
9. Gemini text generation documentation: https://ai.google.dev/gemini-api/docs/text-generation
10. Gemini speech generation documentation: https://ai.google.dev/gemini-api/docs/speech-generation
11. ElevenLabs text-to-speech documentation: https://elevenlabs.io/docs/capabilities/text-to-speech
12. OpenAI text-to-speech documentation: https://platform.openai.com/docs/guides/text-to-speech
13. Zod documentation: https://zod.dev/
14. Vercel environment variables documentation: https://vercel.com/docs/environment-variables
