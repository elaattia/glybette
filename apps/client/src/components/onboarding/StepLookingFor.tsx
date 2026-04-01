import { useState } from 'react'
import { BookOpen, Briefcase, Globe, Zap, Sparkles, GraduationCap } from 'lucide-react'
import type { LookingForPayload, OpportunityType } from '@glybette/types'
import { StepFooter } from './StepFooter'

const OPTIONS: {
  value: OpportunityType
  icon: React.ReactNode
  title: string
  description: string
  iconBgVar: string
  iconColorVar: string
}[] = [
  { value: 'Internship', icon: <GraduationCap className="w-5 h-5" />, title: 'Internship', description: 'Short-term professional experience', iconBgVar: 'var(--ob-icon-bg-green)',  iconColorVar: 'var(--ob-icon-green)' },
  { value: 'PFE',        icon: <BookOpen className="w-5 h-5" />,      title: 'PFE',        description: 'End-of-study project',              iconBgVar: 'var(--ob-icon-bg-blue)',   iconColorVar: 'var(--ob-icon-blue)' },
  { value: 'Job',        icon: <Briefcase className="w-5 h-5" />,     title: 'Job',        description: 'Full-time position',                iconBgVar: 'var(--ob-icon-bg-yellow)', iconColorVar: 'var(--ob-icon-yellow)' },
  { value: 'Remote',     icon: <Globe className="w-5 h-5" />,         title: 'Remote',     description: 'Work from anywhere',                iconBgVar: 'var(--ob-icon-bg-teal)',   iconColorVar: 'var(--ob-icon-teal)' },
  { value: 'Freelance',  icon: <Zap className="w-5 h-5" />,           title: 'Freelance',  description: 'Independent missions',              iconBgVar: 'var(--ob-icon-bg-purple)', iconColorVar: 'var(--ob-icon-purple)' },
  { value: 'Other',      icon: <Sparkles className="w-5 h-5" />,      title: 'Other',      description: 'Something else entirely',           iconBgVar: 'var(--ob-icon-bg-red)',    iconColorVar: 'var(--ob-icon-red)' },
]

interface Props {
  onNext: (data: LookingForPayload) => void
  onSkip: () => void
}

export function StepLookingFor({ onNext, onSkip }: Props) {
  const [selected, setSelected] = useState<OpportunityType[]>([])

  function toggle(value: OpportunityType) {
    setSelected((prev) =>
      prev.includes(value) ? prev.filter((s) => s !== value) : [...prev, value]
    )
  }

  return (
    <div>
      {}
      <div style={{ textAlign: 'center', marginBottom: '28px' }}>
        <div className="gb-sec-label" style={{ justifyContent: 'center' }}>Opportunities</div>
        <h1 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--ob-text-primary)', fontFamily: "'Bricolage Grotesque', sans-serif", marginBottom: '8px' }}>
          What are you looking for?
        </h1>
        <p style={{ fontSize: '0.9rem', color: 'var(--ob-text-secondary)' }}>
          Select all that apply. You can change this later.
        </p>
      </div>

      {}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
        {OPTIONS.map((option) => {
          const isSelected = selected.includes(option.value)
          return (
            <button
              key={option.value}
              onClick={() => toggle(option.value)}
              style={{
                display:     'flex',
                alignItems:  'center',
                gap:         '14px',
                padding:     '14px 16px',
                borderRadius: '12px',
                border:      `2px solid ${isSelected ? 'var(--ob-border-active)' : 'var(--ob-border)'}`,
                background:  isSelected ? 'var(--ob-surface-hover)' : 'var(--ob-surface)',
                cursor:      'pointer',
                transition:  'all 0.2s',
                textAlign:   'left',
                boxShadow:   isSelected ? '0 4px 16px rgba(22,163,74,0.15)' : '0 1px 3px rgba(0,0,0,0.06)',
              }}
            >
             
              <div style={{ padding: '8px', borderRadius: '50%', flexShrink: 0, background: option.iconBgVar, color: option.iconColorVar }}>
                {option.icon}
              </div>

             
              <div style={{ flex: 1 }}>
                <p style={{ fontWeight: 600, fontSize: '0.88rem', color: 'var(--ob-text-primary)', marginBottom: '2px' }}>
                  {option.title}
                </p>
                <p style={{ fontSize: '0.75rem', color: 'var(--ob-text-secondary)' }}>
                  {option.description}
                </p>
              </div>

              
              <div style={{
                width: '20px', height: '20px', borderRadius: '50%', flexShrink: 0,
                border: `2px solid ${isSelected ? 'var(--ob-border-active)' : 'var(--ob-input-border)'}`,
                background: isSelected ? 'var(--ob-border-active)' : 'transparent',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'all 0.2s',
              }}>
                {isSelected && (
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </div>
            </button>
          )
        })}
      </div>

      <StepFooter
        onSkip={onSkip}
        onContinue={() => onNext({ opportunities: selected })}
        canContinue={selected.length > 0}
      />
    </div>
  )
}