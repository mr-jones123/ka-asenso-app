"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";

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

const WAVE = Array.from({ length: 18 }, (_, i) => i);
const PUBLIC_APP_ID = process.env.NEXT_PUBLIC_AGORA_APP_ID ?? "";

function fmtTs(ts: number) {
  const date = new Date(ts);
  return `${date.getMinutes().toString().padStart(2, "0")}:${date.getSeconds().toString().padStart(2, "0")}`;
}

export default function CallConsole() {
  const [state, setState] = useState<CallState>("idle");
  const [error, setError] = useState<string | null>(null);
  const [transcript, setTranscript] = useState<TranscriptEntry[]>([]);
  const [waveLevels, setWaveLevels] = useState<number[]>(() => WAVE.map(() => 14));
  const [muted, setMuted] = useState(true); // push-to-talk: muted by default

  const clientRef = useRef<unknown | null>(null);
  const audioTrackRef = useRef<unknown | null>(null);
  const sessionRef = useRef<CallSession | null>(null);
  const pollRef = useRef<number | null>(null);
  const levelRef = useRef<number | null>(null);

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
  }, []);

  useEffect(() => {
    return () => {
      stopPolling();
      void cleanupRtc();
    };
  }, [cleanupRtc, stopPolling]);

  const beginCall = useCallback(async () => {
    if (!PUBLIC_APP_ID) {
      setError("Missing NEXT_PUBLIC_AGORA_APP_ID on the client.");
      setState("idle");
      return;
    }

    setError(null);
    setState("connecting");
    setTranscript([]);

    try {
      const channel = `ka-${Date.now()}-${Math.floor(Math.random() * 1_000_000)}`;

      // 1. Mint browser RTC token (string UID for parity with agent)
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

      // 2. Browser joins as publisher
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
          user.audioTrack?.play();
          console.log("[rtc] audio playback started for", user.uid);
        }
      });
      client.on("exception", (event) => {
        console.warn("[rtc] exception", event);
      });

      // agora-rtc-sdk-ng auto-detects: string uid → user account join
      await client.join(PUBLIC_APP_ID, tokenJson.channel, tokenJson.token, tokenJson.uid);

      const micTrack = await AgoraRTC.createMicrophoneAudioTrack({
        AEC: true,
        ANS: true,
        AGC: true,
      });
      audioTrackRef.current = micTrack;
      await client.publish([micTrack]);
      // Push-to-talk: start muted so Maya can greet without being interrupted.
      await micTrack.setMuted(true);
      setMuted(true);

      // 3. Start ConvoAI agent in the same channel
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

      // 4. Local audio level meter -> visual wave bars
      levelRef.current = window.setInterval(() => {
        const level = micTrack.getVolumeLevel(); // 0..1
        setWaveLevels((prev) =>
          prev.map((_, i) => {
            const distance = Math.abs(i - WAVE.length / 2);
            const base = 14 + level * 80;
            const jitter = Math.sin(Date.now() / 120 + i) * 6;
            return Math.max(8, base - distance * 3 + jitter);
          }),
        );
      }, 80);

      // 5. Poll transcript
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

    setState("idle");
  }, [cleanupRtc, stopPolling]);

  const cta = useMemo(() => {
    if (state === "idle") return { label: "Start Call", action: beginCall };
    if (state === "connecting") return { label: "Connecting…", action: () => {} };
    if (state === "live") return { label: "End Call", action: endCall };
    return { label: "Wrapping up…", action: () => {} };
  }, [beginCall, endCall, state]);

  // Push-to-talk handlers
  const pttDown = useCallback(() => {
    if (state !== "live") return;
    void setMicMuted(false);
  }, [setMicMuted, state]);
  const pttUp = useCallback(() => {
    if (state !== "live") return;
    void setMicMuted(true);
  }, [setMicMuted, state]);

  // Spacebar push-to-talk
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

  return (
    <section className="call-stage" aria-label="Voice console with Maya">
      <header className="call-stage-head">
        <Link href="/" className="ka-logo">
          <Image
            src="/brand-logo.png"
            alt="Ka Asenso"
            width={70}
            height={55}
            className="ka-logo-mark"
          />
          <span className="ka-logo-word">KaAsenso</span>
        </Link>
        <Link href="/dashboard" className="button button-ghost-dark">
          Franchisor dashboard
        </Link>
      </header>

      <div className="call-stage-body">
        <div className={`call-orb call-orb-${state}`} aria-hidden="true">
          <div className="call-orb-core" />
          <div className="call-orb-wave">
            {waveLevels.map((height, i) => (
              <span key={i} className="wave-bar" style={{ height: `${height}px` }} />
            ))}
          </div>
        </div>

        <p className="call-status">
          {state === "idle" && (error ? `Error: ${error}` : "Press start to talk to Maya.")}
          {state === "connecting" && "Connecting to Maya…"}
          {state === "live" && "Maya is listening."}
          {state === "ending" && "Wrapping up and saving lead…"}
        </p>

        <button
          type="button"
          className="button button-primary call-cta"
          onClick={cta.action}
          disabled={state === "connecting" || state === "ending"}
        >
          {cta.label}
        </button>

        {state === "live" ? (
          <button
            type="button"
            className={muted ? "ptt-button" : "ptt-button is-active"}
            onMouseDown={pttDown}
            onMouseUp={pttUp}
            onMouseLeave={pttUp}
            onTouchStart={(e) => { e.preventDefault(); pttDown(); }}
            onTouchEnd={(e) => { e.preventDefault(); pttUp(); }}
            aria-pressed={!muted}
          >
            <span className="ptt-dot" aria-hidden="true" />
            {muted ? "Hold to talk (or Space)" : "Listening… release to send"}
          </button>
        ) : null}

        <div className="transcript-card" aria-live="polite">
          <header className="transcript-head">
            <h2>Live Transcript</h2>
            <span className={state === "live" ? "pill tone-green" : "pill tone-slate"}>
              {state === "live" ? "Recording" : "Idle"}
            </span>
          </header>
          <ul className="transcript-feed">
            {transcript.length === 0 ? (
              <li className="transcript-empty">
                Conversation appears here once the call begins.
              </li>
            ) : null}
            {transcript.map((line, i) => (
              <li key={i} className={`transcript-line who-${line.role === "user" ? "you" : "ara"}`}>
                <span className="transcript-ts">{fmtTs(line.ts)}</span>
                <span className="transcript-who">{line.role === "user" ? "You" : "Maya"}</span>
                <span className="transcript-text">{line.content}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
