// SariSari Snaps — runtime config. Owner-provided values come from env (Vite),
// never hardcoded. The Mailchimp API key lives ONLY in the Apps Script backend —
// it must never appear in this front-end bundle.

export const CONFIG = {
  // Apps Script Web App URL — used for savePhoto + submitOrder (Phases 2–3).
  // Empty in Phase 1 → app runs fully on mock data, no network.
  appsScriptUrl: import.meta.env.VITE_APPS_SCRIPT_URL || '',
  // Default Drive parent folder name (the script also defaults to this).
  driveParentFolder: import.meta.env.VITE_DRIVE_PARENT_FOLDER || 'SariSari Orders',
  currency: 'PHP',
  currencySymbol: '₱',
}

// True until the Apps Script URL is wired in — gates all backend calls.
export const IS_MOCK = !CONFIG.appsScriptUrl

// Peso formatter, e.g. 1288 -> "₱1,288"
export const peso = (n) =>
  `${CONFIG.currencySymbol}${Number(n || 0).toLocaleString('en-PH')}`

// Order id generated up front (brief §6) so photos + submit share one Drive subfolder.
export const makeOrderId = () => 'SS-' + Date.now()

export const BRAND = {
  name: 'SariSari Snaps',
  tagline: 'Made to keep',
  archetype: 'The Celebrant',
}
