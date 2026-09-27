/**
 * Returns the URL if it is an absolute http(s) link, otherwise undefined.
 * Service data comes from submissions, so this stops values like
 * `javascript:...` being rendered as clickable links.
 */
export const safeExternalUrl = (url?: string): string | undefined => {
  if (!url) return undefined;
  try {
    const parsed = new URL(url.trim());
    return parsed.protocol === 'http:' || parsed.protocol === 'https:'
      ? parsed.href
      : undefined;
  } catch {
    return undefined;
  }
};
