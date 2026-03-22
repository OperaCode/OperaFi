import { useCountdown } from "../hooks/useCountdown";

interface CooldownBadgeProps {
  secondsUntilNext: number;
}

export function CooldownBadge({ secondsUntilNext }: CooldownBadgeProps) {
  const { isReady, display } = useCountdown(secondsUntilNext);

  if (isReady) {
    return (
      <div className="badge badge--ready">
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <circle cx="7" cy="7" r="6" stroke="#00e5a0" strokeWidth="1.3" />
          <path
            d="M4 7l2 2 4-4"
            stroke="#00e5a0"
            strokeWidth="1.3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        Ready to claim
      </div>
    );
  }

  return (
    <div className="cooldown-box">
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <circle cx="10" cy="10" r="8" stroke="#f0b429" strokeWidth="1.4" />
        <path
          d="M10 6v4l2.5 2"
          stroke="#f0b429"
          strokeWidth="1.4"
          strokeLinecap="round"
        />
      </svg>
      <div>
        <p className="cooldown-label">Next claim in</p>

        <p className="cooldown-timer">{display}</p>
      </div>
    </div>
  );
}
