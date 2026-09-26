import { useState, type FormEvent, type ReactNode } from 'react'
import type { SharedNavProps } from '../types'
import { Button, Input, TopAppBar, Avatar, fieldClass } from '../components'
import { MOCK_PROFILE } from '../data'

type SaveState = 'idle' | 'saving' | 'error'

const COUNTRIES = [
  'United States', 'United Kingdom', 'Australia', 'Canada', 'South Africa',
  'Ireland', 'Germany', 'France', 'Japan', 'New Zealand',
]

const GENDERS = ['Male', 'Female', 'Prefer not to say']

interface SelectFieldProps {
  label: string
  value: string
  onChange: (v: string) => void
  options: string[]
  error?: string
}

function SelectField({ label, value, onChange, options, error }: SelectFieldProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-[13px] font-semibold text-gray-600 font-display">{label}</label>
      <select
        value={value}
        onChange={e => onChange(e.target.value)}
        className={`${fieldClass(!!error)} appearance-none`}
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 16 16' fill='none'%3E%3Cpath d='M4 6l4 4 4-4' stroke='%236b7280' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E")`,
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'right 16px center',
          paddingRight: '44px',
        }}
      >
        {options.map(o => <option key={o} value={o}>{o}</option>)}
      </select>
      {error && <p className="text-xs text-red-500 font-medium">{error}</p>}
    </div>
  )
}

function FormCard({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="bg-white rounded-3xl shadow-card overflow-hidden">
      <div className="px-4 pt-4">
        <p className="text-[16px] text-ink font-bold font-display tracking-tight">{title}</p>
      </div>
      <div className="px-4 pt-3 pb-4 space-y-4">{children}</div>
    </div>
  )
}

export default function EditProfile({ pop, showToast }: SharedNavProps) {
  const p = MOCK_PROFILE

  const [firstName, setFirstName]   = useState(p.firstName)
  const [lastName, setLastName]     = useState(p.lastName)
  const [email, setEmail]           = useState(p.email)
  const [phone, setPhone]           = useState(p.phone)
  const [country, setCountry]       = useState(p.country)
  const [city, setCity]             = useState(p.city)
  const [dob, setDob]               = useState(p.dob)
  const [gender, setGender]         = useState(p.gender)
  const [handicap, setHandicap]     = useState(p.handicapIndex.toString())

  const [errors, setErrors]         = useState<Record<string, string>>({})
  const [saveState, setSaveState]   = useState<SaveState>('idle')

  function validate() {
    const e: Record<string, string> = {}
    if (!firstName.trim())  e.firstName = 'First name is required'
    if (!lastName.trim())   e.lastName  = 'Last name is required'
    if (!email.trim())      e.email     = 'Email is required'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) e.email = 'Enter a valid email address'
    const hi = parseFloat(handicap)
    if (isNaN(hi) || hi < -10 || hi > 54) e.handicap = 'Enter a valid handicap index (−10 to 54)'
    return e
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    const errs = validate()
    setErrors(errs)
    if (Object.keys(errs).length > 0) return

    setSaveState('saving')
    setTimeout(() => {
      setSaveState('idle')
      showToast('Profile updated successfully', 'success')
      pop()
    }, 1600)
  }

  const errorCount = Object.values(errors).filter(Boolean).length

  return (
    <div className="h-full flex flex-col bg-canvas">
      <TopAppBar title="Edit profile" onBack={pop} />

      {/* Error banner */}
      {saveState === 'error' && (
        <div className="mx-5 mt-1 flex items-center gap-2.5 bg-rose-50 rounded-2xl px-4 py-3 fade-in">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <circle cx="8" cy="8" r="7" stroke="#dc2626" strokeWidth="1.3" fill="#fef2f2"/>
            <path d="M8 5v3.5M8 10.5v.5" stroke="#dc2626" strokeWidth="1.3" strokeLinecap="round"/>
          </svg>
          <p className="text-sm text-rose-600 font-medium">Failed to save. Please try again.</p>
        </div>
      )}

      <div className="flex-1 overflow-y-auto no-scrollbar smooth-scroll">
        <form onSubmit={handleSubmit} noValidate>
          <div className="px-5 pt-2 pb-8 space-y-5">

            {/* Avatar section */}
            <div className="flex flex-col items-center gap-3 py-2">
              <Avatar initials={p.avatarInitials} size="xl" />
              <button
                type="button"
                onClick={() => showToast('Photo upload coming soon', 'info')}
                className="h-9 px-4 rounded-full bg-white shadow-card text-ink text-[13px] font-semibold font-display active:scale-95 transition-all"
              >
                Change photo
              </button>
            </div>

            <FormCard title="Personal information">
              <div className="grid grid-cols-2 gap-3">
                <Input
                  label="First name"
                  value={firstName}
                  onChange={e => { setFirstName(e.target.value); if (errors.firstName) setErrors(x => ({...x, firstName: ''})) }}
                  error={errors.firstName}
                  placeholder="Alexander"
                  autoComplete="given-name"
                />
                <Input
                  label="Last name"
                  value={lastName}
                  onChange={e => { setLastName(e.target.value); if (errors.lastName) setErrors(x => ({...x, lastName: ''})) }}
                  error={errors.lastName}
                  placeholder="Hartwell"
                  autoComplete="family-name"
                />
              </div>

              <Input
                label="Email address"
                type="email"
                value={email}
                onChange={e => { setEmail(e.target.value); if (errors.email) setErrors(x => ({...x, email: ''})) }}
                error={errors.email}
                placeholder="alex@golfclub.com"
                autoComplete="email"
                inputMode="email"
              />

              <Input
                label="Phone number"
                type="tel"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                placeholder="+1 (404) 555-0000"
                autoComplete="tel"
                inputMode="tel"
              />

              <SelectField label="Country" value={country} onChange={setCountry} options={COUNTRIES} />

              <Input
                label="City"
                value={city}
                onChange={e => setCity(e.target.value)}
                placeholder="Augusta, Georgia"
                autoComplete="address-level2"
              />

              <div className="flex flex-col gap-1.5">
                <label className="text-[13px] font-semibold text-gray-600 font-display">Date of birth</label>
                <input
                  type="date"
                  value={dob}
                  onChange={e => setDob(e.target.value)}
                  max={new Date().toISOString().split('T')[0]}
                  className={fieldClass(false)}
                />
              </div>

              <SelectField label="Gender" value={gender} onChange={setGender} options={GENDERS} />
            </FormCard>

            <FormCard title="Golfer information">
              <Input
                label="Handicap index (WHS)"
                type="number"
                value={handicap}
                onChange={e => { setHandicap(e.target.value); if (errors.handicap) setErrors(x => ({...x, handicap: ''})) }}
                error={errors.handicap}
                placeholder="6.4"
                inputMode="decimal"
                hint="World Handicap System index (−10 to 54)"
              />
            </FormCard>

            {/* Validation summary */}
            {errorCount > 0 && (
              <div className="flex items-center gap-2 bg-rose-50 rounded-2xl px-4 py-3 fade-in">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <circle cx="8" cy="8" r="7" stroke="#dc2626" strokeWidth="1.3" fill="transparent"/>
                  <path d="M8 5v3.5M8 10.5v.5" stroke="#dc2626" strokeWidth="1.3" strokeLinecap="round"/>
                </svg>
                <p className="text-sm text-rose-600 font-medium">
                  Please fix {errorCount} error{errorCount > 1 ? 's' : ''} above
                </p>
              </div>
            )}
          </div>
        </form>
      </div>

      {/* Save bar — in normal flow */}
      <div className="flex-shrink-0 bg-white px-5 pt-3 pb-3 border-t border-black/[0.05]">
        <div className="flex gap-2.5">
          <Button variant="secondary" onClick={pop} className="flex-shrink-0">
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            fullWidth
            loading={saveState === 'saving'}
            onClick={handleSubmit as unknown as () => void}
          >
            {saveState === 'saving' ? 'Saving…' : 'Save changes'}
          </Button>
        </div>
      </div>
    </div>
  )
}
