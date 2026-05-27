# Ka Asenso — Feature Reference

> Voice AI franchise sales agent for the Philippine market.
> Built with Next.js 16, Agora Conversational AI, Gemini 2.5 Flash, and ElevenLabs TTS.

---

## 1. Voice AI Call Console (`/call`)

The core product feature. A full-screen dark-themed call interface where franchise buyers talk to **Maya**, an AI sales representative.

### How it works

```
User speaks → Agora ASR (Deepgram) → text → Gemini 2.5 Flash → response text → ElevenLabs TTS → audio → User hears Maya
```

### Sub-features

| Feature | Description |
|---|---|
| **Push-to-talk (PTT)** | Mic is muted by default. User holds the PTT button or spacebar to speak. Release sends the utterance. Prevents accidental interruptions while Maya is talking. |
| **Animated voice orb** | Central orb with 18 wave bars that react to the user's mic volume level in real time (80ms polling interval). Visual states: idle, connecting, live, ending. |
| **Live transcript panel** | Polls `/api/recent-rag` every 1.5 seconds. Displays timestamped, color-coded turns (You = blue, Maya = green). Up to 40 entries. |
| **Auto-subscribe to agent audio** | Browser automatically subscribes to Maya's RTC audio track when she joins the channel and starts publishing. |
| **Post-call lead extraction** | When the user clicks "End Call", the app stops the agent, then sends the full transcript to `/api/summary` which extracts a structured lead record via Gemini JSON mode. |
| **String UID parity** | Both browser and agent join the Agora channel with string UIDs (`enable_string_uid: true`) to avoid subscribe failures from UID type mismatch. |
| **Error states** | Displays connection errors, missing env vars, and agent start failures inline. |

### Files

- `src/components/CallConsole.tsx` — Full client component (RTC join, PTT, transcript poll, end-call flow)
- `src/app/call/page.tsx` — Page wrapper

---

## 2. Maya — AI Sales Agent

Maya is a Gemini-powered franchise sales representative with a structured personality and real product knowledge.

### Behavior

1. **Qualifies before recommending.** Asks about budget, province/city, management style, timeline, and OFW status. One question at a time.
2. **Recommends exactly one franchise** from the catalog. Explains the fit in 2–3 sentences.
3. **Handles one objection**, then closes by asking to book a consultation.
4. **Never invents** brands, prices, dates, or package contents. Uses only the curated catalog.
5. **Speaks in warm, brief English** with occasional Taglish ("po", "salamat").

### Prompt rules (10 total)

- Budget-match against `capital_php` range. Never recommend unaffordable brands.
- Mention trending categories once, naturally.
- No filler ("great question", "absolutely").
- Under 3 sentences per reply unless explaining a franchise detail.
- Uses "estimated payback range" not "guaranteed return" (not a financial advisor).

### Franchise catalog (3 brands)

| Brand | Category | Capital (PHP) | Management | Payback |
|---|---|---|---|---|
| KargaBites Siomai Cart | Food cart | 30K–80K | Hands-on | 6–10 months |
| BrewBay Coffee Kiosk | Coffee/beverage | 150K–350K | Hands-on | 10–16 months |
| LabaGo Laundry Hub | Essential service | 500K–1.2M | Semi-passive | 14–22 months |

Each brand has: strong provinces, trend/location/risk signals, sales pitch, and trending flag.

### Files

- `src/lib/sales-prompt.ts` — System prompt builder with catalog injection
- `src/lib/mock-data.ts` — Franchise catalog data (3 brands, 5 seed leads)

---

## 3. Post-Call Lead Summarization

After every call ends, the full transcript is sent to Gemini 2.5 Flash in JSON mode to extract a structured lead record.

### Extracted fields (22 total)

| Field | Example |
|---|---|
| `investor_name` | "Ricardo Torres" |
| `customer_type` | "ofw" or "local" |
| `budget_text` / `budget_value` | "₱250K–₱600K" / 500000 |
| `preferred_industry` | "Food Cart" |
| `target_location` | "Quezon City" |
| `management_style` | "hands_on", "family_managed", or "semi_passive" |
| `timeline` | "1 to 3 months" |
| `recommended_brand_id` / `name` | "brewbay_coffee" / "BrewBay Coffee Kiosk" |
| `recommendation_reason` | Why this brand fits this buyer |
| `market_signal` | Current trend context |
| `risk_flags` | ["Location quality must be verified"] |
| `objections_raised` | Buyer pushback captured |
| `conversation_summary` | Natural language recap |
| `next_action` | "book_consultation", "send_brochure", "follow_up_call", "no_interest" |
| `stage` | "qualified", "hot_lead", "in_consultation", etc. (9 stages) |

### AI Fit Scoring (0–100)

Computed after extraction by matching the lead against the recommended brand:

| Factor | Points |
|---|---|
| Budget within brand's capital range | +30 |
| Industry preference matches brand category | +25 |
| Target location in brand's strong provinces | +20 (or +10 if not) |
| Management style matches brand | +15 |
| Brand is trending | +10 |

Score labels: **High Match** (80+), **Good Match** (60–79), **Needs Review** (<60).

### Hardened JSON parsing

- Strips markdown fences if Gemini wraps output in ` ```json `
- Finds first `{` to last `}` (ignores surrounding text)
- Zod schema with `.default()` on every field (never crashes on missing data)
- Separate error types: `summary_json_parse_failed` vs `summary_schema_failed`

### Files

- `src/lib/lead-summarizer.ts` — Gemini call, schema, scoring, LeadRecord builder
- `src/app/api/summary/route.ts` — POST endpoint, calls summarizer, persists lead

---

## 4. Franchisor Dashboard (`/dashboard`)

Admin view for franchisors to monitor incoming leads and pipeline health.

### Components

| Component | Description |
|---|---|
| **Stat grid** (3 cards) | Total Leads, High-Intent (Score > 80), Total Contract Value. Navy accent card with decorative blur. |
| **Geographic intent map** | Stylized Philippines map with atmosphere gradients. Province tags (Cebu, Pampanga) with gold/green dots. |
| **Package performance bars** | Horizontal bar chart showing franchise category interest distribution (Express Food Cart 42%, Pharma-Tech 28%, etc.). |
| **Recent leads table** | Live-polling table (every 5 seconds via `/api/leads`). Shows investor name, customer type pill, AI score with progress bar, industry, stage pill, last activity, and action button. |

### Files

- `src/app/dashboard/page.tsx`
- `src/components/dashboard/DashboardStatGrid.tsx`
- `src/components/dashboard/GeographicIntentCard.tsx`
- `src/components/dashboard/PackagePerformanceCard.tsx`
- `src/components/dashboard/RecentLeadsTable.tsx`

---

## 5. Leads Management (`/leads`)

Full lead table with filtering, stats, and AI scoring context.

### Components

| Component | Description |
|---|---|
| **Lead stat grid** (4 cards) | Total Leads, Qualified Leads, Avg AI Score, Conversion Rate. Each with colored icon badge. |
| **Filters sidebar** | Sticky panel with: search input, budget dropdown, industry dropdown, location dropdown, score range dropdown, status dropdown. Apply/reset buttons. |
| **Leads table** | Full table with: avatar badge, investor name + customer label, budget (text + value), AI score + progress bar, industry + icon, stage pill, last activity, action buttons. Pagination footer. |
| **AI Scoring banner** | Green banner explaining the AI scoring methodology to franchisors. |
| **Live polling** | `LeadsTableClient` wraps the table in a client component that fetches `/api/leads` every 5 seconds. |

### Files

- `src/app/leads/page.tsx`
- `src/components/leads/LeadsStatGrid.tsx`
- `src/components/leads/LeadsFilters.tsx`
- `src/components/leads/LeadsTable.tsx`
- `src/components/leads/LeadsTableClient.tsx`
- `src/components/leads/ScoringBanner.tsx`

---

## 6. Customer Landing Page (`/`)

Public-facing page for franchise buyers.

### Sections

1. **Hero** — Eyebrow ("Voice AI franchise sales agent"), headline ("Find your best-fit Philippine franchise in one short voice call"), body copy, two CTAs: "Talk to Ara" → `/call`, "Open franchisor view" → `/dashboard`.
2. **3-step strip** — Qualify (budget, province, style, timeline, OFW), Recommend (one franchise explained), Handoff (structured scored lead to franchisor).
3. **Footer** — Copyright, nav links to `/call`, `/dashboard`, `/leads`.

### Files

- `src/app/page.tsx`

---

## 7. Shared UI Components

| Component | Description |
|---|---|
| **TopNav** | Sticky header with Ka Asenso logo, nav links (active state with gold underline), trailing actions (notification bell, user avatar chip with online dot), CTA button. Supports compact mode. |
| **StatusPill** | Colored pill badge for deal stages (blue, green, orange, slate, navy tones). |
| **KaAsensoLogo** | Logo mark (brand-logo.png) + wordmark. Compact variant available. |

### Files

- `src/components/shared/TopNav.tsx`
- `src/components/shared/StatusPill.tsx`
- `src/components/shared/KaAsensoLogo.tsx`

---

## 8. API Routes (8 endpoints)

| Method | Route | Purpose |
|---|---|---|
| POST | `/api/token` | Mints Agora RTC token for browser. String UID via `buildTokenWithUserAccount`. 1-hour TTL. |
| POST | `/api/agent/start` | Creates agent RTC token, calls Agora ConvoAI v2 join. Registers channel session in runtime store. Returns `agentId`. |
| POST | `/api/agent/stop` | Calls Agora ConvoAI leave. Clears channel session. |
| GET | `/api/agent/status` | Queries agent status from Agora REST API. Debug/monitoring endpoint. |
| POST | `/api/llm/chat/completions` | OpenAI-compatible LLM proxy. Agora ConvoAI calls this URL. Routes to Gemini 2.5 Flash. Records user utterances and assistant responses to runtime store. Supports both streaming (SSE) and non-streaming modes. Bearer auth with `LLM_PROXY_SECRET`. |
| GET | `/api/recent-rag` | Returns last 40 transcript entries for a given channel. Used by the live transcript panel. |
| POST | `/api/summary` | Sends transcript to Gemini JSON mode. Extracts structured lead. Persists via `upsertLead`. |
| GET | `/api/leads` | Returns all leads from runtime store. Used by dashboard and leads page polling. |
| GET | `/api/leads/[id]` | Returns a single lead by ID. |

---

## 9. Runtime Data Store

In-memory store using `globalThis` for persistence across hot reloads during development. No database.

### What it stores

| Key | Type | Description |
|---|---|---|
| `channels` | `Map<string, ChannelSession>` | Active call sessions (agentId, channel, remoteUid, startedAt) |
| `insights` | `Map<string, InsightsState>` | Per-channel transcript buffer (user/assistant entries with timestamps) |
| `leads` | `Map<string, LeadRecord>` | All lead records (seed data + AI-generated) |
| `recentLeadIds` | `string[]` | Ordered list for display (newest first) |

### Transcript recording logic

- `appendUserUtterance(channel, content)` — Adds a new user entry.
- `appendAssistantToken(channel, token)` — Appends to the last assistant entry if within 4 seconds, otherwise creates a new entry. Handles streaming token accumulation.

### File

- `src/lib/runtime-store.ts`

---

## 10. Design System (CSS)

### Architecture

1. **Layer 1 — Raw brand values** (`--raw-navy-*`, `--raw-leaf-*`, `--raw-gold-*`, `--raw-ink-*`)
2. **Layer 2 — Semantic tokens** via `@theme` (`--color-bg`, `--color-fg`, `--color-border`, etc.)
3. **Layer 3 — Base defaults** (typography, selection, focus-visible)
4. **Layer 4 — Utility classes** (`.page-shell`, `.scrollbar-hidden`)
5. **Component classes** (`.panel-card`, `.ka-table`, `.pill`, `.button-*`, `.stat-card`, `.call-orb`, `.ptt-button`, etc.)

### Key principles

- **Container queries** throughout (`cqi` units, `@container` breakpoints at 56rem, 64rem, 76rem)
- **`clamp()` spacing** everywhere. Zero use of `vw`/`vh`.
- **No Tailwind utility conflicts**. One value per property per breakpoint.
- **Reduced motion** respected (`prefers-reduced-motion: reduce`)

### Typography

- **Display:** Cabinet Grotesk (local font, 500/700/900 weights)
- **Body:** Outfit (Google Font, 400–900 weights)
- **Mono:** Cascadia Code / Menlo fallback

### Color palette

| Role | Color |
|---|---|
| Navy (primary) | `#001e40` → `#d5e3ff` (8 stops) |
| Leaf green (accent) | `#007024` → `#e6f7ea` (6 stops) |
| Gold (highlight) | `#c48c10` → `#fff3cc` (4 stops) |
| Ink (neutrals) | `#06101e` → `#fdfdfd` (9 stops) |

### File

- `src/app/globals.css` (1,182 lines)

---

## 11. Environment Configuration

14 environment variables. 8 required, 6 optional with defaults.

| Variable | Required | Default | Purpose |
|---|---|---|---|
| `AGORA_APP_ID` | Yes | — | Agora project app ID |
| `AGORA_APP_CERTIFICATE` | Yes | — | For RTC token generation |
| `AGORA_REST_KEY` | Yes | — | Agora REST API key (Basic auth) |
| `AGORA_REST_SECRET` | Yes | — | Agora REST API secret |
| `PUBLIC_BASE_URL` | Yes | — | Publicly reachable URL (ngrok/cloudflare tunnel) for LLM proxy callback |
| `LLM_PROXY_SECRET` | Yes | — | Bearer token for LLM proxy auth |
| `GEMINI_API_KEY` | Yes | — | Google AI API key |
| `ELEVENLABS_API_KEY` | Yes | — | ElevenLabs TTS API key |
| `AGORA_REST_BASE_URL` | No | `https://api.agora.io` | Agora API base |
| `GEMINI_MODEL` | No | `gemini-2.5-flash` | Which Gemini model to use |
| `ASR_LANGUAGE` | No | `en-US` | Agora ASR language |
| `TTS_VENDOR` | No | `elevenlabs` | TTS provider |
| `ELEVENLABS_VOICE_ID` | No | `pNInz6obpgDQGcFmaJgB` | ElevenLabs voice (default: Adam) |
| `ELEVENLABS_MODEL_ID` | No | `eleven_flash_v2_5` | ElevenLabs model |

### File

- `src/lib/env.ts`

---

## 12. Placeholder Pages

| Route | Status | Intended purpose |
|---|---|---|
| `/franchise-builder` | Stub | Build/configure franchise packages |
| `/analytics` | Stub | Deep-dive analytics on lead funnel, conversion, geography |

---

## 13. Seed Data

5 pre-populated lead records for non-empty dashboard/leads UX on first load:

| Name | Type | Score | Stage | Brand |
|---|---|---|---|---|
| Ricardo Torres | OFW (Middle East) | 94 | Hot Lead | BrewBay Coffee |
| Maria Santos | Local | 89 | In Consultation | LabaGo Laundry |
| Juan Garcia | OFW (USA) | 76 | New Lead | BrewBay Coffee |
| Angela Cruz | Local | 92 | High Intent | LabaGo Laundry |
| Jose P. Mendoza | Local | 85 | In Consultation | LabaGo Laundry |

Each has full transcript preview, risk flags, recommendation reason, and market signal.

---

## What's not built yet

| Gap | Notes |
|---|---|
| Database persistence | Leads live in `globalThis`. Server restart = data lost. |
| Authentication | Dashboard and leads pages are public. No login gate. |
| Voice picker UI | Voice is changed via `ELEVENLABS_VOICE_ID` env var only. |
| WebSocket transcript | Polling (1.5s interval), not real-time push. |
| Franchise Builder | Stub page only. |
| Analytics | Stub page only. |
| Mobile call UX | PTT works via touch, but not optimized for mobile layout. |
