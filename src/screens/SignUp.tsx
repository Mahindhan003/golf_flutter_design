import { useState, type FormEvent } from 'react'
import { Button, Input, PasswordInput, RoundButton, IconBack } from '../components'

export interface AccountBasics {
  fullName: string
  email: string
  phone: string
}

interface SignUpProps {
  onBack: () => void
  onContinue: (basics: AccountBasics) => void
}

type Errors = Partial<Record<'fullName' | 'email' | 'phone' | 'password' | 'confirm', string>>

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function passwordStrength(pw: string) {
  let score = 0
  if (pw.length >= 8) score++
  if (/[A-Z]/.test(pw) && /[a-z]/.test(pw)) score++
  if (/\d/.test(pw)) score++
  if (/[^A-Za-z0-9]/.test(pw)) score++
  return score // 0–4
}

const STRENGTH_LABEL = ['Too weak', 'Weak', 'Fair', 'Good', 'Strong']
const STRENGTH_BAR   = ['bg-rose-400', 'bg-rose-400', 'bg-amber-400', 'bg-lime-500', 'bg-lime-500']

export default function SignUp({ onBack, onContinue }: SignUpProps) {
  const [fullName, setFullName] = useState('')
  const [email, setEmail]       = useState('')
  const [phone, setPhone]       = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm]   = useState('')
  const [errors, setErrors]     = useState<Errors>({})
  const [loading, setLoading]   = useState(false)

  function validate(): Errors {
    const e: Errors = {}
    if (fullName.trim().split(/\s+/).filter(Boolean).length < 2) e.fullName = 'Enter your first and last name'
    if (!email.trim()) e.email = 'Email is required'
    else if (!EMAIL_RE.test(email.trim())) e.email = 'Enter a valid email address'
    if (phone.replace(/\D/g, '').length < 7) e.phone = 'Enter a valid phone number'
    if (password.length < 8) e.password = 'Use at least 8 characters'
    if (!confirm) e.confirm = 'Please confirm your password'
    else if (confirm !== password) e.confirm = "Passwords don't match"
    return e
  }

  function clear(field: keyof Errors) {
    if (errors[field]) setErrors(x => ({ ...x, [field]: undefined }))
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    const errs = validate()
    setErrors(errs)
    if (Object.values(errs).some(Boolean)) return

    setLoading(true)
    setTimeout(() => {
      setLoading(false)
      onContinue({ fullName: fullName.trim(), email: email.trim(), phone: phone.trim() })
    }, 1200)
  }

  const strength = passwordStrength(password)

  return (
    <div className="h-full overflow-y-auto no-scrollbar bg-canvas flex flex-col">
      {/* Hero card */}
      <div className="flex-shrink-0 px-4 pt-2">
        <div className="relative bg-ink rounded-[32px] px-6 pt-5 pb-7 overflow-hidden">
          <div
            className="absolute -right-16 -top-20 w-64 h-64 rounded-full pointer-events-none"
            style={{ background: 'radial-gradient(circle, rgba(200,236,90,0.30) 0%, rgba(200,236,90,0) 70%)' }}
          />
          <div className="relative">
            <RoundButton onClick={onBack} tone="glass" label="Back to sign in"><IconBack /></RoundButton>
          </div>
          <h1 className="relative font-display font-extrabold text-white text-[30px] leading-[1.05] tracking-tight mt-6">
            Join the<br />
            <span className="text-lime-400">clubhouse.</span>
          </h1>
          <p className="relative text-white/55 text-sm mt-3 font-medium">
            Create your account to enter tournaments
          </p>
        </div>
      </div>

      {/* Form */}
      <div className="flex-1 px-6 pt-7 pb-6">
        <div className="mb-6">
          <h2 className="font-display font-extrabold text-ink text-[24px] tracking-tight">Create account</h2>
          <p className="text-gray-500 text-sm mt-1">Step 1 of 2 · Your login details</p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
          <Input
            label="Full name"
            placeholder="Alexander Hartwell"
            value={fullName}
            onChange={e => { setFullName(e.target.value); clear('fullName') }}
            error={errors.fullName}
            autoComplete="name"
            onCanvas
          />
          <Input
            label="Email address"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={e => { setEmail(e.target.value); clear('email') }}
            error={errors.email}
            autoComplete="email"
            inputMode="email"
            onCanvas
          />
          <Input
            label="Phone number"
            type="tel"
            placeholder="+1 (404) 555-0000"
            value={phone}
            onChange={e => { setPhone(e.target.value); clear('phone') }}
            error={errors.phone}
            autoComplete="tel"
            inputMode="tel"
            onCanvas
          />

          <div className="flex flex-col gap-2">
            <PasswordInput
              label="Password"
              placeholder="At least 8 characters"
              value={password}
              onChange={e => { setPassword(e.target.value); clear('password') }}
              error={errors.password}
              autoComplete="new-password"
              onCanvas
            />
            {password && !errors.password && (
              <div className="flex items-center gap-3">
                <div className="flex-1 flex gap-1">
                  {[0, 1, 2, 3].map(i => (
                    <div key={i} className={`h-1.5 flex-1 rounded-full ${i < strength ? STRENGTH_BAR[strength] : 'bg-black/[0.08]'}`} />
                  ))}
                </div>
                <span className="text-[11px] font-semibold text-gray-500 w-16 text-right">{STRENGTH_LABEL[strength]}</span>
              </div>
            )}
          </div>

          <PasswordInput
            label="Confirm password"
            placeholder="Re-enter your password"
            value={confirm}
            onChange={e => { setConfirm(e.target.value); clear('confirm') }}
            error={errors.confirm}
            autoComplete="new-password"
            onCanvas
          />

          <Button type="submit" fullWidth size="lg" loading={loading} className="mt-2">
            {loading ? 'Creating account…' : 'Continue'}
          </Button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-6">
          Already have an account?{' '}
          <button
            type="button"
            onClick={onBack}
            className="text-ink font-semibold font-display underline underline-offset-4 decoration-lime-500 decoration-2 active:opacity-60"
          >
            Sign in
          </button>
        </p>
      </div>

      {/* Footer */}
      <div className="px-6 pb-6 pt-2 flex-shrink-0">
        <p className="text-center text-[10px] leading-relaxed text-gray-400 text-balance">
          By creating an account, you agree to our{' '}
          <span className="text-ink font-semibold">Terms of Service</span>
          {' '}and{' '}
          <span className="text-ink font-semibold">Privacy Policy</span>
        </p>
      </div>
    </div>
  )
}
