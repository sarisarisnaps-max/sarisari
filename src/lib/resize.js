// SariSari Snaps — client-side photo resize (BUILD-BRIEF Phase 2).
// Caps the longest edge to ~1500px and re-encodes as JPEG ~0.8 quality before
// anything is sent to the Apps Script, keeping uploads to a few hundred KB.

const MAX_DIM = 1500
const QUALITY = 0.8

// file: a browser File/Blob (image/*). Resolves { blob, dataUrl, name }.
export function resizeImage(file, { maxDim = MAX_DIM, quality = QUALITY } = {}) {
  return new Promise((resolve, reject) => {
    const img = new Image()
    const objectUrl = URL.createObjectURL(file)

    img.onload = () => {
      const { width, height } = img
      const scale = Math.min(1, maxDim / Math.max(width, height))
      const w = Math.round(width * scale)
      const h = Math.round(height * scale)

      const canvas = document.createElement('canvas')
      canvas.width = w
      canvas.height = h
      const ctx = canvas.getContext('2d')
      ctx.drawImage(img, 0, 0, w, h)
      URL.revokeObjectURL(objectUrl)

      canvas.toBlob(
        (blob) => {
          if (!blob) return reject(new Error('Could not resize image'))
          const reader = new FileReader()
          reader.onload = () =>
            resolve({ blob, dataUrl: reader.result, name: file.name || 'photo.jpg' })
          reader.onerror = reject
          reader.readAsDataURL(blob)
        },
        'image/jpeg',
        quality,
      )
    }
    img.onerror = () => {
      URL.revokeObjectURL(objectUrl)
      reject(new Error('Could not read image'))
    }
    img.src = objectUrl
  })
}
