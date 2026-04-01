import { useState } from 'react'
import type { AcademicBackgroundPayload } from '@glybette/types'
import { StepFooter } from './StepFooter'

const DEGREES = ['Licence', 'Master', 'Ingénieur', 'Doctorat', 'BTS', 'Other']
const YEARS   = ['2024', '2025', '2026', '2027', '2028', '2029', '2030']

interface Props {
  onNext: (data: AcademicBackgroundPayload) => void
  onSkip: () => void
}

const labelStyle: React.CSSProperties = {
  color:         'var(--ob-text-secondary)',
  fontSize:      '0.75rem',
  fontWeight:    600,
  display:       'block',
  marginBottom:  '0.375rem',
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

const selectBase: React.CSSProperties = {
  ...inputBase,
  cursor:              'pointer',
  appearance:          'none',
  backgroundImage:     `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='14' height='14' viewBox='0 0 24 24' fill='none' stroke='%237a9ab5' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`,
  backgroundRepeat:    'no-repeat',
  backgroundPosition:  'right 1rem center',
  paddingRight:        '2.75rem',
}

export function StepAcademicBackground({ onNext, onSkip }: Props) {
  const [form, setForm] = useState<AcademicBackgroundPayload>({
    university: '', degree: '', specialization: '', graduationYear: '',
  })

  function set(field: keyof AcademicBackgroundPayload, value: string) {
    setForm((f) => ({ ...f, [field]: value }))
  }

  const isValid = form.university && form.degree && form.specialization

  const focusStyle = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) => {
    e.currentTarget.style.borderColor = 'var(--ob-input-focus)'
    e.currentTarget.style.boxShadow   = '0 0 0 3px rgba(22,163,74,0.15)'
  }
  const blurStyle = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) => {
    e.currentTarget.style.borderColor = 'var(--ob-input-border)'
    e.currentTarget.style.boxShadow   = 'var(--ob-input-shadow)'
  }

  return (
    <div className="space-y-8">

      <div className="text-center space-y-2">
        <div className="gb-sec-label justify-center">Academic</div>
        <h1
          className="text-4xl font-bold"
          style={{ color: 'var(--ob-text-primary)', fontFamily: "'Bricolage Grotesque', sans-serif" }}
        >
          Academic background
        </h1>
        <p className="text-sm" style={{ color: 'var(--ob-text-secondary)' }}>
          Tell us about your studies.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-x-5 gap-y-5">

        <div className="col-span-2 space-y-1.5">
          <label htmlFor="university" style={labelStyle}>University</label>
          <input
            id="university"
            placeholder="Your university or school"
            value={form.university}
            onChange={(e) => set('university', e.target.value)}
            style={inputBase}
            onFocus={focusStyle}
            onBlur={blurStyle}
          />
        </div>

        <div className="space-y-1.5">
          <label style={labelStyle}>Degree</label>
          <select
            value={form.degree}
            onChange={(e) => set('degree', e.target.value)}
            style={selectBase}
            onFocus={focusStyle}
            onBlur={blurStyle}
          >
            <option value="" disabled style={{ background: 'var(--ob-input-bg)', color: 'var(--ob-text-secondary)' }}>
              Select your degree
            </option>
            {DEGREES.map((d) => (
              <option key={d} value={d} style={{ background: 'var(--ob-input-bg)', color: 'var(--ob-text-primary)' }}>
                {d}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-1.5">
          <label style={labelStyle}>Graduation Year</label>
          <select
            value={form.graduationYear}
            onChange={(e) => set('graduationYear', e.target.value)}
            style={selectBase}
            onFocus={focusStyle}
            onBlur={blurStyle}
          >
            <option value="" disabled style={{ background: 'var(--ob-input-bg)', color: 'var(--ob-text-secondary)' }}>
              Select year
            </option>
            {YEARS.map((y) => (
              <option key={y} value={y} style={{ background: 'var(--ob-input-bg)', color: 'var(--ob-text-primary)' }}>
                {y}
              </option>
            ))}
          </select>
        </div>

        <div className="col-span-2 space-y-1.5">
          <label htmlFor="specialization" style={labelStyle}>Specialization</label>
          <input
            id="specialization"
            placeholder="e.g. Computer Science, Marketing..."
            value={form.specialization}
            onChange={(e) => set('specialization', e.target.value)}
            style={inputBase}
            onFocus={focusStyle}
            onBlur={blurStyle}
          />
        </div>

      </div>

      <StepFooter
        onSkip={onSkip}
        onContinue={() => onNext(form)}
        canContinue={!!isValid}
      />

    </div>
  )
}