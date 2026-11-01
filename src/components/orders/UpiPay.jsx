// src/components/orders/UpiPay.jsx — pay by UPI: QR code (scan with any UPI app); on phones "Save QR" (scan it from the
// gallery in PhonePe/GPay), "Copy UPI ID" and, if switched on in Admin → Settings, a "Pay with UPI app" button; then the customer types the 12-digit UTR (transaction ID) and can add a screenshot.
import { useEffect, useState } from 'react'
import QRCode from 'qrcode'
import { formatINR } from '../../data/catalog.js'
import { upiLink, isUtr } from '../../data/orders.js'
import { uploadImage, uploadsReady } from '../../data/upload.js'
import { useSettings } from '../../data/settings.js'
import { waLink } from '../../config/site.js'
import { IconWhatsApp } from '../Icons.jsx'

export default function UpiPay({ amount, orderId, stage, onSubmit }) {
  const s = useSettings()
  const { upiId, upiName, appButton } = s.payment
  const note = stage === 'balance' ? `${orderId} balance` : orderId
  const link = upiId ? upiLink({ upiId, upiName, amount, note }) : ''
  const [qr, setQr] = useState('')
  const [utr, setUtr] = useState('')
  const [shot, setShot] = useState('')
  const [canUpload, setCanUpload] = useState(false)
  const [busy, setBusy] = useState('')
  const [err, setErr] = useState('')
  const [copied, setCopied] = useState(false)
  const isPhone = typeof navigator !== 'undefined' && /Android|iPhone|iPad/i.test(navigator.userAgent)

  useEffect(() => {
    if (link) QRCode.toDataURL(link, { margin: 1, width: 360, color: { dark: '#1E1219', light: '#FFFFFF' } }).then(setQr).catch(() => setQr(''))
  }, [link])
  useEffect(() => {
    uploadsReady().then(setCanUpload)
  }, [])

  if (!upiId)
    return (
      <div className="rounded-3xl border border-gold/30 bg-gold/[0.06] p-5 text-sm">
        <p className="text-cream">Online payment is being set up.</p>
        <p className="mt-1 text-muted">Please message us on WhatsApp with your order number {orderId} and we will share the payment details.</p>
        <a href={waLink(`Hi Inviname Arts, I placed order ${orderId}. Please share the payment details (${formatINR(amount)}).`)} target="_blank" rel="noopener noreferrer" className="btn-rose mt-4">
          <IconWhatsApp className="h-4 w-4" /> Message on WhatsApp
        </a>
      </div>
    )

  async function addShot(file) {
    setErr('')
    setBusy('shot')
    try {
      setShot(await uploadImage(file, 'payments'))
    } catch (e) {
      setErr(e.message)
    } finally {
      setBusy('')
    }
  }
  async function copyUpi() {
    try {
      await navigator.clipboard.writeText(upiId)
      setCopied(true)
    } catch {
      setCopied(false)
    }
  }

  async function submit(e) {
    e.preventDefault()
    if (!isUtr(utr)) return setErr('The UTR / transaction ID has 12 digits. You can find it in your UPI app under this payment.')
    setErr('')
    setBusy('send')
    try {
      await onSubmit({ utr: utr.trim(), screenshot: shot })
    } catch (e) {
      console.error('UTR save failed:', e)
      setErr('Could not save. Please check your internet and try again.')
    } finally {
      setBusy('')
    }
  }

  return (
    <div className="rounded-3xl border border-gold/30 bg-plum-card/70 p-5 sm:p-6">
      <p className="opt-title">{stage === 'balance' ? 'Pay the remaining balance' : 'Pay by UPI'}</p>
      <p className="mt-2 text-3xl font-medium text-cream">{formatINR(amount)}</p>
      <div className="mt-5 grid items-center gap-5 sm:grid-cols-[auto_1fr]">
        <div className="mx-auto w-48 rounded-2xl bg-white p-2.5 sm:mx-0">
          {qr ? <img src={qr} alt={`UPI QR code to pay ${formatINR(amount)} to ${upiName}`} className="aspect-square w-full" /> : <div className="skeleton aspect-square w-full rounded-xl" />}
        </div>
        <div className="space-y-2 text-sm text-muted">
          {isPhone ? (
            <>
              <p><span className="text-cream">1.</span> Tap <span className="text-cream">Save QR</span>, then open PhonePe, GPay or Paytm → <span className="text-cream">Scan</span> → choose the QR from your gallery (photo icon). Or pay to the UPI ID below.</p>
              <p><span className="text-cream">2.</span> Check the name <span className="text-cream">{upiName}</span> and the amount <span className="text-cream">{formatINR(amount)}</span>{note ? <> (note: {note})</> : null}, then pay.</p>
            </>
          ) : (
            <>
              <p><span className="text-cream">1.</span> Scan the QR with GPay, PhonePe, Paytm or any UPI app on your phone.</p>
              <p><span className="text-cream">2.</span> Check the name <span className="text-cream">{upiName}</span> and the amount <span className="text-cream">{formatINR(amount)}</span>, then pay.</p>
            </>
          )}
          <p><span className="text-cream">3.</span> Enter the 12-digit UTR / transaction ID below.</p>
          <p className="break-all text-xs">UPI ID: <span className="text-gold">{upiId}</span></p>
          {isPhone && (
            <div className="flex flex-wrap gap-2 pt-1">
              {appButton && <a href={link} className="btn-gold w-full">Pay with UPI app</a>}
              {qr && (
                <a href={qr} download={`inviname-${orderId}-pay-${amount}.png`} className="btn-ghost min-h-11 flex-1 px-4">
                  Save QR
                </a>
              )}
              <button type="button" onClick={copyUpi} className="btn-ghost min-h-11 flex-1 px-4">
                {copied ? 'Copied ✓' : 'Copy UPI ID'}
              </button>
            </div>
          )}
        </div>
      </div>
      <form onSubmit={submit} className="mt-6 space-y-3 border-t border-plum-line pt-5">
        <label className="block text-sm text-muted">
          UTR / UPI transaction ID
          <input value={utr} onChange={(e) => setUtr(e.target.value.replace(/\D/g, '').slice(0, 12))} inputMode="numeric" placeholder="12 digits, e.g. 412345678901" className="field mt-1 w-full rounded-2xl tracking-widest" />
        </label>
        {canUpload && (
          <label className="block text-sm text-muted">
            Payment screenshot (optional)
            <span className="mt-1 flex items-center gap-3">
              <input type="file" accept="image/*" onChange={(e) => e.target.files[0] && addShot(e.target.files[0])} className="block w-full text-xs file:mr-3 file:rounded-full file:border-0 file:bg-gold/15 file:px-4 file:py-2 file:text-gold" />
              {busy === 'shot' && <span className="h-5 w-5 shrink-0 animate-spin rounded-full border-2 border-gold/30 border-t-gold" />}
              {shot && <img src={shot} alt="Payment screenshot" className="h-10 w-10 shrink-0 rounded-lg object-cover" />}
            </span>
          </label>
        )}
        {err && <p role="alert" className="text-sm text-rose-light">{err}</p>}
        <button type="submit" disabled={!!busy} className="btn-rose shimmer w-full">{busy === 'send' ? 'Saving…' : 'I have paid – submit UTR'}</button>
        <p className="text-xs text-muted">We check every payment in our bank app before confirming your order.</p>
      </form>
    </div>
  )
}
