import { useConnect } from 'wagmi'
import { injected } from 'wagmi/connectors'
import { useEffect, useRef } from 'react'
import { HowItWorks } from '../components/HowItWorks'
import { FAQ } from '../components/FAQ'

export function LandingPage() {
  const { connect, isPending } = useConnect()
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let animId: number

    const resize = () => {
      canvas.width = canvas.offsetWidth
      canvas.height = canvas.offsetHeight
    }

    resize()
    window.addEventListener('resize', resize)

    const stars = Array.from({ length: 120 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      r: Math.random() * 1.6 + 0.25,
      speed: Math.random() * 0.65 + 0.2,
      phase: Math.random() * Math.PI * 2,
    }))

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      const t = Date.now() / 1000

      stars.forEach((star) => {
        const alpha = star.speed * (0.35 + 0.65 * Math.abs(Math.sin(t * 0.35 + star.phase)))
        ctx.beginPath()
        ctx.arc(star.x, star.y, star.r, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(200,216,240,${alpha})`
        ctx.fill()
      })

      animId = requestAnimationFrame(draw)
    }

    draw()

    return () => {
      cancelAnimationFrame(animId)
      window.removeEventListener('resize', resize)
    }
  }, [])

  const handleConnect = () => connect({ connector: injected() })

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id)
    if (element) element.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <div className="app-shell relative overflow-hidden">
      <canvas ref={canvasRef} className="pointer-events-none absolute inset-0 h-full w-full" />
      <div className="pointer-events-none absolute inset-0 bg-[length:56px_56px] bg-[linear-gradient(rgba(0,229,160,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(0,229,160,0.03)_1px,transparent_1px)]" />
      <div className="pointer-events-none absolute -right-24 -top-20 h-[340px] w-[340px] rounded-full bg-[radial-gradient(circle,rgba(0,229,160,0.12)_0%,transparent_70%)]" />
      <div className="pointer-events-none absolute -left-24 bottom-10 h-[300px] w-[300px] rounded-full bg-[radial-gradient(circle,rgba(59,138,255,0.12)_0%,transparent_70%)]" />

      <header className="sticky top-0 z-50 border-b border-bord/70 bg-bg/85 backdrop-blur-md">
        <div className="app-container flex items-center justify-between py-4">
          <button className="flex items-center gap-2.5 text-base font-bold text-text" onClick={() => scrollToSection('hero')}>
            <HexLogo />
            <span className="font-mono">Opera Finance</span>
          </button>

          <nav className="hidden items-center gap-6 md:flex">
            <button className="landing-nav-btn" onClick={() => scrollToSection('features')}>Features</button>
            <button className="landing-nav-btn" onClick={() => scrollToSection('how-it-works')}>How It Works</button>
            <button className="landing-nav-btn" onClick={() => scrollToSection('token-utility')}>Token Utility</button>
            <button className="landing-nav-btn" onClick={() => scrollToSection('faq')}>FAQ</button>
          </nav>

          <button className="btn-primary" onClick={handleConnect} disabled={isPending}>
            {isPending ? 'Connecting...' : 'Connect Wallet'}
          </button>
        </div>
      </header>

      <main className="relative z-10">
        <section id="hero" className="py-16 sm:py-20">
          <div className="app-container grid items-center gap-7 lg:grid-cols-[1.15fr_0.85fr]">
            <div className="ui-panel p-8 sm:p-10 animate-fade-up">
              <div className="mb-4 flex flex-wrap items-center gap-2">
                <span className="hero-pill">Live on Sepolia</span>
                <span className="hero-pill">ERC-20 Faucet</span>
              </div>

              <h1 className="mb-4 text-[clamp(34px,5vw,58px)] font-bold leading-[1.02] text-text">
                The cleaner way to launch and test token flows.
              </h1>

              <p className="mb-8 max-w-[560px] text-base leading-[1.75] text-dim">
                Claim <strong className="text-text">100 OPX every 24 hours</strong>, run transfers, and validate owner mint logic in one production-like dApp interface.
              </p>

              <div className="flex flex-wrap items-center gap-3">
                <button className="btn-primary btn-glow px-8 py-3.5 text-base" onClick={handleConnect} disabled={isPending}>
                  {isPending ? 'Connecting...' : 'Connect Wallet'}
                </button>
                <button className="btn-muted" onClick={() => scrollToSection('how-it-works')}>
                  Explore Flow
                </button>
              </div>

              <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
                {STATS.map((item) => (
                  <div key={item.label} className="ui-panel-soft rounded-lg p-3 text-center">
                    <div className="font-mono text-xl font-bold text-accent-green">{item.value}</div>
                    <div className="mt-1 text-[11px] uppercase tracking-[0.6px] text-dim">{item.label}</div>
                  </div>
                ))}
              </div>
            </div>

            <aside className="ui-panel relative overflow-hidden p-6 sm:p-7 animate-fade-up" style={{ animationDelay: '.08s' }}>
              <div className="absolute -right-12 -top-12 h-28 w-28 rounded-full bg-accent-green/10 blur-2xl" />
              <p className="section-title mb-3">Dashboard Preview</p>

              <div className="rounded-xl border border-bord bg-surf2/60 p-4">
                <div className="mb-3 flex items-center justify-between text-xs text-dim">
                  <span>Wallet Status</span>
                  <span className="text-accent-green">Connected</span>
                </div>
                <div className="mb-4 rounded-md border border-accent-green/25 bg-accent-green/10 px-3 py-2 text-xs text-accent-green">
                  Claim window ready in 04:21:16
                </div>
                <div className="space-y-2">
                  {PREVIEW_ROWS.map((row) => (
                    <div key={row.label} className="flex items-center justify-between text-sm">
                      <span className="text-dim">{row.label}</span>
                      <span className="font-mono text-text">{row.value}</span>
                    </div>
                  ))}
                </div>
              </div>

              <ul className="mt-5 space-y-3 text-sm text-dim">
                {HERO_CHECKLIST.map((item) => (
                  <li key={item} className="flex items-start gap-2.5">
                    <span className="mt-1 h-1.5 w-1.5 rounded-full bg-accent-green" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </aside>
          </div>
        </section>

        <section id="features" className="py-10 sm:py-12">
          <div className="app-container">
            <div className="landing-section-head text-center">
              <p className="landing-kicker">Core Features</p>
              <h2 className="landing-title">Everything expected from a modern token dApp</h2>
              <p className="landing-subtitle">Simple entry points for users, explicit controls for owners, and clear on-chain behavior for both.</p>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              {FEATURES.map((feature) => (
                <article key={feature.title} className="ui-panel feature-card p-5">
                  <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg border border-accent-green/20 bg-accent-green/10 text-accent-green">
                    {feature.icon}
                  </div>
                  <h3 className="mb-2 text-base font-semibold text-text">{feature.title}</h3>
                  <p className="text-sm leading-relaxed text-dim">{feature.description}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <HowItWorks />

        <section id="token-utility" className="py-10 sm:py-12">
          <div className="app-container">
            <div className="landing-section-head text-center">
              <p className="landing-kicker">Token Utility</p>
              <h2 className="landing-title">Built for practical testnet execution</h2>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              {TOKEN_UTILITY.map((item) => (
                <article key={item.title} className="ui-panel feature-card p-6">
                  <p className="section-title mb-2">{item.tag}</p>
                  <h3 className="mb-2 text-xl font-semibold text-text">{item.title}</h3>
                  <p className="text-sm leading-relaxed text-dim">{item.description}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <FAQ />

        <section className="py-12 sm:py-16">
          <div className="app-container">
            <div className="ui-panel cta-panel mx-auto max-w-3xl p-8 text-center sm:p-10">
              <p className="landing-kicker">Ready To Build</p>
              <h2 className="mb-3 text-3xl font-bold text-text">Connect and start testing OPX in minutes</h2>
              <p className="mx-auto mb-6 max-w-xl text-sm leading-relaxed text-dim">
                No signup required. Connect your wallet on Sepolia and run faucet + transfer tests with a full dApp flow.
              </p>
              <button className="btn-primary btn-glow px-8 py-3.5 text-base" onClick={handleConnect} disabled={isPending}>
                {isPending ? 'Connecting...' : 'Connect Wallet'}
              </button>
            </div>
          </div>
        </section>
      </main>

      <footer className="relative z-10 border-t border-bord/80 py-10">
        <div className="app-container flex flex-col items-center justify-between gap-4 sm:flex-row">
          <div className="flex items-center gap-2.5 text-sm text-dim">
            <HexLogo />
            <span>Opera Finance</span>
          </div>
          <p className="text-xs text-dim/80">© 2026 Opera Finance • Built for Sepolia testnet</p>
        </div>
      </footer>
    </div>
  )
}

function HexLogo() {
  return (
    <svg width="30" height="30" viewBox="0 0 32 32" fill="none" aria-hidden="true">
      <polygon points="16,2 28,9 28,23 16,30 4,23 4,9" stroke="#00e5a0" strokeWidth="1.5" fill="none" />
      <polygon points="16,8 22,11.5 22,18.5 16,22 10,18.5 10,11.5" stroke="#00e5a0" strokeWidth="1" fill="rgba(0,229,160,.15)" />
      <circle cx="16" cy="16" r="3" fill="#00e5a0" />
    </svg>
  )
}

const STATS = [
  { value: '10M', label: 'Max Supply' },
  { value: '100', label: 'OPX / Claim' },
  { value: '24h', label: 'Cooldown' },
  { value: 'ERC-20', label: 'Standard' },
]

const PREVIEW_ROWS = [
  { label: 'Wallet', value: '0xA1...3fE2' },
  { label: 'Balance', value: '2,450 OPX' },
  { label: 'Daily Claim', value: '100 OPX' },
]

const HERO_CHECKLIST = [
  'One-click wallet connection for wallet providers.',
  'Daily faucet request with transparent cooldown logic.',
  'Transfer and owner mint actions in one dashboard.',
  'On-chain visibility for contract and token activity.',
]

const FEATURES = [
  {
    title: 'Daily Faucet',
    description: 'Users can claim a fixed OPX amount every 24 hours for predictable testing cycles.',
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <circle cx="8" cy="9" r="6" stroke="currentColor" strokeWidth="1.5" />
        <path d="M8 6v3l2 1.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    title: 'Token Transfers',
    description: 'Standard ERC-20 transfer flow lets users move OPX to any valid wallet address.',
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    title: 'Owner Controls',
    description: 'Owner accounts can mint tokens while honoring the hard supply cap constraints.',
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <path d="M8 2l1.5 4.5H14l-3.8 2.7 1.5 4.5L8 11 4.3 13.7l1.5-4.5L2 6.5h4.5z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round" />
      </svg>
    ),
  },
]

const TOKEN_UTILITY = [
  {
    tag: 'Token Utility',
    title: 'Built for realistic testnet workflows',
    description: 'OPX gives your team a stable asset to test claiming, balances, transfers, and contract reads before mainnet launches.',
  },
  {
    tag: 'Trust & Clarity',
    title: 'Transparent mechanics on-chain',
    description: 'Supply caps, cooldown windows, and owner permissions are enforced by contract logic and visible in the dashboard.',
  },
]
