/**
 * The site-wide hero fade: a hero's photo or video (plus its tint) sits on
 * this layer instead of filling the hero section. The layer is 18rem taller
 * than the hero and fades out over its last 26rem, so the picture runs on past
 * the bottom of the hero and dissolves behind the content below.
 *
 * Used by every page hero except Who We Are, whose video intentionally keeps
 * a hard edge.
 *
 * For it to work:
 * - the hero section is `relative` with no background, and no
 *   `overflow-hidden` (use `overflow-x-clip` if it needs side clipping);
 * - the page wrapper is `isolate` (so -z-10 stays above the page background
 *   but below the content) and `overflow-clip` (so a short page can't spill
 *   the layer into the footer);
 * - the section right after the hero has no opaque background of its own,
 *   or it would cut the fade off with a hard edge.
 */
export const HERO_FADE_LAYER =
  "pointer-events-none absolute inset-x-0 top-0 -z-10 h-[calc(100%+18rem)] overflow-hidden mask-b-from-[calc(100%-26rem)] mask-b-to-100%";

/** Classes for the page wrapper that holds a fading hero. */
export const HERO_FADE_PAGE = "isolate flow-root overflow-clip";
