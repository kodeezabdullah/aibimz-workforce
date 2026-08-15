'use client'

import { useState, useMemo } from 'react'
import { Search } from 'lucide-react'
import { cn } from '@/lib/utils'
import { getCompanies } from '@/lib/mock-data'

const PAGE_SIZE = 10

function formatJoinedDate(iso: string): string {
  const d = new Date(iso + 'T00:00:00')
  return d.toLocaleDateString('en-MY', { day: '2-digit', month: 'short', year: 'numeric' })
}

export default function CompanyListPage() {
  const [search, setSearch] = useState('')

  const allCompanies = getCompanies()

  const filtered = useMemo(() => {
    if (!search.trim()) return allCompanies
    const q = search.toLowerCase().trim()
    return allCompanies.filter(c => c.name.toLowerCase().includes(q))
  }, [allCompanies, search])

  // Pagination (single page for now — shows all or up to PAGE_SIZE)
  const pageStart = 1
  const pageEnd   = Math.min(PAGE_SIZE, filtered.length)
  const displayed = filtered.slice(0, PAGE_SIZE)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="font-display text-2xl font-semibold text-[var(--color-ink)]">
          Company List
        </h1>
        <p className="mt-1 text-sm text-[var(--color-ink-muted)]">
          Registered companies and subcontractors — manage profiles, SSM registration details, and engagement history.
        </p>
      </div>

      {/* Search bar */}
      <div className="flex items-center gap-3">
        <div className="relative">
          <Search
            size={14}
            strokeWidth={2}
            className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[var(--color-ink-muted)] pointer-events-none"
          />
          <input
            type="text"
            placeholder="Search by company name…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className={cn(
              'h-9 w-64 pl-8 pr-3 text-sm',
              'bg-[var(--color-surface)] text-[var(--color-ink)]',
              'border border-[var(--color-border)] rounded-[var(--radius-card)]',
              'placeholder:text-[var(--color-ink-muted)]',
              'focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] focus:ring-offset-0',
              'transition-shadow duration-150',
            )}
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-[var(--color-surface)] rounded-[var(--radius-card)] shadow-[var(--shadow-card)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--color-border)] bg-[var(--color-bg)]">
                {['No', 'Company', 'Registration No', 'Joined Date', 'Action'].map(h => (
                  <th
                    key={h}
                    className="px-5 py-3 text-left text-[11px] font-medium uppercase tracking-wider text-[var(--color-ink-muted)] whitespace-nowrap"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--color-border)]">
              {displayed.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-5 py-12 text-center text-sm text-[var(--color-ink-muted)]"
                  >
                    No companies match your search
                  </td>
                </tr>
              ) : (
                displayed.map((company, idx) => (
                  <tr
                    key={company.id}
                    className="hover:bg-[var(--color-bg)] transition-colors duration-100"
                  >
                    {/* No */}
                    <td className="px-5 py-3 font-mono text-xs font-medium text-[var(--color-ink-muted)] whitespace-nowrap">
                      {String(idx + 1).padStart(2, '0')}
                    </td>

                    {/* Company name — accent-colored interactive text */}
                    <td className="px-5 py-3 whitespace-nowrap">
                      <button
                        type="button"
                        className={cn(
                          'text-sm font-medium text-[var(--color-accent)]',
                          'hover:text-[var(--color-accent-hover)] hover:underline underline-offset-2',
                          'transition-colors duration-150 text-left',
                        )}
                      >
                        {company.name}
                      </button>
                    </td>

                    {/* Registration No — plain text */}
                    <td className="px-5 py-3 font-mono text-xs font-medium text-[var(--color-ink)] whitespace-nowrap">
                      {company.registrationNo}
                    </td>

                    {/* Joined Date */}
                    <td className="px-5 py-3 text-sm text-[var(--color-ink-muted)] whitespace-nowrap">
                      {formatJoinedDate(company.joinedDate)}
                    </td>

                    {/* Action */}
                    <td className="px-5 py-3 whitespace-nowrap">
                      <button
                        type="button"
                        className={cn(
                          'inline-flex items-center px-3 py-1.5 text-xs font-medium',
                          'border border-[var(--color-border)] rounded-[var(--radius-sm)]',
                          'text-[var(--color-ink-muted)] bg-[var(--color-surface)]',
                          'hover:border-[var(--color-ink-muted)] hover:text-[var(--color-ink)]',
                          'transition-colors duration-150',
                        )}
                      >
                        Detail
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-[var(--color-border)] bg-[var(--color-bg)]">
          <p className="text-xs text-[var(--color-ink-muted)]">
            {filtered.length === 0
              ? 'No results'
              : `Showing ${pageStart} to ${pageEnd} of ${filtered.length} result${filtered.length !== 1 ? 's' : ''}`}
          </p>
        </div>
      </div>
    </div>
  )
}
