import { shortenAddress } from "../utils/format";

interface HeaderProps {
  address: string;
  onDisconnect: () => void;
}

export function Header({ address, onDisconnect }: HeaderProps) {
  return (
    <header className="dash-header">
      <div className="header-left">
        <div className="logo">
          <HexLogo />
          Opera Finance
        </div>
        <span className="net-pill">Sepolia</span>
      </div>

      <div className="header-right">
        <div className="wallet-dot" />
        <span className="wallet-addr">{shortenAddress(address)}</span>
        <button className="btn-ghost" onClick={onDisconnect}>
          Disconnect
        </button>
      </div>
    </header>
  );
}

function HexLogo() {
  return (
    <svg width="28" height="28" viewBox="0 0 32 32" fill="none">
      <polygon
        points="16,2 28,9 28,23 16,30 4,23 4,9"
        stroke="#00e5a0"
        strokeWidth="1.5"
        fill="none"
      />
      <polygon
        points="16,8 22,11.5 22,18.5 16,22 10,18.5 10,11.5"
        stroke="#00e5a0"
        strokeWidth="1"
        fill="rgba(0,229,160,.15)"
      />
      <circle cx="16" cy="16" r="3" fill="#00e5a0" />
    </svg>
  );
}
