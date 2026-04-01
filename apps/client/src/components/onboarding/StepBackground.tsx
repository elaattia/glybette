import { useState } from 'react'
import { Monitor, Building2, Stethoscope, BarChart3, Palette, Sparkles } from 'lucide-react'
import type { BackgroundPayload, Domain } from '@glybette/types'
import { StepFooter } from './StepFooter'

const OPTIONS: {
  value: Domain
  icon: React.ReactNode
  title: string
  description: string
  iconBgVar: string
  iconColorVar: string
}[] = [
  { value: 'IT',           icon: <Monitor className="w-7 h-7" />,     title: 'IT',           description: 'Software, data, cybersecurity...', iconBgVar: 'var(--ob-icon-bg-blue)',   iconColorVar: 'var(--ob-icon-blue)' },
  { value: 'Architecture', icon: <Building2 className="w-7 h-7" />,   title: 'Architecture', description: 'Design, urban planning...',         iconBgVar: 'var(--ob-icon-bg-yellow)', iconColorVar: 'var(--ob-icon-yellow)' },
  { value: 'Medicine',     icon: <Stethoscope className="w-7 h-7" />, title: 'Medicine',     description: 'Health, pharmacy, biology...',      iconBgVar: 'var(--ob-icon-bg-red)',    iconColorVar: 'var(--ob-icon-red)' },
  { value: 'Business',     icon: <BarChart3 className="w-7 h-7" />,   title: 'Business',     description: 'Finance, marketing, management...', iconBgVar: 'var(--ob-icon-bg-green)',  iconColorVar: 'var(--ob-icon-green)' },
  { value: 'Design',       icon: <Palette className="w-7 h-7" />,     title: 'Design',       description: 'UI/UX, graphic, motion...',         iconBgVar: 'var(--ob-icon-bg-purple)', iconColorVar: 'var(--ob-icon-purple)' },
  { value: 'Other',        icon: <Sparkles className="w-7 h-7" />,    title: 'Other',        description: 'Something else entirely',           iconBgVar: 'var(--ob-icon-bg-teal)',   iconColorVar: 'var(--ob-icon-teal)' },
]

interface Props {
  onNext: (data: BackgroundPayload) => void
  onSkip: () => void
}

export function StepBackground({ onNext, onSkip }: Props) {
  const [selected, setSelected] = useState<Domain | null>(null)

  return (
    <div>
      {/* Titre */}
      <div style={{ textAlign: 'center', marginBottom: '28px' }}>
        <div className="gb-sec-label" style={{ justifyContent: 'center' }}>Background</div>
        <h1 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--ob-text-primary)', fontFamily: "'Bricolage Grotesque', sans-serif", marginBottom: '8px' }}>
          Your background
        </h1>
        <p style={{ fontSize: '0.9rem', color: 'var(--ob-text-secondary)' }}>
          What is your field of expertise? This helps us show relevant opportunities.
        </p>
      </div>

      {/* Grid 3x2 */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
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
                padding:       '20px 12px',
                borderRadius:  '14px',
                border:        `2px solid ${isSelected ? 'var(--ob-border-active)' : 'var(--ob-border)'}`,
                background:    isSelected ? 'var(--ob-surface-hover)' : 'var(--ob-surface)',
                cursor:        'pointer',
                transition:    'all 0.2s',
                boxShadow:     isSelected ? '0 6px 24px rgba(22,163,74,0.18)' : '0 1px 4px rgba(0,0,0,0.06)',
                transform:     isSelected ? 'translateY(-2px)' : 'none',
              }}
            >
              <div style={{ padding: '10px', borderRadius: '50%', marginBottom: '12px', background: option.iconBgVar, color: option.iconColorVar }}>
                {option.icon}
              </div>
              <p style={{ fontWeight: 700, fontSize: '0.88rem', color: 'var(--ob-text-primary)', marginBottom: '4px' }}>
                {option.title}
              </p>
              <p style={{ fontSize: '0.75rem', color: 'var(--ob-text-secondary)', lineHeight: 1.4 }}>
                {option.description}
              </p>
            </button>
          )
        })}
      </div>

      <StepFooter
        onSkip={onSkip}
        onContinue={() => selected && onNext({ domain: selected })}
        canContinue={!!selected}
      />
    </div>
  )
}