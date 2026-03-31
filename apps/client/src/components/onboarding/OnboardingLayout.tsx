import { useState } from 'react'
import { X } from 'lucide-react'

interface OnboardingLayoutProps {
  currentStep: number
  totalSteps: number
  progress: number
  showBack?: boolean
  onBack?: () => void
  children: React.ReactNode
}

export function OnboardingLayout({
  currentStep,
  totalSteps,
  progress,
  showBack = false,
  onBack,
  children,
}: OnboardingLayoutProps) {
  const [showWhyMatters, setShowWhyMatters] = useState(false)

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{
        background: 'linear-gradient(135deg, var(--ob-bg-from) 0%, var(--ob-bg-to) 100%)',
      }}
    >
      {}
      <div style={{ width: '100%', padding: '24px 48px 0 48px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
          <span style={{ fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase' as const, color: 'var(--ob-text-secondary)' }}>
            STEP{' '}
            <span style={{ color: 'var(--ob-text-primary)', fontWeight: 800 }}>
              {String(currentStep).padStart(2, '0')}
            </span>
            {' '}of {String(totalSteps).padStart(2, '0')}
          </span>
          <span style={{ fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase' as const, color: 'var(--ob-text-secondary)' }}>
            {progress}% COMPLETE
          </span>
        </div>
        <div style={{ position: 'relative', height: '6px', width: '100%', borderRadius: '999px', overflow: 'hidden', background: 'var(--ob-progress-track)' }}>
          <div style={{ height: '100%', width: `${progress}%`, borderRadius: '999px', background: 'linear-gradient(90deg, #16A34A, #0284C7)', boxShadow: '0 0 12px rgba(22,163,74,0.55)', transition: 'width 0.7s cubic-bezier(0.4, 0, 0.2, 1)' }} />
        </div>
      </div>

      {}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 24px' }}>
        <div
          style={{
            width: '100%',
            maxWidth: '680px',
            background: 'var(--ob-card-bg)',
            border: '1px solid var(--ob-border)',
            borderRadius: '20px',
            boxShadow: 'var(--gb-shadow)',
            backdropFilter: 'blur(16px)',
            overflow: 'hidden',
          }}
        >
          {}
          {showBack && (
            <div style={{ padding: '16px 32px 0 32px' }}>
              <button
                onClick={onBack}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: '6px',
                  fontSize: '0.82rem', fontWeight: 500,
                  color: 'var(--ob-text-secondary)', background: 'transparent',
                  border: 'none', cursor: 'pointer', padding: '6px 10px',
                  borderRadius: '8px', transition: 'color 0.2s, background 0.2s',
                }}
                onMouseEnter={e => { e.currentTarget.style.color = 'var(--ob-text-primary)'; e.currentTarget.style.background = 'var(--ob-surface)' }}
                onMouseLeave={e => { e.currentTarget.style.color = 'var(--ob-text-secondary)'; e.currentTarget.style.background = 'transparent' }}
              >
                ← Back
              </button>
            </div>
          )}

          {}
          <div style={{ padding: showBack ? '24px 48px 40px 48px' : '48px 48px 40px 48px' }}>
            {children}
          </div>
        </div>
      </div>

      {}
      <div style={{ padding: '0 48px 28px 48px' }}>
        <button
          onClick={() => setShowWhyMatters(true)}
          style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', fontSize: '0.78rem', fontWeight: 500, color: 'var(--ob-text-secondary)', background: 'transparent', border: 'none', cursor: 'pointer', transition: 'color 0.2s' }}
          onMouseEnter={e => (e.currentTarget.style.color = 'var(--ob-text-primary)')}
          onMouseLeave={e => (e.currentTarget.style.color = 'var(--ob-text-secondary)')}
        >
          <span style={{ width: '20px', height: '20px', borderRadius: '50%', border: '1.5px solid var(--ob-border)', background: 'var(--ob-surface)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', fontWeight: 700, color: 'var(--ob-text-secondary)', flexShrink: 0 }}>?</span>
          Why this matters
        </button>
      </div>

      {}
      {showWhyMatters && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50, padding: '16px' }}>
          <div style={{ background: 'var(--ob-popup-bg)', border: '1px solid var(--ob-border)', borderRadius: '20px', boxShadow: 'var(--gb-shadow)', width: '100%', maxWidth: '440px', padding: '28px', display: 'flex', flexDirection: 'column' as const, gap: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--ob-text-primary)' }}>Why this matters</h3>
              <button onClick={() => setShowWhyMatters(false)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--ob-text-secondary)', display: 'flex', borderRadius: '6px' }} onMouseEnter={e => (e.currentTarget.style.color = 'var(--ob-text-primary)')} onMouseLeave={e => (e.currentTarget.style.color = 'var(--ob-text-secondary)')}>
                <X style={{ width: 18, height: 18 }} />
              </button>
            </div>
            <p style={{ fontSize: '0.875rem', lineHeight: 1.7, color: 'var(--ob-text-secondary)' }}>We ask a few questions to better understand you. This helps us personalize your profile and recommend opportunities that match your interests and goals.</p>
            <p style={{ fontSize: '0.875rem', lineHeight: 1.7, color: 'var(--ob-text-secondary)' }}>Since our platform supports different types of users, this information allows us to show the most relevant opportunities first, so you can quickly find what you're looking for.</p>
            <button onClick={() => setShowWhyMatters(false)} style={{ width: '100%', padding: '12px', background: 'linear-gradient(90deg, #16A34A, #0284C7)', color: '#fff', fontSize: '0.875rem', fontWeight: 600, border: 'none', borderRadius: '12px', cursor: 'pointer' }}>Got it</button>
          </div>
        </div>
      )}
    </div>
  )
}