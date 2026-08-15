import Link from 'next/link'
import { LayoutDashboard } from 'lucide-react'

export default function NotFound() {
  return (
    <div
      className="relative min-h-screen flex flex-col items-center justify-center px-6 overflow-hidden"
      style={{ background: 'var(--color-bg)' }}
    >
      {/* Warm dot-grid background */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage:
            'radial-gradient(circle, var(--color-border) 1.5px, transparent 1.5px)',
          backgroundSize: '28px 28px',
        }}
      />

      {/* Caution stripe top bar */}
      <div
        aria-hidden
        className="absolute top-0 left-0 right-0 h-2 overflow-hidden"
      >
        <div
          className="h-full w-full"
          style={{
            background:
              'repeating-linear-gradient(90deg, var(--color-accent) 0px, var(--color-accent) 32px, var(--color-ink) 32px, var(--color-ink) 64px)',
            opacity: 0.85,
          }}
        />
      </div>

      {/* Main content */}
      <div className="relative z-10 flex flex-col items-center text-center max-w-lg">

        {/* Hard hat illustration */}
        <div className="mb-8">
          <HardHatIllustration />
        </div>

        {/* 404 number */}
        <div
          className="font-display font-bold leading-none select-none"
          style={{
            fontSize: 'clamp(80px, 18vw, 160px)',
            color: 'var(--color-ink)',
            letterSpacing: '-0.04em',
          }}
        >
          4
          <span
            style={{
              color: 'var(--color-accent)',
              position: 'relative',
              display: 'inline-block',
            }}
          >
            0
            {/* Small exclamation overlaid in the O */}
            <span
              aria-hidden
              className="absolute inset-0 flex items-center justify-center font-display font-bold"
              style={{ fontSize: '0.28em', color: 'var(--color-accent-hover)', top: '6%' }}
            >
              !
            </span>
          </span>
          4
        </div>

        {/* Headline */}
        <h1
          className="mt-2 font-display font-semibold"
          style={{ fontSize: '1.5rem', color: 'var(--color-ink)', letterSpacing: '-0.02em' }}
        >
          This page didn&apos;t clock in.
        </h1>

        {/* Body */}
        <p
          className="mt-3 text-sm leading-relaxed"
          style={{ color: 'var(--color-ink-muted)', maxWidth: '360px' }}
        >
          It might have been moved off-site, reassigned to another project, or
          it never existed in the first place. Head back to the dashboard to
          find what you need.
        </p>

        {/* Status badge */}
        <div className="mt-6 flex items-center gap-2">
          <span
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-medium uppercase tracking-widest"
            style={{
              background: 'color-mix(in srgb, var(--color-alert) 10%, transparent)',
              color: 'var(--color-alert)',
              border: '1px solid color-mix(in srgb, var(--color-alert) 25%, transparent)',
            }}
          >
            <span
              className="w-1.5 h-1.5 rounded-full"
              style={{ background: 'var(--color-alert)' }}
            />
            Worker Not Found
          </span>
        </div>

        {/* CTA */}
        <div className="mt-8 flex flex-col sm:flex-row items-center gap-3">
          <Link
            href="/dashboard"
            className="not-found-primary-btn inline-flex items-center gap-2 px-5 py-2.5 rounded-[10px] text-sm font-medium text-white transition-colors duration-150"
          >
            <LayoutDashboard size={15} />
            Back to Dashboard
          </Link>

          <Link
            href="/"
            className="not-found-ghost-btn inline-flex items-center gap-2 px-5 py-2.5 rounded-[10px] text-sm font-medium transition-colors duration-150"
          >
            Go home
          </Link>
        </div>
      </div>

      {/* Caution stripe bottom bar */}
      <div
        aria-hidden
        className="absolute bottom-0 left-0 right-0 h-2 overflow-hidden"
      >
        <div
          className="h-full w-full"
          style={{
            background:
              'repeating-linear-gradient(90deg, var(--color-accent) 0px, var(--color-accent) 32px, var(--color-ink) 32px, var(--color-ink) 64px)',
            opacity: 0.85,
          }}
        />
      </div>
    </div>
  )
}

function HardHatIllustration() {
  return (
    <svg
      width="96"
      height="88"
      viewBox="0 0 96 88"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      {/* Drop shadow */}
      <ellipse cx="48" cy="82" rx="28" ry="4" fill="#211D18" opacity="0.07" />

      {/* Dome */}
      <path
        d="M10 52 C10 26 22 8 48 8 C74 8 86 26 86 52 Z"
        fill="#D97706"
      />

      {/* Dome highlight — subtle lighter arc */}
      <path
        d="M20 52 C20 33 28 16 48 14 C68 16 76 33 76 52"
        stroke="#F59E0B"
        strokeWidth="2"
        fill="none"
        opacity="0.5"
        strokeLinecap="round"
      />

      {/* Front peak detail */}
      <path
        d="M36 30 C36 22 60 22 60 30"
        stroke="#B45309"
        strokeWidth="2"
        fill="none"
        strokeLinecap="round"
      />

      {/* Brim */}
      <path
        d="M4 52 Q4 62 12 62 L84 62 Q92 62 92 52 Z"
        fill="#B45309"
      />

      {/* Brim highlight */}
      <path
        d="M4 52 L92 52"
        stroke="#D97706"
        strokeWidth="1.5"
        opacity="0.6"
      />

      {/* Ventilation ridge — center */}
      <path
        d="M44 20 L44 50"
        stroke="#B45309"
        strokeWidth="2"
        strokeLinecap="round"
        opacity="0.5"
      />
      <path
        d="M52 20 L52 50"
        stroke="#B45309"
        strokeWidth="2"
        strokeLinecap="round"
        opacity="0.5"
      />

      {/* Suspension band line inside dome */}
      <path
        d="M14 52 Q48 44 82 52"
        stroke="#B45309"
        strokeWidth="1.5"
        fill="none"
        opacity="0.4"
      />
    </svg>
  )
}
