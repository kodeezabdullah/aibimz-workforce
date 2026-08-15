// Mock AI response layer — all "AI" logic is isolated here.
// Swap getAutoInsights / getChatResponse for real API calls without touching the UI.
// TODO: replace getChatResponse with POST to /api/ai-insights once LLM integration is wired up

import {
  getProductivityScores,
  getLabourCostKPIs,
  getWorkPackageCostReconciliation,
  getAttendanceTrend,
  MOCK_PROJECT,
} from '@/lib/mock-data'
import { formatCurrency } from '@/lib/utils'

const PROJECT_ID = MOCK_PROJECT.id

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type InsightSeverity = 'info' | 'warning' | 'critical'

export interface AutoInsight {
  id: string
  severity: InsightSeverity
  headline: string
  body: string
  linkTo: string
}

export interface ChatResponse {
  text: string
  factors?: string[]
  recommendation?: string
}

// ---------------------------------------------------------------------------
// Auto insights — derived from real data selectors, no delay needed
// ---------------------------------------------------------------------------

export function getAutoInsights(): AutoInsight[] {
  const productivity = getProductivityScores(PROJECT_ID)
  const labourKPIs   = getLabourCostKPIs(PROJECT_ID)
  const wpRecon      = getWorkPackageCostReconciliation(PROJECT_ID)
  const attrTrend    = getAttendanceTrend(PROJECT_ID, 'monthly')

  const insights: AutoInsight[] = []

  // Insight 1: Attention-band workers + idle cost
  const attentionWorkers = productivity.filter(w => w.band === 'attention')
  if (attentionWorkers.length > 0) {
    insights.push({
      id: 'productivity-attention',
      severity: attentionWorkers.length >= 10 ? 'critical' : 'warning',
      headline: `${attentionWorkers.length} workers in Attention Required band`,
      body: `Estimated idle labour cost this period is ${formatCurrency(labourKPIs.idleCostEstimate)}. These workers have utilisation scores below 70%.`,
      linkTo: '/productivity',
    })
  }

  // Insight 2: Over-budget work packages
  const overBudget = wpRecon
    .filter(r => r.status === 'over_budget')
    .sort((a, b) => a.variance - b.variance) // most negative variance first = worst overrun
  if (overBudget.length > 0) {
    const worst      = overBudget[0]
    const overrunAmt = Math.abs(worst.variance)
    insights.push({
      id: 'wp-over-budget',
      severity: 'warning',
      headline: `${overBudget.length} work package${overBudget.length > 1 ? 's' : ''} running over budget`,
      body: `Worst overrun: ${worst.packageCode} (${worst.subcategory ?? worst.category ?? 'N/A'}) is ${formatCurrency(overrunAmt)} over estimated cost.`,
      linkTo: '/labour-cost',
    })
  }

  // Insight 3: Overtime as % of total labour cost
  const { monthlyCost, overtimeCost } = labourKPIs
  const otPct = monthlyCost > 0 ? Math.round((overtimeCost / monthlyCost) * 100) : 0
  insights.push({
    id: 'overtime-cost',
    severity: otPct >= 25 ? 'critical' : otPct >= 15 ? 'warning' : 'info',
    headline: `Overtime is ${otPct}% of total labour spend`,
    body: otPct >= 15
      ? `${formatCurrency(overtimeCost)} in overtime cost against ${formatCurrency(monthlyCost)} total this period — above normal operational thresholds.`
      : `${formatCurrency(overtimeCost)} in overtime cost this period — within normal range.`,
    linkTo: '/labour-cost',
  })

  // Insight 4: Attendance rate change vs prior period
  if (attrTrend.length >= 2) {
    const latest = attrTrend[attrTrend.length - 1].value
    const prev   = attrTrend[attrTrend.length - 2].value
    const delta  = Math.round((latest - prev) * 10) / 10
    if (delta <= -3) {
      insights.push({
        id: 'attendance-drop',
        severity: delta <= -8 ? 'critical' : 'warning',
        headline: `Attendance rate down ${Math.abs(delta)} points vs last period`,
        body: `Current attendance at ${latest}%, down from ${prev}% in the previous period. Review for patterns by worker type.`,
        linkTo: '/attendance',
      })
    } else {
      insights.push({
        id: 'attendance-stable',
        severity: 'info',
        headline: delta >= 3
          ? `Attendance rate up ${delta} points vs last period`
          : `Attendance rate stable at ${latest}%`,
        body: delta >= 3
          ? `Up from ${prev}% last period — site workforce engagement is improving.`
          : `Minimal change vs last period (${prev}%). No significant attendance shift detected.`,
        linkTo: '/attendance',
      })
    }
  }

  return insights.slice(0, 4)
}

// ---------------------------------------------------------------------------
// Chat response — pattern-matched against question keywords.
// Wraps in 600–1200 ms delay so the UI feels like it's "thinking."
// ---------------------------------------------------------------------------

export async function getChatResponse(question: string): Promise<ChatResponse> {
  // TODO: replace with POST to /api/ai-insights once LLM integration is wired up
  await simulateThinking()

  const q = question.toLowerCase()

  if (matchAny(q, ['productivity', 'utilisation', 'utilization', 'slow', 'dropping', 'score', 'underperform', 'worker performance'])) {
    return buildProductivityResponse()
  }

  if (matchAny(q, ['cost', 'budget', 'overtime', 'spend', 'labour', 'labor', 'expensive', 'overrun', 'over budget'])) {
    return buildCostResponse()
  }

  if (matchAny(q, ['attendance', 'absent', 'absentee', 'present', 'show up', 'turnup', 'rate'])) {
    return buildAttendanceResponse()
  }

  if (matchAny(q, ['work package', 'package', 'delay', 'progress', 'behind', ' wp ', 'on going', 'in review'])) {
    return buildWorkPackageResponse()
  }

  if (matchAny(q, ['recommend', 'focus', 'priority', 'what should', 'suggest', 'action', 'improve', 'next step', 'this week'])) {
    return buildRecommendationResponse()
  }

  return {
    text: "I don't have specific data on that yet. Try asking about workforce productivity, labour cost and overtime, attendance trends, or work package budget status — those are the areas I have full visibility into for this project.",
    recommendation: "Tip: use the suggested questions below as a starting point.",
  }
}

// ---------------------------------------------------------------------------
// Topic response builders — all pull REAL numbers from mock-data selectors
// ---------------------------------------------------------------------------

function buildProductivityResponse(): ChatResponse {
  const scores    = getProductivityScores(PROJECT_ID)
  const attention = scores.filter(s => s.band === 'attention')
  const normal    = scores.filter(s => s.band === 'normal')
  const high      = scores.filter(s => s.band === 'high')
  const { idleCostEstimate } = getLabourCostKPIs(PROJECT_ID)
  const avgScore  = Math.round(scores.reduce((s, r) => s + r.score, 0) / scores.length)

  return {
    text: `Current workforce utilisation averages ${avgScore}/100 across ${scores.length} workers.`,
    factors: [
      `${attention.length} workers in Attention Required (<70%) — estimated ${formatCurrency(idleCostEstimate)} in idle labour cost this period`,
      `${normal.length} workers performing normally (70–89%) — on track but with room to improve`,
      `${high.length} workers in the High band (≥90%) — carrying above-average workload`,
    ],
    recommendation: `Focus immediate intervention on the ${attention.length} Attention Required workers. Low scores here are typically driven by frequent absences or short working hours — cross-check their attendance records first.`,
  }
}

function buildCostResponse(): ChatResponse {
  const { monthlyCost, overtimeCost, idleCostEstimate, budgetUtilizationPct } = getLabourCostKPIs(PROJECT_ID)
  const wpRecon    = getWorkPackageCostReconciliation(PROJECT_ID)
  const overBudget = wpRecon.filter(r => r.status === 'over_budget')
  const otPct      = monthlyCost > 0 ? Math.round((overtimeCost / monthlyCost) * 100) : 0

  return {
    text: `Total labour spend this period is ${formatCurrency(monthlyCost)}, with work-package budget utilisation at ${budgetUtilizationPct}%.`,
    factors: [
      `Overtime accounts for ${otPct}% of total spend (${formatCurrency(overtimeCost)})`,
      `${formatCurrency(idleCostEstimate)} estimated as idle labour cost from under-utilised workers`,
      `${overBudget.length} work package${overBudget.length !== 1 ? 's' : ''} tracking over budget`,
    ],
    recommendation: overBudget.length > 0
      ? `Review ${overBudget.sort((a, b) => a.variance - b.variance)[0].packageCode} first (worst overrun) — reallocate idle workers to bring cost in line. Capping overtime on non-critical packages will also have an immediate impact.`
      : `Labour cost is within expected bounds. Monitor overtime weekly — gradual creep is common in the middle phases of construction projects.`,
  }
}

function buildAttendanceResponse(): ChatResponse {
  const trend  = getAttendanceTrend(PROJECT_ID, 'monthly')
  const latest = trend.length > 0 ? trend[trend.length - 1].value : 0
  const prev   = trend.length > 1 ? trend[trend.length - 2].value : latest
  const delta  = Math.round((latest - prev) * 10) / 10
  const dir    = delta > 0 ? 'up' : delta < 0 ? 'down' : 'unchanged'

  return {
    text: `Attendance rate this month is ${latest}%${dir !== 'unchanged' ? `, ${dir} ${Math.abs(delta)} points vs the previous period` : ', unchanged from last period'}.`,
    factors: [
      dir === 'down'
        ? 'Monthly trend shows a declining pattern — investigate by worker type on the Attendance page'
        : dir === 'up'
          ? 'Monthly trend is improving — site presence is strengthening'
          : 'Attendance is holding steady with no significant shift',
      'Some periods may still be in Processing status — data may be provisional until finalized',
      'RFID and face-scan are the primary sources; manual entries may introduce a small reporting lag',
    ],
    recommendation: delta < -3
      ? `Attendance has dropped meaningfully. Cross-check by worker type — subcon and operator types often show the most variability. Always check period status before acting on the numbers.`
      : `Attendance is holding steady. Follow up on any workers who have not submitted records for the active period.`,
  }
}

function buildWorkPackageResponse(): ChatResponse {
  const wpRecon     = getWorkPackageCostReconciliation(PROJECT_ID)
  const overBudget  = wpRecon.filter(r => r.status === 'over_budget').sort((a, b) => a.variance - b.variance)
  const onBudget    = wpRecon.filter(r => r.status === 'on_budget')
  const underBudget = wpRecon.filter(r => r.status === 'under_budget')
  const worst       = overBudget[0] ?? null

  return {
    text: `Across ${wpRecon.length} active work packages: ${underBudget.length} under budget, ${onBudget.length} on budget, ${overBudget.length} over budget.`,
    factors: [
      worst
        ? `Worst overrun: ${worst.packageCode} at ${formatCurrency(Math.abs(worst.variance))} over estimated cost`
        : 'No packages currently over budget',
      'Physical progress varies — check the Work Packages page for individual progress %',
      'Completed packages include audited actual costs; in-progress estimates use a budget × progress model',
    ],
    recommendation: worst
      ? `Prioritise ${worst.packageCode} — review assigned workers' productivity scores and consider whether the budget envelope needs revision or resources need reallocation.`
      : `All packages are within budget. Monitor physical progress percentages — cost overruns often surface 2–3 weeks after progress stalls.`,
  }
}

function buildRecommendationResponse(): ChatResponse {
  const scores     = getProductivityScores(PROJECT_ID)
  const attention  = scores.filter(s => s.band === 'attention')
  const { overtimeCost, monthlyCost } = getLabourCostKPIs(PROJECT_ID)
  const wpRecon    = getWorkPackageCostReconciliation(PROJECT_ID)
  const overBudget = wpRecon.filter(r => r.status === 'over_budget')
  const otPct      = monthlyCost > 0 ? Math.round((overtimeCost / monthlyCost) * 100) : 0

  return {
    text: `Based on current data, here are the highest-priority actions for this week:`,
    factors: [
      attention.length > 0
        ? `Address the ${attention.length} Attention Required workers — investigate whether low scores stem from absenteeism or short working hours`
        : `Workforce productivity is healthy — maintain current work patterns`,
      overBudget.length > 0
        ? `Review cost overruns on ${overBudget.length} work package${overBudget.length > 1 ? 's' : ''} before they compound`
        : `Work package budgets are on track — no immediate action needed`,
      otPct >= 20
        ? `Overtime at ${otPct}% of total labour cost is elevated — cap non-critical overtime to control spend`
        : `Overtime is within normal bounds — no immediate action needed`,
    ],
    recommendation: `Start with productivity — it has the widest downstream impact on both cost and delivery. After that, tackle any budget overruns before the end of the current processing period.`,
  }
}

// ---------------------------------------------------------------------------
// Utilities
// ---------------------------------------------------------------------------

function matchAny(text: string, keywords: string[]): boolean {
  return keywords.some(kw => text.includes(kw))
}

function simulateThinking(): Promise<void> {
  const ms = 600 + Math.random() * 600
  return new Promise(resolve => setTimeout(resolve, ms))
}
