// Shared YouTube URL helpers. Supports youtube.com/watch, youtu.be and Shorts.
const ID_RE =
  /(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([A-Za-z0-9_-]{11})/;

export function getYouTubeId(url?: string | null): string | null {
  if (!url) return null;
  const m = url.match(ID_RE);
  return m ? m[1] : null;
}

export function getYouTubeThumbnail(url?: string | null): string | null {
  const id = getYouTubeId(url);
  return id ? `https://img.youtube.com/vi/${id}/hqdefault.jpg` : null;
}

export function getYouTubeEmbedUrl(url?: string | null): string | null {
  const id = getYouTubeId(url);
  return id ? `https://www.youtube.com/embed/${id}` : null;
}
