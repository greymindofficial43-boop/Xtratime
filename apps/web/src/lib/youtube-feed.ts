// YouTube RSS feed integration — no API key required.
// Channel IDs can be pre-set via env vars for reliability; if absent the code
// resolves them automatically by fetching the channel handle page once per hour.

export type YouTubeVideo = {
  videoId: string;
  title: string;
  publishedAt: string;
  thumbnail: string;
  url: string;
  channelName: string;
  channelHandle: string;
};

const ALL_CHANNELS: { handle: string; displayName: string; envVar: string; locale: string }[] = [
  {
    handle: 'XtraTimeBangla',
    displayName: 'XtraTime Bangla',
    envVar: 'YT_CHANNEL_ID_XTRATIMEBANGLA',
    locale: 'bn',
  },
  {
    handle: 'XtraTime',
    displayName: 'XtraTime',
    envVar: 'YT_CHANNEL_ID_XTRATIME',
    locale: 'en',
  },
];

// Each site edition only shows its own channel
const siteLocale = process.env.NEXT_PUBLIC_SITE_LOCALE || 'en';
const CHANNELS = ALL_CHANNELS.filter((c) => c.locale === siteLocale);

async function resolveChannelId(handle: string, envVar: string): Promise<string | null> {
  // Prefer a hardcoded channel ID from env (most reliable)
  const fromEnv = process.env[envVar];
  if (fromEnv) return fromEnv;

  try {
    const res = await fetch(`https://www.youtube.com/@${handle}`, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (compatible; facebookexternalhit/1.1; +http://www.facebook.com/externalhit_uatext.php)',
        'Accept-Language': 'en-US,en;q=0.9',
      },
      next: { revalidate: 3600 },
    });
    if (!res.ok) return null;
    const html = await res.text();

    // RSS link in <head> is the most reliable signal
    const rssMatch = html.match(/feeds\/videos\.xml\?channel_id=(UC[\w-]+)/);
    if (rssMatch) return rssMatch[1];

    // Fallback: inline JSON
    const jsonMatch = html.match(/"channelId":"(UC[\w-]+)"/);
    if (jsonMatch) return jsonMatch[1];

    return null;
  } catch {
    return null;
  }
}

function decodeEntities(str: string): string {
  return str
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&#x27;/g, "'");
}

async function fetchChannelVideos(
  handle: string,
  displayName: string,
  envVar: string,
): Promise<YouTubeVideo[]> {
  const channelId = await resolveChannelId(handle, envVar);
  if (!channelId) return [];

  try {
    const res = await fetch(
      `https://www.youtube.com/feeds/videos.xml?channel_id=${channelId}`,
      { next: { revalidate: 3600 } },
    );
    if (!res.ok) return [];
    const xml = await res.text();

    const videos: YouTubeVideo[] = [];
    const entryRe = /<entry>([\s\S]*?)<\/entry>/g;
    let m: RegExpExecArray | null;

    while ((m = entryRe.exec(xml)) !== null) {
      const entry = m[1];
      const videoId = entry.match(/<yt:videoId>([^<]+)<\/yt:videoId>/)?.[1]?.trim();
      const rawTitle = entry.match(/<title>([^<]*)<\/title>/)?.[1]?.trim();
      const published = entry.match(/<published>([^<]+)<\/published>/)?.[1]?.trim();
      const thumbUrl = entry.match(/<media:thumbnail url="([^"]+)"/)?.[1];

      if (!videoId || !rawTitle) continue;

      videos.push({
        videoId,
        title: decodeEntities(rawTitle),
        publishedAt: published ?? new Date().toISOString(),
        thumbnail: thumbUrl ?? `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`,
        url: `https://www.youtube.com/watch?v=${videoId}`,
        channelName: displayName,
        channelHandle: handle,
      });
    }

    return videos;
  } catch {
    return [];
  }
}

export async function fetchYouTubeVideos(channelHandle?: string): Promise<YouTubeVideo[]> {
  const targets = channelHandle
    ? CHANNELS.filter((c) => c.handle === channelHandle)
    : CHANNELS;

  const results = await Promise.allSettled(
    targets.map((ch) => fetchChannelVideos(ch.handle, ch.displayName, ch.envVar)),
  );

  const all = results.flatMap((r) => (r.status === 'fulfilled' ? r.value : []));
  return all.sort(
    (a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime(),
  );
}

export const YOUTUBE_CHANNELS = CHANNELS;
