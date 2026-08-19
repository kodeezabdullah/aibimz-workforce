import { ReportPicker } from '@/components/dashboard/ReportPicker'

const LABOUR_COST_CARDS = [
  {
    slug:        'overall',
    title:       'Overall',
    description: 'Combined labour expenses across all worker types — regular pay, overtime, and backcharge recovery.',
  },
  {
    slug:        'general-worker',
    title:       'General Worker',
    description: 'Labour cost breakdown for general workers — civil, structural, finishing, and excavation trades.',
  },
  {
    slug:        'staff',
    title:       'Staff',
    description: 'Staff cost breakdown — site supervisors, QS engineers, safety officers, and project engineers.',
  },
  {
    slug:        'subcon',
    title:       'Subcon',
    description: 'Subcontractor labour cost — M&E, plumbing, roofing, tiling, and painting works.',
  },
  {
    slug:        'operator',
    title:       'Operator',
    description: 'Plant operator cost — tower crane, excavator, forklift, and concrete pump operators.',
  },
  {
    slug:        'subcon-as-gw',
    title:       'Subcon As GW',
    description: 'Subcontractors counted as general workers — civil, structural, and carpentry trades.',
  },
]

export default function LabourCostReportPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold text-[var(--color-ink)]">
          Labour Cost Report
        </h1>
        <p className="mt-1 text-sm text-[var(--color-ink-muted)]">
          Select a report period and type to view detailed labour cost, overtime breakdown, backcharge recovery, and budget usage by work package.
        </p>
      </div>

      <ReportPicker
        basePath="/reports/labour-cost"
        cards={LABOUR_COST_CARDS}
        defaultMonth={8}
        defaultYear={2025}
      />
    </div>
  )
}
