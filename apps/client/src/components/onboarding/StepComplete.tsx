import { useEffect, useState } from 'react'
import { Sparkles, LayoutDashboard, Briefcase, FileText, Shield } from 'lucide-react'

interface Props {
  name: string
  domain?: string
  lookingFor?: string[]
  onFinish: () => void
}

export function StepComplete({ name, domain, lookingFor, onFinish }: Props) {
  const [countdown, setCountdown] = useState(5)

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((c) => {
        if (c <= 1) { clearInterval(timer); onFinish(); return 0 }
        return c - 1
      })
    }, 1000)
    return () => clearInterval(timer)
  }, [onFinish])

  const profileSummary = [
    name,
    domain,
    lookingFor && lookingFor.length > 0 ? `looking for a ${lookingFor[0]}` : null,
  ].filter(Boolean).join(' · ')

  const features = [
    {
      icon: <LayoutDashboard className="w-4 h-4" />,
      iconBgVar:    'var(--ob-icon-bg-blue)',
      iconColorVar: 'var(--ob-icon-blue)',
      title: 'Personalized Dashboard',
      desc:  'Real-time tracking of your opportunities tailored to your profile.',
    },
    {
      icon: <Briefcase className="w-4 h-4" />,
      iconBgVar:    'var(--ob-icon-bg-green)',
      iconColorVar: 'var(--ob-icon-green)',
      title: 'Recommended Opportunities',
      desc:  'Curated offers that match your specific background and preferences.',
    },
    {
      icon: <FileText className="w-4 h-4" />,
      iconBgVar:    'var(--ob-icon-bg-purple)',
      iconColorVar: 'var(--ob-icon-purple)',
      title: 'CV Template',
      desc:  'A professional template optimized for your domain and target opportunities.',
    },
  ]

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center',
        gap: '22px',        
        width: '100%',
        boxSizing: 'border-box',
      }}
    >

      {}
      <div
        className="w-16 h-16 rounded-full flex items-center justify-center shadow-lg"
        style={{ background: 'linear-gradient(135deg, #16A34A, #0284C7)', flexShrink: 0 }}
      >
        <Sparkles className="w-8 h-8 text-white" />
      </div>

      {}
      <div
        style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', marginTop: '4px' }}
      >
        <h1
          className="text-4xl font-bold"
          style={{ color: 'var(--ob-text-primary)', margin: 0, lineHeight: 1.2  }}
        >
          All set for your journey!
        </h1>

        {domain && profileSummary && (
          <div
            className="inline-flex items-center gap-2 rounded-full shadow-sm"
            style={{
              background:  'var(--ob-surface)',
              border:      '1px solid var(--ob-border)',
              color:       'var(--ob-text-secondary)',
              padding:     '8px 20px',   
            }}
          >
            <Briefcase className="w-3.5 h-3.5" style={{ color: 'var(--ob-text-secondary)' }} />
            <span className="text-sm">{profileSummary}</span>
          </div>
        )}
      </div>

      {}
      <div
        className="w-full rounded-2xl text-left"
        style={{
          background:  'var(--ob-card-bg)',
          border:      '1px solid var(--ob-border)',
          padding:     '24px',
          boxSizing:   'border-box',
        }}
      >
        <p
          className="text-sm font-semibold"
          style={{
            color:        'var(--ob-text-primary)',
            margin:       '0 0 20px 0', 
          }}
        >
          What we've prepared for you:
        </p>

        <div
          style={{
            display:       'flex',
            flexDirection: 'column',
            gap:           '20px', 
          }}
        >
          {features.map((f) => (
            <div
              key={f.title}
              style={{
                display:   'flex',
                alignItems: 'flex-start',
                gap:        '12px',
              }}
            >
              <div
                className="rounded-lg flex items-center justify-center shrink-0"
                style={{
                  width:      '36px',  
                  height:     '36px',
                  background: f.iconBgVar,
                  color:      f.iconColorVar,
                  flexShrink: 0,
                }}
              >
                {f.icon}
              </div>
              <div style={{ paddingTop: '2px' }}> 
                <p
                  className="text-sm font-semibold"
                  style={{ color: 'var(--ob-text-primary)', margin: '0 0 4px 0' }}
                >
                  {f.title}
                </p>
                <p
                  className="text-xs"
                  style={{ color: 'var(--ob-text-secondary)', margin: 0 }}
                >
                  {f.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {}
      <div
        style={{
          width:   '100%',
          display: 'flex',
          flexDirection: 'column',
          gap:     '10px', 
        }}
      >
        <button
          onClick={onFinish}
          className="w-full text-white font-semibold text-base transition-all hover:scale-[1.02] hover:shadow-xl shadow-lg flex items-center justify-center gap-2"
          style={{
            background:   'linear-gradient(90deg, #16A34A, #0284C7)',
            borderRadius: '16px',
            padding:      '16px 24px', 
            border:       'none',
            cursor:       'pointer',
          }}
        >
          Launch My Experience
        </button>

        <p
          className="text-xs"
          style={{ color: 'var(--ob-text-secondary)', margin: 0, textAlign: 'center' }}
        >
          Redirecting to your dashboard in {countdown} moment{countdown !== 1 ? 's' : ''}...
        </p>
      </div>

      {}
      <div
        className="flex items-center gap-1.5 text-xs"
        style={{
          color:      'var(--ob-text-secondary)',
          marginTop:  '-8px', 
        }}
      >
        <Shield className="w-3.5 h-3.5" />
        Secure &amp; Personalized Account Setup
      </div>

    </div>
  )
}