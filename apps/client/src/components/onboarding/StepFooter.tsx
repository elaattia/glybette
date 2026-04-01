interface StepFooterProps {
  onSkip: () => void
  onContinue: () => void
  canContinue: boolean
  skipLabel?: string
  continueLabel?: string
}

export function StepFooter({
  onSkip,
  onContinue,
  canContinue,
  skipLabel = 'Skip for now',
  continueLabel = 'Continue →',
}: StepFooterProps) {
  return (
    <div
      style={{
        display:        'flex',
        alignItems:     'center',
        justifyContent: 'space-between',
        marginTop:      '32px',
        paddingTop:     '24px',
        borderTop:      '1px solid var(--ob-border)',
      }}
    >
      <button
        onClick={onSkip}
        style={{
          fontSize:   '0.875rem',
          fontWeight: 500,
          color:      'var(--ob-text-secondary)',
          background: 'transparent',
          border:     'none',
          cursor:     'pointer',
          padding:    '8px 0',
          transition: 'color 0.2s',
        }}
        onMouseEnter={e => (e.currentTarget.style.color = 'var(--ob-text-primary)')}
        onMouseLeave={e => (e.currentTarget.style.color = 'var(--ob-text-secondary)')}
      >
        {skipLabel}
      </button>

      <button
        onClick={onContinue}
        disabled={!canContinue}
        style={{
          padding:      '11px 32px',
          borderRadius: '12px',
          background:   canContinue
            ? 'linear-gradient(90deg, #16A34A, #0284C7)'
            : 'var(--ob-surface)',
          color:        canContinue ? '#ffffff' : 'var(--ob-text-secondary)',
          fontSize:     '0.875rem',
          fontWeight:   600,
          border:       canContinue ? 'none' : '1px solid var(--ob-border)',
          cursor:       canContinue ? 'pointer' : 'not-allowed',
          opacity:      canContinue ? 1 : 0.5,
          transition:   'all 0.2s',
          boxShadow:    canContinue ? '0 4px 20px rgba(22,163,74,0.30)' : 'none',
        }}
        onMouseEnter={e => {
          if (!canContinue) return
          e.currentTarget.style.transform = 'translateY(-1px)'
          e.currentTarget.style.boxShadow = '0 8px 28px rgba(22,163,74,0.45)'
        }}
        onMouseLeave={e => {
          e.currentTarget.style.transform = 'translateY(0)'
          e.currentTarget.style.boxShadow = canContinue ? '0 4px 20px rgba(22,163,74,0.30)' : 'none'
        }}
      >
        {continueLabel}
      </button>
    </div>
  )
}