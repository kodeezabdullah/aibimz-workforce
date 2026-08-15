'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import Link from 'next/link'
import { Sparkles, Send, ArrowRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  getAutoInsights,
  getChatResponse,
  type AutoInsight,
  type InsightSeverity,
  type ChatResponse,
} from '@/lib/ai/mock-insights'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type MessageRole = 'user' | 'assistant'

interface Message {
  id: string
  role: MessageRole
  text: string
  factors?: string[]
  recommendation?: string
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const SUGGESTED_QUESTIONS = [
  'Why is productivity dropping?',
  'What should I focus on this week?',
  'Which work packages are over budget?',
  'Why is overtime increasing?',
]

const OPENING_MESSAGE: Message = {
  id: 'opening',
  role: 'assistant',
  text: "Hi — I'm your workforce analytics assistant for Bukit 2 Site A. I have full visibility into productivity, labour cost, attendance, and work package budgets.",
  factors: [
    'Workforce utilisation scores and attention-band workers',
    'Labour cost, overtime trends, and work package budget status',
    'Attendance patterns and period processing status',
  ],
  recommendation: 'Try one of the suggested questions below, or type your own.',
}

// ---------------------------------------------------------------------------
// Insight severity helpers
// ---------------------------------------------------------------------------

const SEVERITY_RAIL: Record<InsightSeverity, string> = {
  info:     'bg-[var(--color-accent)]',
  warning:  'bg-[var(--color-pending)]',
  critical: 'bg-[var(--color-alert)]',
}

const SEVERITY_BADGE: Record<InsightSeverity, string> = {
  info:     'text-[var(--color-accent)]    bg-[#FEF3C7]',
  warning:  'text-[var(--color-pending)]   bg-[#FEF9EA]',
  critical: 'text-[var(--color-alert)]     bg-[#FEE2D5]',
}

const SEVERITY_LABEL: Record<InsightSeverity, string> = {
  info:     'Info',
  warning:  'Warning',
  critical: 'Critical',
}

// ---------------------------------------------------------------------------
// InsightCard
// ---------------------------------------------------------------------------

function InsightCard({ insight }: { insight: AutoInsight }) {
  return (
    <div className="bg-surface rounded-xl border border-border flex overflow-hidden flex-1 min-w-0">
      <div className={cn('w-1 flex-shrink-0', SEVERITY_RAIL[insight.severity])} />
      <div className="flex flex-col gap-2 p-4 min-w-0 w-full">
        <span
          className={cn(
            'self-start text-[10px] font-medium uppercase tracking-wider px-2 py-0.5 rounded-full',
            SEVERITY_BADGE[insight.severity],
          )}
        >
          {SEVERITY_LABEL[insight.severity]}
        </span>
        <p className="font-medium text-sm text-[var(--color-ink)] leading-snug">
          {insight.headline}
        </p>
        <p className="text-xs text-[var(--color-ink-muted)] leading-relaxed">
          {insight.body}
        </p>
        <Link
          href={insight.linkTo}
          className="inline-flex items-center gap-1 text-xs text-[var(--color-accent)] hover:text-[var(--color-accent-hover)] font-medium mt-auto pt-1 transition-colors"
        >
          View details <ArrowRight className="w-3 h-3" />
        </Link>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// InsightCard skeleton
// ---------------------------------------------------------------------------

function InsightCardSkeleton() {
  return (
    <div className="bg-surface rounded-xl border border-border flex overflow-hidden flex-1 min-h-[140px] animate-pulse">
      <div className="w-1 flex-shrink-0 bg-border" />
      <div className="flex flex-col gap-3 p-4 w-full">
        <div className="h-4 w-16 bg-border rounded-full" />
        <div className="h-4 w-3/4 bg-border rounded" />
        <div className="h-3 w-full bg-border rounded" />
        <div className="h-3 w-2/3 bg-border rounded" />
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// ChatBubble
// ---------------------------------------------------------------------------

function ChatBubble({ message }: { message: Message }) {
  if (message.role === 'user') {
    return (
      <div className="flex justify-end">
        <div className="max-w-[80%] bg-[#FEF3C7] border border-[#FDE68A] rounded-2xl rounded-tr-sm px-4 py-3">
          <p className="text-sm text-[var(--color-ink)]">{message.text}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex gap-3 items-start">
      <div className="flex-shrink-0 w-7 h-7 rounded-full bg-[var(--color-accent)] flex items-center justify-center mt-0.5">
        <Sparkles className="w-3.5 h-3.5 text-white" />
      </div>
      <div className="max-w-[80%] bg-surface border border-border rounded-2xl rounded-tl-sm px-4 py-3 flex flex-col gap-2">
        <p className="text-sm text-[var(--color-ink)] leading-relaxed">{message.text}</p>
        {message.factors && message.factors.length > 0 && (
          <ol className="flex flex-col gap-1.5 mt-1">
            {message.factors.map((f, i) => (
              <li key={i} className="flex gap-2 text-xs text-[var(--color-ink-muted)] leading-relaxed">
                <span className="font-mono text-[var(--color-accent)] font-medium flex-shrink-0 tabular-nums">
                  {i + 1}.
                </span>
                <span>{f}</span>
              </li>
            ))}
          </ol>
        )}
        {message.recommendation && (
          <div className="mt-1 px-3 py-2 rounded-lg bg-[#FEF3C7] border border-[#FDE68A]">
            <p className="text-xs text-[var(--color-ink-muted)] leading-relaxed">
              <span className="font-medium text-[var(--color-accent)]">Recommendation: </span>
              {message.recommendation}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// TypingIndicator
// ---------------------------------------------------------------------------

function TypingIndicator() {
  return (
    <div className="flex gap-3 items-start">
      <div className="flex-shrink-0 w-7 h-7 rounded-full bg-[var(--color-accent)] flex items-center justify-center mt-0.5">
        <Sparkles className="w-3.5 h-3.5 text-white" />
      </div>
      <div className="bg-surface border border-border rounded-2xl rounded-tl-sm px-4 py-3.5">
        <div className="flex gap-1 items-center">
          {[0, 1, 2].map(i => (
            <span
              key={i}
              className="w-1.5 h-1.5 rounded-full bg-[var(--color-ink-muted)] animate-bounce"
              style={{ animationDelay: `${i * 0.15}s`, animationDuration: '0.8s' }}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function AiInsightsPage() {
  const [insights, setInsights]       = useState<AutoInsight[]>([])
  const [insightsReady, setInsightsReady] = useState(false)
  const [messages, setMessages]       = useState<Message[]>([OPENING_MESSAGE])
  const [input, setInput]             = useState('')
  const [isThinking, setIsThinking]   = useState(false)
  const bottomRef   = useRef<HTMLDivElement>(null)
  const inputRef    = useRef<HTMLInputElement>(null)

  // Load auto-insights synchronously on mount (no network call)
  useEffect(() => {
    setInsights(getAutoInsights())
    setInsightsReady(true)
  }, [])

  // Auto-scroll to bottom of message list
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isThinking])

  const sendMessage = useCallback(async (text: string) => {
    const trimmed = text.trim()
    if (!trimmed || isThinking) return

    setMessages(prev => [
      ...prev,
      { id: `user-${Date.now()}`, role: 'user', text: trimmed },
    ])
    setInput('')
    setIsThinking(true)

    try {
      const response: ChatResponse = await getChatResponse(trimmed)
      setMessages(prev => [
        ...prev,
        { id: `assistant-${Date.now()}`, role: 'assistant', ...response },
      ])
    } finally {
      setIsThinking(false)
      // Restore focus to input after response arrives
      requestAnimationFrame(() => inputRef.current?.focus())
    }
  }, [isThinking])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    sendMessage(input)
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Page header */}
      <div>
        <h1 className="font-display text-2xl font-semibold text-[var(--color-ink)]">
          AI Insights
        </h1>
        <p className="mt-1 text-sm text-[var(--color-ink-muted)]">
          Ask questions about your workforce, or review what&apos;s surfaced automatically.
        </p>
      </div>

      {/* Auto-surfaced insight cards */}
      <section>
        <h2 className="font-display text-base font-semibold text-[var(--color-ink)] mb-3">
          Surfaced automatically
        </h2>
        <div className="flex flex-col sm:flex-row gap-3">
          {insightsReady
            ? insights.map(insight => <InsightCard key={insight.id} insight={insight} />)
            : [1, 2, 3].map(i => <InsightCardSkeleton key={i} />)
          }
        </div>
      </section>

      {/* Chat interface */}
      <section className="flex flex-col gap-3">
        <h2 className="font-display text-base font-semibold text-[var(--color-ink)]">
          Ask the AI
        </h2>

        <div className="bg-surface rounded-xl border border-border flex flex-col overflow-hidden">
          {/* Message list */}
          <div className="flex flex-col gap-4 p-4 overflow-y-auto max-h-[500px] min-h-[220px]">
            {messages.map(msg => (
              <ChatBubble key={msg.id} message={msg} />
            ))}
            {isThinking && <TypingIndicator />}
            <div ref={bottomRef} />
          </div>

          {/* Suggested question chips */}
          <div className="px-4 pt-3 pb-3 border-t border-border">
            <div className="flex flex-wrap gap-2">
              {SUGGESTED_QUESTIONS.map(q => (
                <button
                  key={q}
                  onClick={() => sendMessage(q)}
                  disabled={isThinking}
                  className={cn(
                    'text-xs px-3 py-1.5 rounded-full border border-border',
                    'text-[var(--color-ink-muted)] bg-[var(--color-bg)]',
                    'hover:border-[var(--color-accent)] hover:text-[var(--color-accent)]',
                    'transition-colors duration-150',
                    'disabled:opacity-40 disabled:cursor-not-allowed',
                  )}
                >
                  {q}
                </button>
              ))}
            </div>
          </div>

          {/* Input row */}
          <form
            onSubmit={handleSubmit}
            className="flex items-center gap-2 px-4 pb-4"
          >
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              disabled={isThinking}
              placeholder="Ask about productivity, cost, attendance, or work packages…"
              className={cn(
                'flex-1 text-sm rounded-lg border border-border bg-[var(--color-bg)]',
                'px-3 py-2.5 text-[var(--color-ink)]',
                'placeholder:text-[var(--color-ink-muted)]',
                'focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] focus:border-transparent',
                'transition-shadow disabled:opacity-50',
              )}
            />
            <button
              type="submit"
              disabled={isThinking || !input.trim()}
              className={cn(
                'flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center',
                'bg-[var(--color-accent)] text-white',
                'hover:bg-[var(--color-accent-hover)] transition-colors',
                'disabled:opacity-40 disabled:cursor-not-allowed',
              )}
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </section>
    </div>
  )
}
