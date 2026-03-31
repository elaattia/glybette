import { useState } from 'react'
import type { PersonalInfoPayload } from '@glybette/types'
import { StepFooter } from './StepFooter'

interface Props {
  onNext: (data: PersonalInfoPayload) => void
  onSkip: () => void
}

const labelStyle: React.CSSProperties = {
  color:        'var(--ob-text-secondary)',
  fontSize:     '0.75rem',
  fontWeight:   600,
  display:      'block',
  marginBottom: '0.375rem',
  letterSpacing: '0.04em',
  textTransform: 'uppercase',
}

const inputBase: React.CSSProperties = {
  background:   'var(--ob-input-bg)',
  border:       '1.5px solid var(--ob-input-border)',
  boxShadow:    'var(--ob-input-shadow)',
  color:        'var(--ob-text-primary)',
  borderRadius: '0.75rem',
  height:       '2.875rem',
  width:        '100%',
  padding:      '0 1rem',
  fontSize:     '0.9rem',
  outline:      'none',
  transition:   'border-color 0.2s, box-shadow 0.2s',
  fontFamily:   'inherit',
}

export function StepPersonalInfo({ onNext, onSkip }: Props) {
  const [form, setForm] = useState<PersonalInfoPayload>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    country: '',
  })

  function set(field: keyof PersonalInfoPayload, value: string) {
    setForm((f) => ({ ...f, [field]: value }))
  }

  const isValid = form.firstName && form.lastName && form.email

  const fields: {
    key: keyof PersonalInfoPayload
    label: string
    placeholder: string
    type?: string
    colSpan?: boolean
  }[] = [
    { key: 'firstName', label: 'First Name',    placeholder: 'First Name' },
    { key: 'lastName',  label: 'Last Name',     placeholder: 'Last Name' },
    { key: 'email',     label: 'Email',         placeholder: 'you@example.com', type: 'email' },
    { key: 'phone',     label: 'Phone Number',  placeholder: '+216 12 345 678' },
    { key: 'country',   label: 'Country of Residence', placeholder: 'e.g. Tunisia, France...', colSpan: true },
  ]

  return (
    <div className="space-y-8">

      
      <div className="text-center space-y-2">
        <div className="gb-sec-label justify-center">Personal Info</div>
        <h1 className="text-4xl font-bold" style={{ color: 'var(--ob-text-primary)', fontFamily: "'Bricolage Grotesque', sans-serif" }}>
          Personal information
        </h1>
        <p className="text-sm" style={{ color: 'var(--ob-text-secondary)' }}>
          Tell us who you are
        </p>
      </div>

      
      <div className="grid grid-cols-2 gap-x-5 gap-y-5">
        {fields.map(({ key, label, placeholder, type, colSpan }) => (
          <div key={key} className={`space-y-1.5 ${colSpan ? 'col-span-2' : ''}`}>
            <label htmlFor={key} style={labelStyle}>{label}</label>
            <input
              id={key}
              type={type ?? 'text'}
              placeholder={placeholder}
              value={form[key]}
              onChange={(e) => set(key, e.target.value)}
              style={inputBase}
              onFocus={e => {
                e.currentTarget.style.borderColor = 'var(--ob-input-focus)'
                e.currentTarget.style.boxShadow = '0 0 0 3px rgba(22,163,74,0.15)'
              }}
              onBlur={e => {
                e.currentTarget.style.borderColor = 'var(--ob-input-border)'
                e.currentTarget.style.boxShadow = 'var(--ob-input-shadow)'
              }}
            />
          </div>
        ))}
      </div>

      <StepFooter
        onSkip={onSkip}
        onContinue={() => onNext(form)}
        canContinue={!!isValid}
      />

    </div>
  )
}