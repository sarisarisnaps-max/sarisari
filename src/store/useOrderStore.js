// SariSari Snaps — order state (Zustand).
// Pricing rules (brief §2): price = SKU base price. Personalization (engraving +
// icon) is itemized but FREE (₱0). Colour has NO price impact. Quantity is a
// multiplier: total = unitPrice × quantity. No bulk/group order.
//
// Photo arrangement is an EPHEMERAL SANDBOX — reordering only shuffles the local
// array; it is NOT part of the payload. Photos save by slot regardless (Phase 2).

import { create } from 'zustand'
import {
  DEFAULT_SKU_ID,
  DEFAULT_ORIENTATION,
  skuById,
  getGrid,
} from '../config/skus.js'
import { DEFAULT_COLOR_ID } from '../config/colors.js'
import { ICON_NONE } from '../config/icons.js'
import { makeOrderId } from '../config/app.js'

const uid = () =>
  globalThis.crypto?.randomUUID?.() || 'p_' + Math.random().toString(36).slice(2)

// Personalization is free in V1 but itemized so a fee can be switched on later.
export const PERSONALIZATION_PRICE = 0

// Build a photos array of the right length, preserving existing entries.
function resizeSlots(prev, count) {
  const next = Array.from({ length: count }, (_, i) => prev[i] ?? null)
  return next
}

const initialSku = skuById(DEFAULT_SKU_ID)

export const useOrderStore = create((set, get) => ({
  // identity
  orderId: makeOrderId(),

  // wizard
  step: 1, // 1 Choose Frame · 2 Pick Color · 3 Add Personal Details · 4 Review Order

  // selections
  skuId: DEFAULT_SKU_ID,
  orientation: DEFAULT_ORIENTATION, // 'horizontal' | 'vertical'
  colorId: DEFAULT_COLOR_ID,

  // photos: array length === sku.slots, entries are null | { id, url, name, file }
  photos: Array.from({ length: initialSku.slots }, () => null),

  // personalization
  engravingText: '',
  icon: ICON_NONE,
  notes: '',

  // commerce
  quantity: 1,

  // contact (collected at Review)
  contact: { name: '', email: '', mobile: '', social: '' },

  // ---- wizard nav ----
  setStep: (step) => set({ step }),
  next: () => set((s) => ({ step: Math.min(4, s.step + 1) })),
  back: () => set((s) => ({ step: Math.max(1, s.step - 1) })),

  // ---- step 1: frame + orientation ----
  selectSku: (id) =>
    set((s) => {
      const sku = skuById(id)
      if (!sku) return {}
      return {
        skuId: id,
        orientation: DEFAULT_ORIENTATION, // reset; new SKU may not support old value
        photos: resizeSlots(s.photos, sku.slots),
      }
    }),

  setOrientation: (orientation) => set({ orientation }),

  // ---- step 2: colour ----
  selectColor: (colorId) => set({ colorId }),

  // ---- photos ----
  // Fill empty slots in order with newly uploaded photos.
  addPhotos: (files) =>
    set((s) => {
      const photos = [...s.photos]
      let fi = 0
      for (let i = 0; i < photos.length && fi < files.length; i++) {
        if (!photos[i]) {
          const f = files[fi++]
          photos[i] = {
            id: f.id || uid(),
            url: f.url ?? (f instanceof File ? URL.createObjectURL(f) : ''),
            name: f.name || 'photo',
            file: f instanceof File ? f : f.file ?? null,
            dataUrl: f.dataUrl || null, // resized base64, used for the savePhoto upload
            driveUrl: null, // filled in once savePhoto resolves (Phase 2)
          }
        }
      }
      return { photos }
    }),

  setPhotoAt: (index, photo) =>
    set((s) => {
      const photos = [...s.photos]
      photos[index] = photo
      return { photos }
    }),

  // Merge in the Drive URL once a photo's savePhoto upload resolves (matched
  // by id so a sandbox reorder in the meantime doesn't misassign it).
  setPhotoDriveUrl: (id, driveUrl) =>
    set((s) => ({
      photos: s.photos.map((p) => (p && p.id === id ? { ...p, driveUrl } : p)),
    })),

  removePhotoAt: (index) =>
    set((s) => {
      const photos = [...s.photos]
      const p = photos[index]
      if (p?.url?.startsWith?.('blob:')) URL.revokeObjectURL(p.url)
      photos[index] = null
      return { photos }
    }),

  // dnd-kit sandbox: reorder by id list (ephemeral, not transmitted).
  reorderPhotos: (orderedIds) =>
    set((s) => {
      const byId = new Map(s.photos.filter(Boolean).map((p) => [p.id, p]))
      const photos = orderedIds.map((id) => byId.get(id) ?? null)
      // keep array length aligned to slot count
      while (photos.length < s.photos.length) photos.push(null)
      return { photos: photos.slice(0, s.photos.length) }
    }),

  // tap-to-swap fallback
  swapPhotos: (i, j) =>
    set((s) => {
      const photos = [...s.photos]
      ;[photos[i], photos[j]] = [photos[j], photos[i]]
      return { photos }
    }),

  // ---- step 3: personalization ----
  setEngraving: (engravingText) => set({ engravingText }),
  setIcon: (icon) => set({ icon }),
  setNotes: (notes) => set({ notes }),

  // ---- step 4: commerce + contact ----
  setQuantity: (q) => set({ quantity: Math.max(1, Math.min(999, Math.floor(q || 1))) }),
  setContact: (field, value) =>
    set((s) => ({ contact: { ...s.contact, [field]: value } })),

  reset: () =>
    set(() => {
      const sku = skuById(DEFAULT_SKU_ID)
      return {
        orderId: makeOrderId(),
        step: 1,
        skuId: DEFAULT_SKU_ID,
        orientation: DEFAULT_ORIENTATION,
        colorId: DEFAULT_COLOR_ID,
        photos: Array.from({ length: sku.slots }, () => null),
        engravingText: '',
        icon: ICON_NONE,
        notes: '',
        quantity: 1,
        contact: { name: '', email: '', mobile: '', social: '' },
      }
    }),

  // ---- derived helpers ----
  sku: () => skuById(get().skuId),
  grid: () => getGrid(skuById(get().skuId), get().orientation),
  unitPrice: () => skuById(get().skuId)?.price ?? 0,
  totalPrice: () => (skuById(get().skuId)?.price ?? 0) * get().quantity,
  filledCount: () => get().photos.filter(Boolean).length,
  allSlotsFilled: () => {
    const { photos } = get()
    return photos.length > 0 && photos.every(Boolean)
  },

  // Order payload (brief §6). photoUrls order is NOT significant.
  buildPayload: () => {
    const s = get()
    const sku = skuById(s.skuId)
    const unitPrice = sku?.price ?? 0
    return {
      action: 'submitOrder',
      orderId: s.orderId,
      name: s.contact.name,
      email: s.contact.email,
      mobile: s.contact.mobile,
      social: s.contact.social,
      sku: s.skuId,
      orientation: s.orientation,
      color: s.colorId,
      engravingText: s.engravingText,
      icon: s.icon,
      notes: s.notes,
      quantity: s.quantity,
      unitPrice,
      totalPrice: unitPrice * s.quantity,
      // Falls back to the local blob URL only in mock mode (no real upload happened).
      photoUrls: s.photos.filter(Boolean).map((p) => p.driveUrl || p.url),
    }
  },
}))
