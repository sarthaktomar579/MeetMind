"use client";

import { forwardRef, useEffect, useImperativeHandle, useRef } from "react";
import { Pause, Play, Volume2 } from "lucide-react";
import { formatTimestamp } from "@/lib/utils";

export interface MediaPlayerHandle {
  seekTo: (ms: number) => void;
  getCurrentTimeMs: () => number;
}

interface MediaPlayerProps {
  src?: string | null;
  durationSeconds: number;
  currentTimeMs: number;
  isPlaying: boolean;
  onTimeUpdate: (ms: number) => void;
  onPlayStateChange: (playing: boolean) => void;
  onSeek: (ms: number) => void;
}

export const MediaPlayer = forwardRef<MediaPlayerHandle, MediaPlayerProps>(
  function MediaPlayer(
    { src, durationSeconds, currentTimeMs, isPlaying, onTimeUpdate, onPlayStateChange, onSeek },
    ref
  ) {
    const audioRef = useRef<HTMLAudioElement>(null);
    const maxMs = durationSeconds * 1000;

    useImperativeHandle(ref, () => ({
      seekTo: (ms: number) => {
        if (audioRef.current) {
          audioRef.current.currentTime = ms / 1000;
        }
        onSeek(ms);
      },
      getCurrentTimeMs: () => currentTimeMs,
    }));

    useEffect(() => {
      const audio = audioRef.current;
      if (!audio) return;
      if (isPlaying) audio.play().catch(() => onPlayStateChange(false));
      else audio.pause();
    }, [isPlaying, onPlayStateChange]);

    return (
      <div className="rounded-xl border border-border bg-card p-4">
        {src ? (
          <audio
            ref={audioRef}
            src={src}
            onTimeUpdate={() => onTimeUpdate((audioRef.current?.currentTime || 0) * 1000)}
            onEnded={() => onPlayStateChange(false)}
          />
        ) : (
          <div className="mb-3 flex h-24 items-center justify-center rounded-lg bg-brand-muted text-sm text-muted">
            No media file — using timeline simulation
          </div>
        )}

        <div className="flex items-center gap-4">
          <button
            onClick={() => onPlayStateChange(!isPlaying)}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-brand text-white hover:bg-brand/90"
          >
            {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="ml-0.5 h-4 w-4" />}
          </button>

          <div className="flex-1">
            <input
              type="range"
              min={0}
              max={maxMs}
              value={currentTimeMs}
              onChange={(e) => {
                const ms = Number(e.target.value);
                if (audioRef.current) audioRef.current.currentTime = ms / 1000;
                onSeek(ms);
              }}
              className="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-border accent-brand"
            />
            <div className="mt-1 flex justify-between text-xs text-muted">
              <span>{formatTimestamp(currentTimeMs)}</span>
              <span>{formatTimestamp(maxMs)}</span>
            </div>
          </div>

          <Volume2 className="h-4 w-4 text-muted" />
        </div>

        {!src && isPlaying && (
          <SimulatedPlayback
            currentTimeMs={currentTimeMs}
            maxMs={maxMs}
            onTimeUpdate={onTimeUpdate}
            onEnd={() => onPlayStateChange(false)}
          />
        )}
      </div>
    );
  }
);

function SimulatedPlayback({
  currentTimeMs,
  maxMs,
  onTimeUpdate,
  onEnd,
}: {
  currentTimeMs: number;
  maxMs: number;
  onTimeUpdate: (ms: number) => void;
  onEnd: () => void;
}) {
  useEffect(() => {
    const id = setInterval(() => {
      const next = currentTimeMs + 500;
      if (next >= maxMs) {
        onEnd();
        onTimeUpdate(maxMs);
      } else {
        onTimeUpdate(next);
      }
    }, 500);
    return () => clearInterval(id);
  }, [currentTimeMs, maxMs, onTimeUpdate, onEnd]);
  return null;
}
