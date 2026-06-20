// SariSari Snaps — Apps Script client (BUILD-BRIEF §7 / Appendix A).
// POSTs as text/plain so the browser skips a CORS preflight; the Apps Script
// reads e.postData.contents and parses it itself. No calls fire while IS_MOCK.

import { CONFIG, IS_MOCK } from '../config/app.js'

async function post(body) {
  const res = await fetch(CONFIG.appsScriptUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain;charset=utf-8' },
    body: JSON.stringify(body),
  })
  if (!res.ok) throw new Error('Network error (' + res.status + ')')
  return res.json()
}

// dataUrl: "data:image/jpeg;base64,...." from resizeImage(). Resolves the Drive URL.
export async function savePhoto({ dataUrl, filename, orderId, name }) {
  if (IS_MOCK) return null
  const result = await post({ action: 'savePhoto', dataUrl, filename, orderId, name })
  if (!result?.ok) throw new Error(result?.error || 'Photo upload failed')
  return result.url
}

export async function submitOrder(payload) {
  if (IS_MOCK) return { ok: true, orderId: payload.orderId }
  const result = await post(payload)
  if (!result?.ok) throw new Error(result?.error || 'Order submit failed')
  return result
}
