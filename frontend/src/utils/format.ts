/**
 * Formats a BigInt wei amount into a readable token string.
 * e.g.  100000000000000000000n  →  "100.00"
 */
export function formatTokenAmount(wei: bigint, decimals = 18): string {
  const divisor = BigInt(10 ** decimals)
  const whole = wei / divisor
  const fraction = wei % divisor
  const fractionStr = fraction.toString().padStart(decimals, '0').slice(0, 2)
  return `${Number(whole).toLocaleString()}.${fractionStr}`
}

/**
 * Converts a human-readable number string into wei (BigInt).
 * e.g.  "100"  →  100000000000000000000n
 */
export function parseTokenAmount(amount: string, decimals = 18): bigint {
  const [whole, fraction = ''] = amount.split('.')
  const paddedFraction = fraction.padEnd(decimals, '0').slice(0, decimals)
  return BigInt(whole + paddedFraction)
}

/**
 * Converts seconds into a "Xhrs Ymins Zsecs" countdown string.
 * e.g.  40335  →  "11hrs 12mins 15secs"
 */
export function formatCountdown(totalSeconds: number): string {
  if (totalSeconds <= 0) return 'Ready!'
  const hours   = Math.floor(totalSeconds / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = totalSeconds % 60

  const parts: string[] = []
  if (hours > 0)                       parts.push(`${hours}hr${hours !== 1 ? 's' : ''}`)
  if (minutes > 0)                     parts.push(`${minutes}min${minutes !== 1 ? 's' : ''}`)
  if (seconds > 0 || parts.length === 0) parts.push(`${seconds}sec${seconds !== 1 ? 's' : ''}`)

  return parts.join(' ')
}

/**
 * Shortens a wallet address for display.
 * e.g.  "0xAbCd...1234"
 */
export function shortenAddress(address: string): string {
  if (!address) return ''
  return `${address.slice(0, 6)}...${address.slice(-4)}`
}

/**
 * Returns the minted percentage of total supply as a number.
 * e.g.  supplyPercent(1_000_000n * 10n**18n, 10_000_000n * 10n**18n)  →  10.00
 */
export function supplyPercent(totalSupply: bigint, maxSupply: bigint): number {
  if (maxSupply === 0n) return 0
  return Number((totalSupply * 10000n) / maxSupply) / 100
}