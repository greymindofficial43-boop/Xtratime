'use client';

import { useState } from 'react';
import type { YouTubeVideo } from '@/lib/youtube-feed';
import { YOUTUBE_CHANNELS } from '@/lib/youtube-feed';

type Props = {
  videos: YouTubeVideo[];
  initialChannel?: string;
};

export function VideosGrid({ videos, initialChannel }: Props) {
  const [activeChannel, setActiveChannel] = useState<string>(initialChannel ?? 'all');
  const [playing, setPlaying] = useState<string | null>(null);

  const filtered =
    activeChannel === 'all' ? videos : videos.filter((v) => v.channelHandle === activeChannel);

  return (
    <>
      {/* Channel tabs */}
      <div className="mb-6 flex flex-wrap gap-2">
        <button
          onClick={() => setActiveChannel('all')}
          className={`rounded-full px-4 py-1.5 text-sm font-semibold transition ${
            activeChannel === 'all'
              ? 'bg-[var(--sk-accent)] text-white'
              : 'border border-[var(--sk-border)] text-[var(--sk-muted)] hover:border-[var(--sk-accent)] hover:text-[var(--sk-accent)]'
          }`}
        >
          সব ভিডিও
        </button>
        {YOUTUBE_CHANNELS.map((ch) => (
          <button
            key={ch.handle}
            onClick={() => setActiveChannel(ch.handle)}
            className={`rounded-full px-4 py-1.5 text-sm font-semibold transition ${
              activeChannel === ch.handle
                ? 'bg-[var(--sk-accent)] text-white'
                : 'border border-[var(--sk-border)] text-[var(--sk-muted)] hover:border-[var(--sk-accent)] hover:text-[var(--sk-accent)]'
            }`}
          >
            {ch.displayName}
          </button>
        ))}
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <div className="rounded-xl border border-[var(--sk-border)] bg-[var(--sk-surface)] p-10 text-center">
          <p className="text-[var(--sk-muted)]">ভিডিও পাওয়া যায়নি।</p>
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filtered.map((v) => (
            <button
              key={v.videoId}
              onClick={() => setPlaying(v.videoId)}
              className="group rounded-xl overflow-hidden border border-[var(--sk-border)] bg-[var(--sk-surface)] text-left hover:border-[var(--sk-accent)] transition focus:outline-none"
            >
              <div className="relative aspect-video bg-black">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={v.thumbnail}
                  alt={v.title}
                  className="h-full w-full object-cover"
                  loading="lazy"
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-600 shadow-lg opacity-90 group-hover:opacity-100 group-hover:scale-110 transition-all">
                    <svg viewBox="0 0 24 24" className="h-5 w-5 fill-white ml-0.5">
                      <polygon points="5,3 19,12 5,21" />
                    </svg>
                  </div>
                </div>
              </div>
              <div className="p-3">
                <p className="text-sm font-semibold line-clamp-2 leading-snug">{v.title}</p>
                <p className="mt-1.5 flex items-center gap-1 text-xs text-[var(--sk-muted)]">
                  <span className="inline-block h-1.5 w-1.5 rounded-full bg-red-500" />
                  {v.channelName}
                </p>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Embed modal */}
      {playing && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
          onClick={() => setPlaying(null)}
        >
          <div
            className="relative w-full max-w-3xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setPlaying(null)}
              className="absolute -top-9 right-0 flex h-8 w-8 items-center justify-center rounded-full bg-white/20 text-white hover:bg-white/40 transition"
              aria-label="Close"
            >
              ✕
            </button>
            <div className="overflow-hidden rounded-xl bg-black" style={{ aspectRatio: '16/9' }}>
              <iframe
                src={`https://www.youtube.com/embed/${playing}?autoplay=1&rel=0`}
                className="h-full w-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                title="YouTube video"
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
