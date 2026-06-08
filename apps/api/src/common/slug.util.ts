export function slugify(text: string): string {
  const slug = text
    .toLowerCase()
    .trim()
    // Keep Unicode letters/numbers (Bangla, etc.) — \w only matched ASCII,
    // which wiped non-English titles and produced empty/broken URLs.
    .replace(/[^\p{L}\p{N}\s-]/gu, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
  // Fallback so a title made entirely of stripped chars never yields an empty slug.
  return slug || `post-${Date.now().toString(36)}`;
}
