'use client'

import { useState } from 'react'
import { ChevronDown, Bell } from 'lucide-react'
import { cn } from '@/lib/utils'

const MOCK_PROJECTS = [
  { code: 'BKT2SA', name: 'Bukit 2 Site A' },
  { code: 'KLCC01', name: 'KLCC Tower 1' },
  { code: 'PTRJY3', name: 'Putrajaya Phase 3' },
]

const MOCK_USER = {
  name: 'Ahmad Faris',
  role: 'Project Manager',
  initials: 'AF',
}

export function Topbar() {
  const [activeProject, setActiveProject] = useState(MOCK_PROJECTS[0])
  const [projectOpen, setProjectOpen] = useState(false)

  return (
    <header className="shrink-0 h-16 flex items-center justify-between px-6 bg-[var(--color-surface)] border-b border-[var(--color-border)]">
      {/* Project switcher */}
      <div className="relative">
        <button
          onClick={() => setProjectOpen(!projectOpen)}
          className={cn(
            'flex items-center gap-2 px-3 py-1.5 rounded-[var(--radius-card)]',
            'border border-[var(--color-border)] bg-[var(--color-bg)]',
            'text-sm font-medium text-[var(--color-ink)]',
            'hover:border-[var(--color-accent)] transition-colors duration-150',
            'focus-visible:outline-[var(--color-accent)]',
          )}
          aria-expanded={projectOpen}
          aria-haspopup="listbox"
        >
          <span className="font-mono text-xs font-medium text-[var(--color-accent)] uppercase tracking-widest">
            {activeProject.code}
          </span>
          <span className="text-[var(--color-ink-muted)] hidden sm:inline">
            {activeProject.name}
          </span>
          <ChevronDown
            size={14}
            className={cn(
              'text-[var(--color-ink-muted)] transition-transform duration-150',
              projectOpen && 'rotate-180',
            )}
          />
        </button>

        {projectOpen && (
          <div
            role="listbox"
            className={cn(
              'absolute top-full left-0 mt-1 min-w-[220px] z-50',
              'bg-[var(--color-surface)] border border-[var(--color-border)]',
              'rounded-[var(--radius-card)] shadow-[var(--shadow-elevated)] overflow-hidden',
            )}
          >
            {MOCK_PROJECTS.map((project) => (
              <button
                key={project.code}
                role="option"
                aria-selected={project.code === activeProject.code}
                onClick={() => {
                  setActiveProject(project)
                  setProjectOpen(false)
                }}
                className={cn(
                  'w-full flex items-center gap-3 px-3 py-2.5 text-left',
                  'text-sm transition-colors duration-100',
                  project.code === activeProject.code
                    ? 'bg-[var(--color-accent-subtle)] text-[var(--color-accent)]'
                    : 'text-[var(--color-ink)] hover:bg-[var(--color-bg)]',
                )}
              >
                <span className="font-mono text-xs font-medium uppercase tracking-widest shrink-0">
                  {project.code}
                </span>
                <span className="text-[var(--color-ink-muted)] truncate">{project.name}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Right side: notifications + user */}
      <div className="flex items-center gap-3">
        <button
          className={cn(
            'relative p-2 rounded-[var(--radius-card)]',
            'text-[var(--color-ink-muted)] hover:bg-[var(--color-border)]',
            'transition-colors duration-150',
          )}
          aria-label="Notifications"
        >
          <Bell size={18} />
        </button>

        <div className="flex items-center gap-2.5">
          {/* Avatar */}
          <div
            className={cn(
              'flex items-center justify-center w-8 h-8 rounded-full shrink-0',
              'bg-[var(--color-accent)] text-white',
              'text-xs font-semibold font-display select-none',
            )}
            aria-hidden
          >
            {MOCK_USER.initials}
          </div>
          <div className="hidden sm:flex flex-col leading-tight">
            <span className="text-sm font-medium text-[var(--color-ink)]">
              {MOCK_USER.name}
            </span>
            <span className="text-xs text-[var(--color-ink-muted)]">
              {MOCK_USER.role}
            </span>
          </div>
        </div>
      </div>
    </header>
  )
}
