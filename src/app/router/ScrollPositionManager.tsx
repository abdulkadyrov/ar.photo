import { useEffect, useLayoutEffect } from "react";
import { useLocation, useNavigationType } from "react-router-dom";

const scrollPositions = new Map<string, number>();
const maxRestoreFrames = 60;

export function ScrollPositionManager() {
  const location = useLocation();
  const navigationType = useNavigationType();

  useEffect(() => {
    const previousMode = window.history.scrollRestoration;
    window.history.scrollRestoration = "manual";
    return () => {
      window.history.scrollRestoration = previousMode;
    };
  }, []);

  useLayoutEffect(() => {
    const locationKey = location.key;
    const targetY = navigationType === "POP" ? (scrollPositions.get(locationKey) ?? 0) : 0;
    let frame = 0;
    let attempts = 0;

    const restore = () => {
      window.scrollTo(0, targetY);
      attempts += 1;
      if (targetY > 0 && Math.abs(window.scrollY - targetY) > 1 && attempts < maxRestoreFrames) {
        frame = window.requestAnimationFrame(restore);
      }
    };

    frame = window.requestAnimationFrame(restore);
    return () => {
      window.cancelAnimationFrame(frame);
      scrollPositions.set(locationKey, window.scrollY);
    };
  }, [location.key, navigationType]);

  return null;
}
