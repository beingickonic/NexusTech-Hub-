import React, { useState, useEffect, useRef, useCallback } from 'react';

/**
 * SmartImage — definitive fix for the "images disappear" bug.
 *
 * Root causes addressed:
 * A. `loading="lazy"` + `key={src}` combination: when src changes reference
 *    (even to the same string), React unmounts the old <img>, mounts a new one,
 *    and lazy-loading means it may never fire onLoad if off-screen.
 *    FIX: Remove key={src}. Manage src changes via useEffect + imperative img.src set.
 *
 * B. Module-level URL cache: re-creating the SmartImage component (e.g. navigating
 *    away and back) would lose the per-instance ref cache. Using a module-level
 *    Set means ALL instances share the cache across the session.
 *
 * C. Stale onLoad/onError: when src changes quickly (debounced search), the old
 *    img can fire onLoad for the previous URL and set status='success' for the
 *    new src before it loads.
 *    FIX: Track a generation counter. Callbacks only apply if generation matches.
 */

// Module-level cache — survives component unmounts within the same browser session
const globalLoadedUrls = new Set();

const SmartImage = React.memo(({ src, alt, className, imageClassName, iconClassName = 'w-8 h-8 text-nexus-textSecondary' }) => {
  const [status, setStatus] = useState(() => {
    if (!src) return 'empty';
    if (globalLoadedUrls.has(src)) return 'success';
    return 'loading';
  });

  const imgRef = useRef(null);
  // Generation counter to ignore stale async callbacks
  const generationRef = useRef(0);

  useEffect(() => {
    if (!src) {
      setStatus('empty');
      return;
    }

    // Already known-good — instant success, no flicker
    if (globalLoadedUrls.has(src)) {
      setStatus('success');
      // Also ensure the img element has the right src if it's mounted
      if (imgRef.current && imgRef.current.src !== src) {
        imgRef.current.src = src;
      }
      return;
    }

    // Bump generation so previous callbacks are ignored
    const gen = ++generationRef.current;
    setStatus('loading');

    // Use an off-screen Image object to preload — bypasses lazy-loading restrictions
    const preloader = new Image();

    preloader.onload = () => {
      if (generationRef.current !== gen) return; // stale
      globalLoadedUrls.add(src);
      // Apply to the actual visible img element
      if (imgRef.current) {
        imgRef.current.src = src;
      }
      setStatus('success');
    };

    preloader.onerror = () => {
      if (generationRef.current !== gen) return; // stale
      console.warn('[SmartImage] ✗ Failed:', src);
      setStatus('error');
    };

    preloader.src = src;

    // Cleanup: if component unmounts while loading, bump generation
    return () => {
      generationRef.current++;
      preloader.onload = null;
      preloader.onerror = null;
    };
  }, [src]);

  return (
    <div
      className={`relative flex items-center justify-center bg-slate-50 dark:bg-slate-800/50 overflow-hidden ${className || 'w-full h-full'}`}
    >
      {/* Skeleton pulse — only during active load */}
      {status === 'loading' && (
        <div className="absolute inset-0 z-10 animate-pulse bg-slate-200 dark:bg-slate-700/50 pointer-events-none" />
      )}

      {/* No-image / error fallback */}
      {(status === 'error' || status === 'empty') && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-100 dark:bg-slate-800/80 z-10 p-4 gap-1">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className={iconClassName}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
          >
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
            <circle cx="8.5" cy="8.5" r="1.5" />
            <polyline points="21 15 16 10 5 21" />
          </svg>
          <span className="text-[10px] text-nexus-textSecondary dark:text-nexus-textSecondary text-center leading-tight mt-1">
            {status === 'error' ? 'Image unavailable' : 'No image'}
          </span>
        </div>
      )}

      {/* Real img element — always present when src exists, never unmounted unnecessarily */}
      {src && (
        <img
          ref={imgRef}
          alt={alt || 'Product Image'}
          decoding="async"
          className={`w-full h-full transition-opacity duration-300 ${
            status === 'success' ? 'opacity-100' : 'opacity-0'
          } ${imageClassName || 'object-cover'}`}
        />
      )}
    </div>
  );
});

SmartImage.displayName = 'SmartImage';

export default SmartImage;
