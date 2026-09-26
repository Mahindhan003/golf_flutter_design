import { useState, type ReactNode } from 'react'
import type { NewAccount } from '../types'
import {
  Button, Input, SelectField, ChoiceChips, RoundButton, IconBack, fieldClass,
} from '../components'
import type { AccountBasics } from './SignUp'

interface ProfileSetupProps {
  basics: AccountBasics
  onBack: () => void
  onComplete: (account: NewAccount) => void
}

const GENDERS = ['Male', 'Female', 'Non-binary', 'Prefer not to say']

const HANDICAP_BODIES = [
  'USGA (GHIN)', 'England Golf', 'Golf Australia', 'Golf Canada',
  'Golf Ireland', 'Scottish Golf', 'Wales Golf', 'Other', 'No handicap yet',
]

const TEES = [
  { value: 'Black', swatch: '#111827' },
  { value: 'Blue',  swatch: '#2563eb' },
  { value: 'White', swatch: '#ffffff' },
  { value: 'Gold',  swatch: '#c9a227' },
  { value: 'Red',   swatch: '#dc2626' },
  { value: 'Green', swatch: '#16a34a' },
]

const DIETARY = ['None', 'Vegetarian', 'Vegan', 'Gluten-free', 'Dairy-free', 'Nut allergy', 'Halal', 'Kosher']

const SHIRT_SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL', '3XL']

const STEPS = [
  { title: 'About you',      subtitle: 'Personal details and who to contact in an emergency' },
  { title: 'Your game',      subtitle: 'Handicap and where you usually play' },
  { title: 'Event details',  subtitle: 'Helps organisers with catering and player packs' },
]

type Errors = Partial<Record<string, string>>

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

export default function ProfileSetup({ basics, onBack, onComplete }: ProfileSetupProps) {
  const [step, setStep]       = useState(0)
  const [errors, setErrors]   = useState<Errors>({})
  const [saving, setSaving]   = useState(false)

  // Step 1
  const [dob, setDob]             = useState('')
  const [gender, setGender]       = useState('')
  const [ecName, setEcName]       = useState('')
  const [ecPhone, setEcPhone]     = useState('')
  // Step 2
  const [handicap, setHandicap]   = useState('')
  const [body, setBody]           = useState('')
  const [memberNo, setMemberNo]   = useState('')
  const [homeClub, setHomeClub]   = useState('')
  const [tee, setTee]             = useState('')
  // Step 3
  const [dietary, setDietary]     = useState<string[]>([])
  const [dietNotes, setDietNotes] = useState('')
  const [shirt, setShirt]         = useState('')
  const [membership, setMembership] = useState<'' | 'Member' | 'Guest'>('')

  const noHandicap = body === 'No handicap yet'

  function validate(s: number): Errors {
    const e: Errors = {}
    if (s === 0) {
      if (!dob) e.dob = 'Date of birth is required'
      else if (new Date(dob) > new Date()) e.dob = "Date of birth can't be in the future"
      if (!gender) e.gender = 'Please choose an option'
      if (!ecName.trim()) e.ecName = 'Contact name is required'
      if (ecPhone.replace(/\D/g, '').length < 7) e.ecPhone = 'Enter a valid phone number'
    }
    if (s === 1) {
      if (!body) e.body = 'Choose your issuing body'
      if (!noHandicap) {
        const hi = parseFloat(handicap)
        if (handicap.trim() === '' || isNaN(hi) || hi < -10 || hi > 54) e.handicap = 'Enter a handicap index between −10 and 54'
      }
      if (!tee) e.tee = 'Choose your preferred tee'
    }
    if (s === 2) {
      if (dietary.length === 0) e.dietary = 'Choose at least one option (or None)'
      if (!shirt) e.shirt = 'Choose your shirt size'
      if (!membership) e.membership = 'Let us know if you are a member or guest'
    }
    return e
  }

  function clear(field: string) {
    if (errors[field]) setErrors(x => ({ ...x, [field]: undefined }))
  }

  function next() {
    const errs = validate(step)
    setErrors(errs)
    if (Object.values(errs).some(Boolean)) return

    if (step < STEPS.length - 1) {
      setStep(step + 1)
      return
    }

    setSaving(true)
    setTimeout(() => {
      onComplete({
        ...basics,
        dob,
        gender,
        emergencyContactName: ecName,
        emergencyContactPhone: ecPhone,
        handicapIndex: noHandicap ? '0' : handicap,
        handicapBody: body,
        handicapNumber: noHandicap ? '' : memberNo,
        homeClub,
        preferredTee: tee,
        dietary: dietNotes.trim() ? [...dietary.filter(d => d !== 'None'), dietNotes.trim()] : dietary,
        shirtSize: shirt,
        membership: membership as 'Member' | 'Guest',
      })
    }, 1400)
  }

  function back() {
    setErrors({})
    if (step === 0) onBack()
    else setStep(step - 1)
  }

  const firstName = basics.fullName.split(/\s+/)[0]
  const isLast = step === STEPS.length - 1

  return (
    <div className="h-full flex flex-col bg-canvas">
      {/* Header */}
      <div className="flex-shrink-0 px-5 pt-2 pb-4">
        <div className="flex items-center justify-between">
          <RoundButton onClick={back} label="Back"><IconBack /></RoundButton>
          <span className="text-[12px] font-bold font-display text-gray-500">
            Step {step + 1} of {STEPS.length}
          </span>
        </div>

        {/* Progress */}
        <div className="flex gap-1.5 mt-4">
          {STEPS.map((_, i) => (
            <div key={i} className={`h-1.5 flex-1 rounded-full transition-colors duration-300 ${i <= step ? 'bg-lime-500' : 'bg-black/[0.08]'}`} />
          ))}
        </div>

        <p className="text-[13px] text-gray-500 font-medium mt-5">
          {step === 0 ? `Welcome, ${firstName} 👋` : 'Golfer profile'}
        </p>
        <h1 className="font-display font-extrabold text-ink text-[26px] leading-tight tracking-tight">
          {STEPS[step].title}
        </h1>
        <p className="text-sm text-gray-500 mt-1">{STEPS[step].subtitle}</p>
      </div>

      {/* Step content */}
      <div className="flex-1 overflow-y-auto no-scrollbar smooth-scroll">
        <div key={step} className="px-5 pb-8 space-y-5 fade-in-up">
          {step === 0 && (
            <>
              <FormCard title="Personal details">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[13px] font-semibold text-gray-600 font-display">Date of birth</label>
                  <input
                    type="date"
                    value={dob}
                    onChange={e => { setDob(e.target.value); clear('dob') }}
                    max={new Date().toISOString().split('T')[0]}
                    className={`${fieldClass(!!errors.dob)} ${dob ? '' : 'text-gray-400'}`}
                  />
                  {errors.dob && <p className="text-xs text-red-500 font-medium">{errors.dob}</p>}
                </div>
                <ChoiceChips
                  label="Gender"
                  options={GENDERS}
                  value={gender}
                  onChange={v => { setGender(v as string); clear('gender') }}
                  error={errors.gender}
                />
              </FormCard>

              <FormCard title="Emergency contact">
                <Input
                  label="Contact name"
                  placeholder="Full name"
                  value={ecName}
                  onChange={e => { setEcName(e.target.value); clear('ecName') }}
                  error={errors.ecName}
                  autoComplete="off"
                />
                <Input
                  label="Contact phone"
                  type="tel"
                  placeholder="+1 (404) 555-0000"
                  value={ecPhone}
                  onChange={e => { setEcPhone(e.target.value); clear('ecPhone') }}
                  error={errors.ecPhone}
                  inputMode="tel"
                  autoComplete="off"
                />
              </FormCard>
            </>
          )}

          {step === 1 && (
            <>
              <FormCard title="Handicap">
                <SelectField
                  label="Handicap issuing body"
                  placeholder="Select issuing body"
                  value={body}
                  onChange={v => { setBody(v); clear('body'); clear('handicap') }}
                  options={HANDICAP_BODIES}
                  error={errors.body}
                />
                {!noHandicap && (
                  <div className="grid grid-cols-2 gap-3">
                    <Input
                      label="Handicap index"
                      type="number"
                      placeholder="e.g. 12.4"
                      value={handicap}
                      onChange={e => { setHandicap(e.target.value); clear('handicap') }}
                      error={errors.handicap}
                      inputMode="decimal"
                      step="0.1"
                    />
                    <Input
                      label="Member number"
                      placeholder="Optional"
                      value={memberNo}
                      onChange={e => setMemberNo(e.target.value)}
                      inputMode="numeric"
                    />
                  </div>
                )}
                {noHandicap && (
                  <p className="text-xs text-gray-500 bg-canvas rounded-2xl px-4 py-3 leading-relaxed">
                    No problem — you can add your handicap later from your profile. Some tournaments require an official handicap to enter.
                  </p>
                )}
              </FormCard>

              <FormCard title="Where you play">
                <Input
                  label="Home club / home course"
                  placeholder="e.g. Augusta Pines Golf Club"
                  value={homeClub}
                  onChange={e => setHomeClub(e.target.value)}
                  hint="Optional"
                />
                <ChoiceChips
                  label="Preferred tee"
                  options={TEES}
                  value={tee}
                  onChange={v => { setTee(v as string); clear('tee') }}
                  error={errors.tee}
                />
              </FormCard>
            </>
          )}

          {step === 2 && (
            <>
              <FormCard title="Catering">
                <ChoiceChips
                  label="Dietary restrictions"
                  options={DIETARY}
                  value={dietary}
                  onChange={v => { setDietary(v as string[]); clear('dietary') }}
                  error={errors.dietary}
                  hint="Select all that apply"
                />
                <Input
                  label="Anything else?"
                  placeholder="Allergies or other requirements (optional)"
                  value={dietNotes}
                  onChange={e => setDietNotes(e.target.value)}
                />
              </FormCard>

              <FormCard title="Player pack">
                <ChoiceChips
                  label="Shirt / apparel size"
                  options={SHIRT_SIZES}
                  value={shirt}
                  onChange={v => { setShirt(v as string); clear('shirt') }}
                  error={errors.shirt}
                />
              </FormCard>

              <FormCard title="Membership">
                <div className="grid grid-cols-2 gap-2.5">
                  {(['Member', 'Guest'] as const).map(m => {
                    const on = membership === m
                    return (
                      <button
                        key={m}
                        type="button"
                        onClick={() => { setMembership(m); clear('membership') }}
                        aria-pressed={on}
                        aria-label={m}
                        className={`text-left rounded-2xl p-4 transition-all active:scale-[0.98] ${
                          on ? 'bg-ink text-white' : `bg-canvas text-ink ${errors.membership ? 'ring-1 ring-red-300' : ''}`
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-display font-bold text-[15px] tracking-tight">{m}</span>
                          <span className={`w-5 h-5 rounded-full flex items-center justify-center ${on ? 'bg-lime-400' : 'border-2 border-black/15'}`}>
                            {on && <span className="w-2 h-2 rounded-full bg-ink" />}
                          </span>
                        </div>
                        <p className={`text-[12px] mt-1.5 leading-snug ${on ? 'text-white/60' : 'text-gray-500'}`}>
                          {m === 'Member' ? 'I belong to a participating club' : 'Playing as a visitor'}
                        </p>
                      </button>
                    )
                  })}
                </div>
                {errors.membership && <p className="text-xs text-red-500 font-medium">{errors.membership}</p>}
              </FormCard>
            </>
          )}
        </div>
      </div>

      {/* Action bar — in normal flow */}
      <div className="flex-shrink-0 bg-white px-5 pt-3 pb-4 border-t border-black/[0.05]">
        <div className="flex gap-2.5">
          {step > 0 && (
            <Button variant="secondary" onClick={back} className="flex-shrink-0">
              Back
            </Button>
          )}
          <Button fullWidth onClick={next} loading={saving}>
            {saving ? 'Setting up your profile…' : isLast ? 'Finish setup' : 'Continue'}
          </Button>
        </div>
      </div>
    </div>
  )
}
