/**
 * imageHelper.js — Stable, idempotent image URL resolver.
 *
 * All product images are now stored in Supabase Storage and are served as
 * absolute https:// URLs. This helper primarily passes them through as-is
 * and guards against null/undefined values.
 */

export const getImageUrl = (path, size = 'original') => {
  if (!path || path === 'null' || path === 'undefined') {
    return null;
  }

  // Already a full absolute URL (http/https/blob) — return as-is.
  // External images (Unsplash, Dell CDN, etc.) must NEVER have suffixes appended.
  if (
    path.startsWith('http://') ||
    path.startsWith('https://') ||
    path.startsWith('blob:') ||
    path.startsWith('//')
  ) {
    console.log('[imageHelper] External URL, returning as-is:', path);
    return path;
  }

  // Local upload path — normalise leading slash
  let cleanPath = path.startsWith('/') ? path.slice(1) : path;

  // Only apply size suffixes to local upload paths
  if ((size === 'thumb' || size === 'medium') && cleanPath.startsWith('uploads/')) {
    const extMatch = cleanPath.match(/\.(jpg|jpeg|png|gif|webp)$/i);
    if (extMatch) {
      const ext = extMatch[0];
      const candidate = cleanPath.replace(ext, `_${size}${ext}`);
      // We optimistically use the thumbnail path — SmartImage's onError will
      // catch it if the thumbnail doesn't exist yet and fall back gracefully.
      cleanPath = candidate;
    }
  }

  // Fallback for any remaining relative paths (legacy)
  console.log('[imageHelper] Relative path passed (unexpected):', path);
  return path;
};

// Kept for legacy imports — no-op since SmartImage handles errors internally.
export const handleImageError = (e) => {
  if (e && e.target) e.target.onerror = null;
};
