"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import KaAsensoLogo from "@/components/shared/KaAsensoLogo";
import VoiceOrb from "@/components/call/VoiceOrb";
import LiveWaveform from "@/components/call/LiveWaveform";

type CallState = "idle" | "connecting" | "live" | "ending";

interface TranscriptEntry {
  role: "user" | "assistant";
  content: string;
  ts: number;
}

interface CallSession {
  channel: string;
  uid: string;
  agoraToken: string;
  agentId: string;
}

const WAVE_BARS = 56;
const PUBLIC_APP_ID = process.env.NEXT_PUBLIC_AGORA_APP_ID ?? "";

function fmtTs(ts: number) {
  const date = new Date(ts);
  return `${date.getMinutes().toString().padStart(2, "0")}:${date.getSeconds().toString().padStart(2, "0")}`;
}

export default function CallConsole() {
  const [state, setState] = useState<CallState>("idle");
  const [error, setError] = useState<string | null>(null);
  const [transcript, setTranscript] = useState<TranscriptEntry[]>([]);
  const [bars, setBars] = useState<number[]>(() => Array.from({ length: WAVE_BARS }, () => 0.06));
  const [orbEnergy, setOrbEnergy] = useState(0.05);
  const [muted, setMuted] = useState(true); // push-to-talk: muted by default
  const [callStartedAt, setCallStartedAt] = useState<number | null>(null);
  const [elapsed, setElapsed] = useState<string>("00:00");

  const clientRef = useRef<unknown | null>(null);
  const audioTrackRef = useRef<unknown | null>(null);
  const sessionRef = useRef<CallSession | null>(null);
  const pollRef = useRef<number | null>(null);
  const levelRef = useRef<number | null>(null);
  const elapsedRef = useRef<number | null>(null);
  const ttsTimerRef = useRef<number | null>(null);
  const ttsAbortRef = useRef<AbortController | null>(null);
  const spokenAssistantRef = useRef<string>("");
  const browserAudioRef = useRef<HTMLAudioElement | null>(null);

  const setMicMuted = useCallback(async (next: boolean) => {
    const track = audioTrackRef.current as { setMuted?: (m: boolean) => Promise<void> | void } | null;
    if (!track || typeof track.setMuted !== "function") return;
    try {
      await track.setMuted(next);
      setMuted(next);
    } catch (err) {
      console.warn("setMuted", err);
    }
  }, []);

  const cleanupRtc = useCallback(async () => {
    const client = clientRef.current as
      | { leave?: () => Promise<void>; removeAllListeners?: () => void }
      | null;
    const track = audioTrackRef.current as
      | { stop?: () => void; close?: () => void }
      | null;
    try {
      track?.stop?.();
      track?.close?.();
    } catch (err) {
      console.warn("local track cleanup", err);
    }
    try {
      await client?.leave?.();
      client?.removeAllListeners?.();
    } catch (err) {
      console.warn("rtc leave", err);
    }
    audioTrackRef.current = null;
    clientRef.current = null;
  }, []);

  const stopPolling = useCallback(() => {
    if (pollRef.current !== null) {
      window.clearInterval(pollRef.current);
      pollRef.current = null;
    }
    if (levelRef.current !== null) {
      window.clearInterval(levelRef.current);
      levelRef.current = null;
    }
    if (elapsedRef.current !== null) {
      window.clearInterval(elapsedRef.current);
      elapsedRef.current = null;
    }
    if (ttsTimerRef.current !== null) {
      window.clearTimeout(ttsTimerRef.current);
      ttsTimerRef.current = null;
    }
    ttsAbortRef.current?.abort();
    ttsAbortRef.current = null;
  }, []);

  useEffect(() => {
    return () => {
      stopPolling();
      void cleanupRtc();
    };
  }, [cleanupRtc, stopPolling]);

  // Elapsed call timer
  useEffect(() => {
    if (state !== "live" || !callStartedAt) return;
    const tick = () => {
      const secs = Math.floor((Date.now() - callStartedAt) / 1000);
      const m = Math.floor(secs / 60).toString().padStart(2, "0");
      const s = (secs % 60).toString().padStart(2, "0");
      setElapsed(`${m}:${s}`);
    };
    tick();
    elapsedRef.current = window.setInterval(tick, 500);
    return () => {
      if (elapsedRef.current !== null) {
        window.clearInterval(elapsedRef.current);
        elapsedRef.current = null;
      }
    };
  }, [callStartedAt, state]);

  const beginCall = useCallback(async () => {
    if (!PUBLIC_APP_ID) {
      setError("Missing NEXT_PUBLIC_AGORA_APP_ID on the client.");
      setState("idle");
      return;
    }

    setError(null);
    setState("connecting");
    setTranscript([]);
    spokenAssistantRef.current = "";

    try {
      const channel = `ka-${Date.now()}-${Math.floor(Math.random() * 1_000_000)}`;

      const tokenRes = await fetch("/api/token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ channel }),
      });
      if (!tokenRes.ok) throw new Error(`token http ${tokenRes.status}`);
      const tokenJson = (await tokenRes.json()) as {
        token: string;
        uid: string;
        channel: string;
      };

      const { default: AgoraRTC } = await import("agora-rtc-sdk-ng");
      AgoraRTC.setLogLevel(2);
      const client = AgoraRTC.createClient({ mode: "rtc", codec: "vp8" });
      clientRef.current = client;

      client.on("user-joined", (user) => {
        console.log("[rtc] user-joined", { uid: user.uid });
      });
      client.on("user-left", (user, reason) => {
        console.log("[rtc] user-left", { uid: user.uid, reason });
      });
      client.on("user-published", async (user, mediaType) => {
        console.log("[rtc] user-published", { uid: user.uid, mediaType });
        await client.subscribe(user, mediaType);
        if (mediaType === "audio") {
          console.log("[rtc] remote audio subscribed (playback disabled)", user.uid);
        }
      });
      client.on("exception", (event) => {
        console.warn("[rtc] exception", event);
      });

      await client.join(PUBLIC_APP_ID, tokenJson.channel, tokenJson.token, tokenJson.uid);

      const micTrack = await AgoraRTC.createMicrophoneAudioTrack({
        AEC: true,
        ANS: true,
        AGC: true,
      });
      audioTrackRef.current = micTrack;
      await client.publish([micTrack]);
      await micTrack.setMuted(true);
      setMuted(true);

      const startRes = await fetch("/api/agent/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          channel: tokenJson.channel,
          remoteUid: String(tokenJson.uid),
        }),
      });
      if (!startRes.ok) {
        const errBody = await startRes.text();
        throw new Error(`agent start ${startRes.status}: ${errBody.slice(0, 200)}`);
      }
      const startJson = (await startRes.json()) as { agentId: string };

      sessionRef.current = {
        channel: tokenJson.channel,
        uid: tokenJson.uid,
        agoraToken: tokenJson.token,
        agentId: startJson.agentId,
      };

      // Wavy audio meter -> per-bar heights (0..1).
      levelRef.current = window.setInterval(() => {
        const level = micTrack.getVolumeLevel();
        const idle = 0.18;
        const energy = Math.max(idle, Math.min(1, level * 2.4));
        setOrbEnergy(energy);
        const now = Date.now();
        setBars((prev) =>
          prev.map((_, i) => {
            const center = WAVE_BARS / 2;
            const distance = Math.abs(i - center) / center;
            const taper = Math.cos(distance * Math.PI * 0.5);
            const fast = Math.sin(now / 90 + i * 0.55) * 0.18 * energy;
            const slow = Math.sin(now / 260 + i * 0.18) * 0.12;
            const flutter = Math.sin(now / 50 + i) * 0.06 * energy;
            const base = 0.18 + energy * 0.78;
            const value = base * taper + fast + slow + flutter;
            return Math.max(0.04, Math.min(1, value));
          }),
        );
      }, 48);

      pollRef.current = window.setInterval(async () => {
        const channelToPoll = sessionRef.current?.channel;
        if (!channelToPoll) return;
        try {
          const res = await fetch(`/api/recent-rag?channel=${encodeURIComponent(channelToPoll)}`, {
            cache: "no-store",
          });
          if (!res.ok) return;
          const json = (await res.json()) as { transcript: TranscriptEntry[] };
          setTranscript(json.transcript ?? []);
        } catch {
          // ignore intermittent polling errors
        }
      }, 1500);

      setCallStartedAt(Date.now());
      setState("live");
    } catch (err) {
      const message = err instanceof Error ? err.message : "unknown_error";
      setError(message);
      await cleanupRtc();
      stopPolling();
      setState("idle");
    }
  }, [cleanupRtc, stopPolling]);

  const endCall = useCallback(async () => {
    setState("ending");
    stopPolling();
    const session = sessionRef.current;
    sessionRef.current = null;

    const audio = browserAudioRef.current;
    if (audio) {
      audio.pause();
      browserAudioRef.current = null;
    }

    await cleanupRtc();

    if (session) {
      try {
        await fetch("/api/agent/stop", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ channel: session.channel, agentId: session.agentId }),
        });
      } catch (err) {
        console.warn("agent stop failed", err);
      }

      try {
        const summaryRes = await fetch("/api/summary", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ channel: session.channel }),
        });
        if (!summaryRes.ok) {
          const body = await summaryRes.json().catch(() => ({}));
          console.warn("summary", summaryRes.status, body);
        }
      } catch (err) {
        console.warn("summary failed", err);
      }
    }

    setCallStartedAt(null);
    setElapsed("00:00");
    setState("idle");
  }, [cleanupRtc, stopPolling]);

  const isLive = state === "live";
  const isConnecting = state === "connecting";
  const isEnding = state === "ending";
  const ctaLabel = isLive
    ? "End call"
    : isConnecting
      ? "Connecting…"
      : isEnding
        ? "Wrapping up…"
        : "Start call";
  const ctaAction = isLive ? endCall : isConnecting || isEnding ? () => {} : beginCall;

  const pttDown = useCallback(() => {
    if (state !== "live") return;
    void setMicMuted(false);
  }, [setMicMuted, state]);
  const pttUp = useCallback(() => {
    if (state !== "live") return;
    void setMicMuted(true);
  }, [setMicMuted, state]);

  const speakAssistant = useCallback(async (text: string) => {
    if (!text.trim()) return;
    ttsAbortRef.current?.abort();
    const controller = new AbortController();
    ttsAbortRef.current = controller;
    try {
      const res = await fetch("/api/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
        signal: controller.signal,
      });
      if (!res.ok) {
        const body = await res.text();
        console.warn("tts", res.status, body.slice(0, 160));
        return;
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const nextAudio = new Audio(url);
      const prevAudio = browserAudioRef.current;
      if (prevAudio) prevAudio.pause();
      browserAudioRef.current = nextAudio;
      nextAudio.onended = () => URL.revokeObjectURL(url);
      nextAudio.onerror = () => URL.revokeObjectURL(url);
      await nextAudio.play();
    } catch (err) {
      if (err instanceof DOMException && err.name === "AbortError") return;
      console.warn("speakAssistant", err);
    } finally {
      if (ttsAbortRef.current === controller) {
        ttsAbortRef.current = null;
      }
    }
  }, []);

  useEffect(() => {
    if (state !== "live") return;
    const latestAssistant = [...transcript].reverse().find((line) => line.role === "assistant");
    if (!latestAssistant) return;
    const key = `${latestAssistant.ts}:${latestAssistant.content}`;
    if (spokenAssistantRef.current === key) return;
    spokenAssistantRef.current = key;
    if (ttsTimerRef.current !== null) window.clearTimeout(ttsTimerRef.current);
    ttsTimerRef.current = window.setTimeout(() => {
      ttsTimerRef.current = null;
      void speakAssistant(latestAssistant.content);
    }, 300);
  }, [speakAssistant, state, transcript]);

  useEffect(() => {
    if (state !== "live") return;
    function onKeyDown(e: KeyboardEvent) {
      if (e.code === "Space" && !e.repeat) {
        e.preventDefault();
        void setMicMuted(false);
      }
    }
    function onKeyUp(e: KeyboardEvent) {
      if (e.code === "Space") {
        e.preventDefault();
        void setMicMuted(true);
      }
    }
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
    };
  }, [setMicMuted, state]);

  const statusLabel =
    state === "idle"
      ? error
        ? `Error · ${error}`
        : "Tap to start voice chat"
      : state === "connecting"
        ? "Connecting to Ara…"
        : state === "live"
          ? muted
            ? "Hold space to talk · Ara is listening"
            : "Listening · release to send"
          : "Wrapping up and saving lead…";

  return (
    <div className="el-call">
      {/* Decorative dot grid + radial vignette painted by .el-call::before / ::after */}
      <header className="el-call-top">
        <KaAsensoLogo invert />
        <div className="el-call-top-meta">
          <span className={`el-pill el-pill-${state}`}>
            <span className="el-pill-dot" aria-hidden="true" />
            {state === "live" ? "Live" : state === "connecting" ? "Connecting" : state === "ending" ? "Ending" : "Idle"}
          </span>
          {state === "live" ? <span className="el-elapsed" aria-live="polite">{elapsed}</span> : null}
          <Link href="/dashboard" className="el-ghost-link">
            Franchisor dashboard
          </Link>
        </div>
      </header>

      <section className="el-call-stage" aria-label="Voice console with Ara">
        <VoiceOrb energy={orbEnergy} state={state} />

        <div className="el-agent-card">
          <div className="el-agent-meta">
            <div className="el-agent-name">Ara · Franchise advisor</div>
            <div className="el-agent-sub">{statusLabel}</div>
          </div>

          <button
            type="button"
            className={isLive ? "el-call-btn is-danger" : "el-call-btn"}
            onClick={ctaAction}
            disabled={isConnecting || isEnding}
            aria-label={ctaLabel}
          >
            {isLive ? <HangupIcon /> : <PhoneIcon />}
          </button>
        </div>

        {state === "live" ? (
          <button
            type="button"
            className={`el-ptt${muted ? "" : " is-active"}`}
            onMouseDown={pttDown}
            onMouseUp={pttUp}
            onMouseLeave={pttUp}
            onTouchStart={(e) => {
              e.preventDefault();
              pttDown();
            }}
            onTouchEnd={(e) => {
              e.preventDefault();
              pttUp();
            }}
            aria-pressed={!muted}
          >
            <MicIcon active={!muted} />
            <span>{muted ? "Hold to talk" : "Speaking"}</span>
            <kbd>Space</kbd>
          </button>
        ) : null}

        <div className="el-waveform-shell" aria-hidden="true">
          <LiveWaveform bars={bars} active={state === "live"} />
        </div>
      </section>

      <section className="el-transcript" aria-live="polite" aria-label="Live transcript">
        <header className="el-transcript-head">
          <h2>Transcript</h2>
          <span className={`el-pill el-pill-mini el-pill-${state === "live" ? "live" : "idle"}`}>
            <span className="el-pill-dot" aria-hidden="true" />
            {state === "live" ? "Recording" : "Idle"}
          </span>
        </header>
        {transcript.length === 0 ? (
          <p className="el-transcript-empty">
            Conversation appears here as you and Ara speak. Hold <kbd>Space</kbd> to reply.
          </p>
        ) : (
          <ul className="el-transcript-feed">
            {transcript.map((line, i) => (
              <li key={i} className={`el-line el-line-${line.role}`}>
                <span className="el-line-who">{line.role === "user" ? "You" : "Ara"}</span>
                <span className="el-line-text">{line.content}</span>
                <span className="el-line-ts">{fmtTs(line.ts)}</span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

/* ──────────────────────────  inline icons  ───────────────────────── */

function PhoneIcon() {
  return (
    <svg viewBox="0 0 24 24" width="22" height="22" fill="none" aria-hidden="true">
      <path
        d="M5.5 4.5C5.5 4 5.9 3.5 6.4 3.5h2.4c.5 0 .9.3 1 .8l.9 3.4c.1.4-.1.9-.5 1.1l-1.6.8c1 2.1 2.7 3.8 4.8 4.8l.8-1.6c.2-.4.7-.6 1.1-.5l3.4.9c.5.1.8.5.8 1v2.4c0 .5-.5.9-1 .9-7.7 0-14-6.3-14-14z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function HangupIcon() {
  return (
    <svg viewBox="0 0 24 24" width="22" height="22" fill="none" aria-hidden="true">
      <path
        d="M3.5 11.4c4.7-3.5 12.3-3.5 17 0 1 .8 1 2.3 0 3.1l-1.7 1.4c-.7.6-1.7.5-2.4-.1l-1.4-1.3a1.7 1.7 0 0 1-.5-1.2v-1.6c-1.9-.6-4-.6-5.9 0v1.6c0 .5-.2.9-.5 1.2l-1.4 1.3c-.6.6-1.7.7-2.4.1L3.5 14.5c-1-.8-1-2.3 0-3.1z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function MicIcon({ active }: { active: boolean }) {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" aria-hidden="true">
      <rect x="9" y="3" width="6" height="11" rx="3" stroke="currentColor" strokeWidth="1.6" fill={active ? "currentColor" : "none"} />
      <path d="M5 11a7 7 0 0 0 14 0M12 18v3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}
