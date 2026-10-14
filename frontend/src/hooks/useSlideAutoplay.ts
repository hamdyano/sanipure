import { useCallback, useEffect, useRef } from "react";

interface SlideAutoplayOptions {
  /** Autoplay only runs while this is true (e.g. the slider is on screen). */
  running: boolean;
  /** Changes whenever the slide changes, restarting the countdown. */
  slideKey: number;
  /** Moves to the next slide. Must be stable (useCallback / setState). */
  advance: () => void;
  intervalMs?: number;
  firstMs?: number;
}

/**
 * Advances a slider on a timer. The first change after it starts running
 * comes quickly (firstMs), so the visitor sees it moving right away; after
 * that each slide gets the full intervalMs. Stopping (e.g. scrolling away)
 * resets it, so coming back starts quickly again.
 *
 * Returns markStarted — call it on manual navigation so a slide the visitor
 * picked gets the full interval instead of the quick first change.
 */
export const useSlideAutoplay = ({
  running,
  slideKey,
  advance,
  intervalMs = 4000,
  firstMs = 700,
}: SlideAutoplayOptions) => {
  const startedRef = useRef(false);

  useEffect(() => {
    if (!running) {
      startedRef.current = false;
      return;
    }
    const timeout = window.setTimeout(
      () => {
        startedRef.current = true;
        advance();
      },
      startedRef.current ? intervalMs : firstMs
    );
    return () => window.clearTimeout(timeout);
  }, [running, slideKey, advance, intervalMs, firstMs]);

  return useCallback(() => {
    startedRef.current = true;
  }, []);
};
