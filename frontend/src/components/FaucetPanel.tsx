import { CooldownBadge } from "./CooldownBadge";

interface FaucetPanelProps {
  canRequest: boolean;
  secondsUntilNext: number;
  isLoading: boolean;
  onRequest: () => void;
}

export function FaucetPanel({
  canRequest,
  secondsUntilNext,
  isLoading,
  onRequest,
}: FaucetPanelProps) {
  return (
    <div className="panel">
      <p className="panel-desc">
        Claim <strong>100 OPX</strong> every 24 hours, completely free.
      </p>

      <CooldownBadge secondsUntilNext={secondsUntilNext} />

      <button
        className="btn btn--green btn--lg"
        onClick={onRequest}
        disabled={isLoading || !canRequest}
      >
        {isLoading ? "Confirming…" : "Request 100 OPX"}
      </button>
    </div>
  );
}
