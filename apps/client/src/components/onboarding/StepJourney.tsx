import { useState } from 'react'
import { GraduationCap, Award, Briefcase } from 'lucide-react'
import type { JourneyPayload, JourneyType } from '@glybette/types'
import { StepFooter } from './StepFooter'

const OPTIONS: {
  value: JourneyType
  icon: React.ReactNode
  title: string
  description: string
  iconBgVar: string
  iconColorVar: string
}[] = [
  { value: 'Student',    icon: <GraduationCap className="w-8 h-8" />, title: 'Student',    description: 'Currently enrolled in an academic program or course.', iconBgVar: 'var(--ob-icon-bg-green)', iconColorVar: 'var(--ob-icon-green)' },
  { value: 'Graduate',   icon: <Award className="w-8 h-8" />,         title: 'Graduate',   description: 'Recently finished studies and ready for the next chapter.', iconBgVar: 'var(--ob-icon-bg-blue)', iconColorVar: 'var(--ob-icon-blue)' },
  { value: 'Job Seeker', icon: <Briefcase className="w-8 h-8" />,     title: 'Job Seeker', description: 'Actively looking for new professional opportunities.', iconBgVar: 'var(--ob-icon-bg-teal)', iconColorVar: 'var(--ob-icon-teal)' },
]

interface Props {
  onNext: (data: JourneyPayload) => void
  onSkip: () => void
}

export function StepJourney({ onNext, onSkip }: Props) {
  const [selected, setSelected] = useState<JourneyType | null>(null)

  return (
    <div>
      {}
      <div style={{ textAlign: 'center', marginBottom: '32px' }}>
        <div className="gb-sec-label" style={{ justifyContent: 'center' }}>Your Journey</div>
        <h1 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--ob-text-primary)', fontFamily: "'Bricolage Grotesque', sans-serif", marginBottom: '8px' }}>
          Where are you in your journey?
        </h1>
        <p style={{ fontSize: '0.9rem', color: 'var(--ob-text-secondary)' }}>
          Select the option that best describes your current professional or academic standing.
        </p>
      </div>

      {}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
        {OPTIONS.map((option) => {
          const isSelected = selected === option.value
          return (
            <button
              key={option.value}
              onClick={() => setSelected(option.value)}
              style={{
                display:       'flex',
                flexDirection: 'column',
                alignItems:    'center',
                textAlign:     'center',
                padding:       '28px 16px',
                borderRadius:  '16px',
                border:        `2px solid ${isSelected ? 'var(--ob-border-active)' : 'var(--ob-border)'}`,
                background:    isSelected ? 'var(--ob-surface-hover)' : 'var(--ob-surface)',
                cursor:        'pointer',
                transition:    'all 0.2s',
                boxShadow:     isSelected ? '0 8px 30px rgba(22,163,74,0.18)' : '0 1px 4px rgba(0,0,0,0.06)',
                transform:     isSelected ? 'translateY(-2px)' : 'none',
              }}
            >
              <div style={{ padding: '12px', borderRadius: '50%', marginBottom: '16px', background: option.iconBgVar, color: option.iconColorVar }}>
                {option.icon}
              </div>
              <p style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--ob-text-primary)', marginBottom: '8px' }}>
                {option.title}
              </p>
              <p style={{ fontSize: '0.78rem', color: 'var(--ob-text-secondary)', lineHeight: 1.5 }}>
                {option.description}
              </p>
            </button>
          )
        })}
      </div>

      <StepFooter
        onSkip={onSkip}
        onContinue={() => selected && onNext({ journey: selected })}
        canContinue={!!selected}
      />
    </div>
  )
}