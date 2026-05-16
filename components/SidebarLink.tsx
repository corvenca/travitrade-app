'use client'

export default function SidebarLink({ href, children }: { href: string, children: React.ReactNode }) {
  return (
    <a
      href={href}
      rel="noopener noreferrer"
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        padding: '10px 16px',
        color: '#9FE1CB',
        fontSize: '13px',
        textDecoration: 'none',
        borderRadius: '6px',
        transition: 'background 0.15s'
      }}
      onMouseEnter={e => (e.currentTarget.style.background = '#0f2a1a')}
      onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
    >
      {children}
    </a>
  )
}
