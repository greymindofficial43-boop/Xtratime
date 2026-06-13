import Link from 'next/link';
import { fetchYouTubeVideos } from '@/lib/youtube-feed';
import { t } from '@/lib/strings';

export async function YouTubeStrip({ maxVideos = 8 }: { maxVideos?: number }) {
  const videos = await fetchYouTubeVideos().catch(() => []);
  if (videos.length === 0) return null;

  const show = videos.slice(0, maxVideos);

  return (
    <section className="overflow-hidden rounded-2xl border border-[var(--sk-border)] bg-[var(--sk-surface)] shadow-sm">
      <div className="flex items-center justify-between border-b border-[var(--sk-border)] px-5 py-3.5">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-600 shadow-sm">
            <svg viewBox="0 0 24 24" className="ml-0.5 h-4 w-4 fill-white">
              <polygon points="5,3 19,12 5,21" />
            </svg>
          </div>
          <h2 className="sk-section-heading text-sm font-black uppercase tracking-widest text-[var(--sk-text)]">
            {t.latestVideos}
          </h2>
        </div>
        <Link
          href="/videos"
          className="flex items-center gap-1 rounded-full border border-[var(--sk-border)] px-3 py-1 text-xs font-semibold text-[var(--sk-muted)] transition hover:border-red-500 hover:text-red-500"
        >
          {t.viewAll}
          <svg viewBox="0 0 24 24" className="h-3 w-3 fill-current">
            <polygon points="5,3 19,12 5,21" />
          </svg>
        </Link>
      </div>

      <div className="grid grid-cols-2 gap-px bg-[var(--sk-border)] sm:grid-cols-4">
        {show.map((v, i) => (
          <a
            key={v.videoId}
            href={v.url}
            target="_blank"
            rel="noopener noreferrer"
            className="group relative flex flex-col bg-[var(--sk-surface)] transition hover:bg-[var(--sk-surface-hover,var(--sk-surface))]"
          >
            <div className="relative aspect-video overflow-hidden bg-black">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={v.thumbnail}
                alt={v.title}
                className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                loading={i < 4 ? 'eager' : 'lazy'}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="flex h-10 w-10 scale-100 items-center justify-center rounded-full bg-red-600/90 shadow-lg opacity-0 transition group-hover:opacity-100 group-hover:scale-110">
                  <svg viewBox="0 0 24 24" className="ml-0.5 h-4 w-4 fill-white">
                    <polygon points="5,3 19,12 5,21" />
                  </svg>
                </div>
              </div>
              <div className="absolute bottom-1.5 right-1.5">
                <span className="rounded bg-black/70 px-1.5 py-0.5 text-[10px] font-bold text-white">
                  YouTube
                </span>
              </div>
            </div>
            <div className="flex flex-1 flex-col gap-1 p-2.5">
              <p className="line-clamp-2 text-xs font-semibold leading-snug text-[var(--sk-text)]">
                {v.title}
              </p>
              <p className="mt-auto flex items-center gap-1 text-[10px] text-[var(--sk-muted)]">
                <span className="inline-block h-1.5 w-1.5 rounded-full bg-red-500" />
                {v.channelName}
              </p>
            </div>
          </a>
        ))}
      </div>
    </section>
  );
}
