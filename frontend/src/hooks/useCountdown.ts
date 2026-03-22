

// This hook manages the live countdown timer. It takes the seconds remaining from the contract and ticks down every second using setInterval.


import { useState, useEffect, useRef } from "react";
import { formatCountdown } from "../utils/format";

export function useCountdown(initialSeconds: number) {
  const [remaining, setRemaining] = useState(initialSeconds);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Reset timer whenever the initial value changes(e.g. after a successful requestToken call, secondsUntilNext resets to 86400)
  useEffect(() => {
    setRemaining(initialSeconds);
  }, [initialSeconds]);

  useEffect(() => {
    if (remaining <= 0) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      return;
    }

    // Tick down every second
    intervalRef.current = setInterval(() => {
      setRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(intervalRef.current!);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    // Cleanup: clear the interval when the component unmounts
    // or when remaining resets (LESSON: effect cleanup is important!)
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [initialSeconds]); // Only restart the interval when initialSeconds changes

  return {
    remaining,
    isReady: remaining <= 0,
    display: formatCountdown(remaining),
  };
}
