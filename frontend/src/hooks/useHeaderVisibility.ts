import { useEffect, useRef, useState } from "react";

const SCROLL_STOP_DELAY = 175;
const TOP_THRESHOLD = 50;

/**
 * True except while the user is actively scrolling past `TOP_THRESHOLD`.
 * Flips back to true once ~175ms pass with no scroll events.
 */
export const useHeaderVisibility = () => {
  const [visible, setVisible] = useState(true);
  const stopTimeoutRef = useRef<number | null>(null);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    const evaluate = () => {
      rafRef.current = null;
      console.log("[header] evaluate, scrollY=", window.scrollY);

      if (window.scrollY < TOP_THRESHOLD) {
        console.log("[header] near top -> visible=true");
        setVisible(true);
        return;
      }

      console.log("[header] scrolling -> visible=false");
      setVisible(false);

      if (stopTimeoutRef.current !== null) {
        window.clearTimeout(stopTimeoutRef.current);
      }
      stopTimeoutRef.current = window.setTimeout(() => {
        console.log("[header] stop-timeout fired -> visible=true");
        setVisible(true);
      }, SCROLL_STOP_DELAY);
    };

    const handleScroll = () => {
      if (rafRef.current === null) {
        rafRef.current = window.requestAnimationFrame(evaluate);
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", handleScroll);
      if (stopTimeoutRef.current !== null) {
        window.clearTimeout(stopTimeoutRef.current);
      }
      if (rafRef.current !== null) {
        window.cancelAnimationFrame(rafRef.current);
      }
    };
  }, []);

  return visible;
};