import { useEffect, useRef, useState } from 'react'
import { Button, RoundButton, IconBack } from '../components'

/*
 * Sign-up step 2: a 6-digit code sent to the golfer's email (Docs/REGISTER GOLFER.txt).
 * The code expires after 15 minutes and can be resent after 60 seconds.
 * Golfers may continue without verifying, but must verify before registering for a tournament.
 */

/** Prototype: the "sent" code is shown on screen; a real backend emails it */
const DEMO_CODE = '246810'
const RESEND_AFTER = 60

interface VerifyEmailProps {
  email: string
  onBack: () => void
  onDone: (verified: boolean) => void
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void
}

export default function VerifyEmail({ email, onBack, onDone, showToast }: VerifyEmailProps) {
  const [digits, setDigits] = useState<string[]>(Array(6).fill(''))
  const [error, setError] = useState('')
  const [wait, setWait] = useState(RESEND_AFTER)
  const [checking, setChecking] = useState(false)
  const refs = useRef<(HTMLInputElement | null)[]>([])

  useEffect(() => {
    if (wait <= 0) return
    const id = setTimeout(() => setWait(w => w - 1), 1000)
    return () => clearTimeout(id)
  }, [wait])

  const code = digits.join('')

  function type(i: number, v: string) {
    const clean = v.replace(/\D/g, '')
    if (clean.length > 1) {
      // Pasted the whole code
      const next = clean.slice(0, 6).split('')
      setDigits([...next, ...Array(6 - next.length).fill('')])
      refs.current[Math.min(next.length, 5)]?.focus()
    } else {
      setDigits(d => d.map((x, j) => (j === i ? clean : x)))
      if (clean && i < 5) refs.current[i + 1]?.focus()
    }
    setError('')
  }

  function verify() {
    if (code.length < 6) { setError('Enter all 6 digits'); return }
    setChecking(true)
    setTimeout(() => {
      setChecking(false)
      if (code !== DEMO_CODE) { setError("That code isn't right. Check the latest email we sent."); return }
      showToast('Email verified', 'success')
      onDone(true)
    }, 700)
  }

  return (
    <div className="h-full flex flex-col bg-canvas">
      <div className="flex-shrink-0 px-5 pt-2 pb-4">
        <div className="flex items-center justify-between">
          <RoundButton onClick={onBack} label="Back"><IconBack /></RoundButton>
          <span className="text-[12px] font-bold font-display text-gray-500">Step 2 of 3</span>
        </div>
        <h1 className="font-display font-extrabold text-ink text-[26px] leading-tight tracking-tight mt-6">Verify your email</h1>
        <p className="text-sm text-gray-500 mt-1">We sent a 6-digit code to <span className="font-semibold text-ink">{email}</span>. It expires in 15 minutes.</p>
      </div>

      <div className="flex-1 px-5 space-y-5">
        <div className="flex justify-between gap-2" role="group" aria-label="Verification code">
          {digits.map((d, i) => (
            <input key={i} ref={el => { refs.current[i] = el }} value={d} inputMode="numeric" autoComplete={i === 0 ? 'one-time-code' : 'off'}
              aria-label={`Digit ${i + 1}`} maxLength={6}
              onChange={e => type(i, e.target.value)}
              onKeyDown={e => { if (e.key === 'Backspace' && !d && i > 0) refs.current[i - 1]?.focus() }}
              className={`w-full h-14 rounded-2xl text-center text-[22px] font-display font-extrabold text-ink bg-white shadow-card border ${error ? 'border-red-300' : 'border-transparent'} focus:outline-none focus:border-pine-400`} />
          ))}
        </div>
        {error && <p className="text-xs text-red-500 font-medium" role="alert">{error}</p>}
        <p className="text-[12px] text-gray-400 bg-white rounded-2xl px-4 py-3">Prototype: your code is <span className="font-bold text-ink">{DEMO_CODE}</span></p>
        <button type="button" disabled={wait > 0}
          onClick={() => { setWait(RESEND_AFTER); setDigits(Array(6).fill('')); showToast(`New code sent to ${email}`, 'info') }}
          className="text-[13px] font-semibold font-display text-pine-600 disabled:text-gray-400">
          {wait > 0 ? `Resend code in ${wait}s` : 'Resend code'}
        </button>
      </div>

      <div className="flex-shrink-0 bg-white px-5 pt-3 pb-4 border-t border-black/[0.05] space-y-2">
        <Button fullWidth onClick={verify} loading={checking}>Verify</Button>
        <button type="button" onClick={() => onDone(false)} className="w-full h-11 text-[14px] font-semibold font-display text-gray-500">
          Verify later — you'll need to before registering for a tournament
        </button>
      </div>
    </div>
  )
}
