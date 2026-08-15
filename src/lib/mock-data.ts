// Mock data layer — types match 0001_initial_schema.sql exactly.
// Selector functions are the ONLY public API; page components never touch raw arrays.
// Swap these selectors for real Supabase queries when the backend is connected.

// ---------------------------------------------------------------------------
// Types (mirroring DB columns)
// ---------------------------------------------------------------------------
export type WorkerType = 'general_worker' | 'staff' | 'subcon' | 'operator' | 'subcon_as_gw'
export type AttendanceStatus = 'present' | 'absent' | 'late' | 'early_leave'
export type AttendanceSource = 'rfid' | 'face_scan' | 'manual'
export type PeriodType = '1st_half' | '2nd_half' | 'monthly'
export type PeriodStatus = 'processing' | 'finalized'
export type WorkPackageStatus = 'on_going' | 'in_review' | 'completed' | 'rejected_archived'

export interface Project {
  id: string
  code: string
  name: string
  created_at: string
}

export interface Worker {
  id: string
  project_id: string
  worker_type: WorkerType
  name: string
  company: string | null
  trade_category: string | null
  created_at: string
}

export interface AttendanceRecord {
  id: string
  worker_id: string
  project_id: string
  date: string           // ISO date "YYYY-MM-DD"
  check_in: string | null
  check_out: string | null
  working_hours: number | null
  overtime_hours: number
  status: AttendanceStatus
  source: AttendanceSource
  period_type: PeriodType
  period_status: PeriodStatus
  created_at: string
}

export interface WorkPackage {
  id: string
  project_id: string
  package_code: string
  category: string | null
  subcategory: string | null
  sub_subcategory: string | null
  work_nature: string | null
  remark: string | null
  budget_amount: number | null
  actual_cost: number | null       // populated on completion; null while in progress
  physical_progress: number | null
  status: WorkPackageStatus
  location: string | null          // optional site location
  created_by_name: string | null   // display name (until auth is live)
  assigned_to_name: string | null  // display name (until auth is live)
  rejection_reason: string | null  // for rejected_archived status
  created_at: string
}

// ---------------------------------------------------------------------------
// Seeded pseudo-random — deterministic, stable across reloads
// FNV-1a hash → float [0, 1)
// ---------------------------------------------------------------------------
function seededRand(seed: string): number {
  let h = 2166136261
  for (let i = 0; i < seed.length; i++) {
    h = Math.imul(h ^ seed.charCodeAt(i), 16777619)
  }
  return ((h >>> 0) % 100000) / 100000
}

// ---------------------------------------------------------------------------
// Raw mock data — project & workers
// ---------------------------------------------------------------------------
const PROJECT_ID = 'bkt2sa-proj-0001-0000-000000000001'

export const MOCK_PROJECT: Project = {
  id: PROJECT_ID,
  code: 'BKT2SA',
  name: 'Bukit 2 Site A',
  created_at: '2024-10-01T08:00:00Z',
}

// Per-type hours bias — creates steep peaks/valleys on the headcount combo chart.
// Operators run heavy machinery (long shifts); subcon_as_gw are part-time on site.
const WORKER_TYPE_HRS_BIAS: Record<WorkerType, number> = {
  operator:       3.5,
  general_worker: 0.8,
  subcon:        -0.5,
  staff:         -2.5,
  subcon_as_gw:  -4.0,
}

const TRADE_CATEGORIES: Record<WorkerType, string[]> = {
  general_worker: ['Civil Works', 'Structural', 'Finishing', 'Excavation', 'Concrete'],
  staff:          ['Site Supervisor', 'QS Engineer', 'Safety Officer', 'Project Engineer'],
  subcon:         ['M&E Works', 'Plumbing', 'Roofing', 'Tiling', 'Painting'],
  operator:       ['Tower Crane', 'Excavator', 'Forklift', 'Concrete Pump'],
  subcon_as_gw:   ['Civil Works', 'Structural', 'Carpentry'],
}
const SUBCON_COMPANIES = [
  'Mutiara Jaya Sdn Bhd', 'Kota Bina Resources',
  'Prisma Maju Sdn Bhd',  'Alam Baru Construction',
]

function makeWorker(idx: number, type: WorkerType, name: string, company?: string): Worker {
  return {
    id: `worker-${String(idx).padStart(3, '0')}`,
    project_id: PROJECT_ID,
    worker_type: type,
    name,
    company: company ?? null,
    trade_category: TRADE_CATEGORIES[type][idx % TRADE_CATEGORIES[type].length],
    created_at: '2024-10-15T08:00:00Z',
  }
}

export const MOCK_WORKERS: Worker[] = [
  // General workers (17)
  makeWorker(1,  'general_worker', 'Ahmad Razif bin Kamal'),
  makeWorker(2,  'general_worker', 'Lim Ah Kow'),
  makeWorker(3,  'general_worker', 'Suresh a/l Krishnan'),
  makeWorker(4,  'general_worker', 'Mohd Faizal bin Othman'),
  makeWorker(5,  'general_worker', 'Rajan a/l Muthu'),
  makeWorker(6,  'general_worker', 'Bakri bin Saad'),
  makeWorker(7,  'general_worker', 'Tan Swee Lim'),
  makeWorker(8,  'general_worker', 'Zulkifli bin Hamid'),
  makeWorker(9,  'general_worker', 'Ganesh a/l Raman'),
  makeWorker(10, 'general_worker', 'Hairul bin Azmi'),
  makeWorker(11, 'general_worker', 'Saravanan a/l Kumar'),
  makeWorker(12, 'general_worker', 'Noor Azam bin Rashid'),
  makeWorker(13, 'general_worker', 'Chong Wei Ming'),
  makeWorker(14, 'general_worker', 'Mohamad Farid bin Alias'),
  makeWorker(15, 'general_worker', 'Selvam a/l Ponnusamy'),
  makeWorker(16, 'general_worker', 'Azri bin Latif'),
  makeWorker(17, 'general_worker', 'Ng Boon Keat'),
  // Subcon (13)
  makeWorker(18, 'subcon', 'Raziman bin Osman',     SUBCON_COMPANIES[0]),
  makeWorker(19, 'subcon', 'Lee Chee Wah',          SUBCON_COMPANIES[1]),
  makeWorker(20, 'subcon', 'Kumaresan a/l Samy',    SUBCON_COMPANIES[0]),
  makeWorker(21, 'subcon', 'Firdaus bin Rosli',     SUBCON_COMPANIES[2]),
  makeWorker(22, 'subcon', 'Tan Beng Huat',         SUBCON_COMPANIES[1]),
  makeWorker(23, 'subcon', 'Ariffin bin Md Salleh', SUBCON_COMPANIES[3]),
  makeWorker(24, 'subcon', 'Ravi a/l Gunasegaran',  SUBCON_COMPANIES[2]),
  makeWorker(25, 'subcon', 'Mohd Hafiz bin Ismail', SUBCON_COMPANIES[0]),
  makeWorker(26, 'subcon', 'Loh Chin Keong',        SUBCON_COMPANIES[3]),
  makeWorker(27, 'subcon', 'Shamsul bin Bakar',     SUBCON_COMPANIES[1]),
  makeWorker(28, 'subcon', 'Vijay a/l Devarajan',   SUBCON_COMPANIES[2]),
  makeWorker(29, 'subcon', 'Azwan bin Mansor',      SUBCON_COMPANIES[3]),
  makeWorker(30, 'subcon', 'Chia Kok Weng',         SUBCON_COMPANIES[0]),
  // Subcon as GW (6) — join mid-project (~day 56)
  makeWorker(31, 'subcon_as_gw', 'Norazam bin Talib',    SUBCON_COMPANIES[1]),
  makeWorker(32, 'subcon_as_gw', 'Heng Kim Swee',         SUBCON_COMPANIES[2]),
  makeWorker(33, 'subcon_as_gw', 'Periasamy a/l Durai',   SUBCON_COMPANIES[0]),
  makeWorker(34, 'subcon_as_gw', 'Effendi bin Yusoff',    SUBCON_COMPANIES[3]),
  makeWorker(35, 'subcon_as_gw', 'Lim Yew Heng',          SUBCON_COMPANIES[1]),
  makeWorker(36, 'subcon_as_gw', 'Karunakaran a/l Nair',  SUBCON_COMPANIES[2]),
  // Operators (4) — join late-project (~day 112)
  makeWorker(37, 'operator', 'Shahril bin Ramli'),
  makeWorker(38, 'operator', 'Chew Kin Hoe'),
  makeWorker(39, 'operator', 'Baharudin bin Musa'),
  makeWorker(40, 'operator', 'Gunalan a/l Suppiah'),
  // Staff (2) — join late-project (~day 112)
  makeWorker(41, 'staff', 'Nurul Ain binti Malik'),
  makeWorker(42, 'staff', 'Kevin Tan Yong Sheng'),
]

// Worker join day (days from data start). Workers not yet joined have no records.
function workerJoinDay(workerId: string): number {
  const idx = parseInt(workerId.replace('worker-', ''), 10)
  if (idx <= 30) return 0    // core crew — on site from day 1
  if (idx <= 36) return 56   // subcon_as_gw batch joins ~week 9 (Apr)
  return 112                  // operators + staff join ~week 17 (Jun)
}

// ---------------------------------------------------------------------------
// Attendance generation — 180 days, day-level variation baked in
// ---------------------------------------------------------------------------
const DAYS_OF_DATA = 180
export const REF_DATE = new Date('2025-08-15')  // "today" in mock world

function isoDate(d: Date): string {
  return d.toISOString().split('T')[0]
}

// Month-level OT probability curve (index = months since Feb 2025).
// Simulates a project ramp-up with peak in May–Jun, then tapering.
const OT_PROB_BY_MONTH = [
  0.10,  // Feb 2025 — project warming up
  0.16,  // Mar
  0.24,  // Apr — work picking up
  0.38,  // May — peak busy phase
  0.35,  // Jun — still very busy
  0.26,  // Jul — pressure easing
  0.18,  // Aug — current (most recent)
]

function periodOf(date: Date): { period_type: PeriodType; period_status: PeriodStatus } {
  const day      = date.getDate()
  const month    = date.getMonth()
  const refMonth = REF_DATE.getMonth()
  const refYear  = REF_DATE.getFullYear()
  const dYear    = date.getFullYear()

  const isCurrentPeriod =
    dYear === refYear && month === refMonth && day >= 16
  const period_type: PeriodType   = day <= 15 ? '1st_half' : '2nd_half'
  const period_status: PeriodStatus = isCurrentPeriod ? 'processing' : 'finalized'
  return { period_type, period_status }
}

function makeAttendance(): AttendanceRecord[] {
  const records: AttendanceRecord[] = []
  let recIdx = 0

  // d counts calendar days back from REF_DATE. daysFromStart = DAYS_OF_DATA-1-d.
  for (let d = DAYS_OF_DATA - 1; d >= 0; d--) {
    const dateObj = new Date(REF_DATE)
    dateObj.setDate(REF_DATE.getDate() - d)
    const dateStr      = isoDate(dateObj)
    const dow          = dateObj.getDay()
    const daysFromStart = DAYS_OF_DATA - 1 - d

    const isWeekend = dow === 0  // only Sunday is non-working; Saturday is a full working day

    const { period_type, period_status } = periodOf(dateObj)

    // ── Day-level parameters (seeded by date, stable across renders) ──────
    // Weekdays: 83–95% attendance (Monday –3% penalty).
    // Weekends: site is shut — zero workers on Saturday and Sunday.
    const mondayPenalty = dow === 1 ? 0.03 : 0
    const dayAttRate = isWeekend
      ? 0  // weekend → everyone absent
      : 0.83 + seededRand(dateStr + 'att') * 0.12 - mondayPenalty

    // ~8% of weekdays are "short days" (rain shutdown, inspection, half-day)
    // where the site clocks off early — average drops to 1–2.5 h
    const isShortDay = !isWeekend && seededRand(dateStr + 'short') < 0.08
    const dayHoursBase = isShortDay
      ? 0.8 + seededRand(dateStr + 'hrs') * 1.7   // 0.8–2.5 h
      : 6.0 + seededRand(dateStr + 'hrs') * 3.5   // 6.0–9.5 h

    // OT probability — interpolate from monthly curve + daily noise
    const monthsFromFeb = (dateObj.getFullYear() - 2025) * 12 + dateObj.getMonth() - 1
    const baseOtProb = OT_PROB_BY_MONTH[Math.max(0, Math.min(monthsFromFeb, 6))]
    const dayOtProb  = baseOtProb * (0.75 + seededRand(dateStr + 'ot2') * 0.50)

    // ── Per-worker records ─────────────────────────────────────────────────
    for (const worker of MOCK_WORKERS) {
      if (daysFromStart < workerJoinDay(worker.id)) continue  // not on site yet

      const seed  = `${worker.id}-${dateStr}`
      const r     = seededRand(seed)           // attendance roll for this worker
      const rType = seededRand(seed + 'type')  // present/late/early split
      const rSrc  = seededRand(seed + 'src')   // source device
      const rOt   = seededRand(seed + 'ot')    // OT hours amount
      const rHrs  = seededRand(seed + 'hrs')   // individual hours noise

      const actualPeriodType: PeriodType =
        worker.worker_type === 'subcon' ? 'monthly' : period_type

      // Attendance status: weekends are always absent; weekdays use day-level rate
      let status: AttendanceStatus
      if (isWeekend) {
        status = 'absent'
      } else {
        const effectiveRate = Math.min(0.97, Math.max(0.60, dayAttRate + (r - 0.5) * 0.08))
        if (r >= effectiveRate) {
          status = 'absent'
        } else if (rType > 0.94) {
          status = 'early_leave'
        } else if (rType > 0.82) {
          status = 'late'
        } else {
          status = 'present'
        }
      }

      const isAttending = status !== 'absent'

      // Worker personal tendency (±2h) + type-level bias for steep chart profile
      const workerHrsProfile = (seededRand(worker.id + 'hrs-profile') - 0.5) * 4.0
      const typeHrsBias      = WORKER_TYPE_HRS_BIAS[worker.worker_type]
      const working_hours = isAttending
        ? Math.max(2.0, Math.min(13.0, Math.round(
            (dayHoursBase + workerHrsProfile + typeHrsBias + (rHrs - 0.5) * 2.0
              - (status === 'late' ? 0.8 : 0)
              - (status === 'early_leave' ? 1.2 : 0)) * 100) / 100))
        : null

      // Overtime: probability driven by monthly OT curve + daily noise
      const hasOt = isAttending && rOt < dayOtProb
      const overtime_hours = hasOt ? Math.round((0.5 + rOt * 3.0) * 2) / 2 : 0

      // Source: rfid 65%, face_scan 25%, manual 10%
      const source: AttendanceSource =
        rSrc < 0.65 ? 'rfid' : rSrc < 0.90 ? 'face_scan' : 'manual'

      records.push({
        id: `att-${String(recIdx++).padStart(6, '0')}`,
        worker_id:     worker.id,
        project_id:    PROJECT_ID,
        date:          dateStr,
        check_in:      isAttending ? `07:${String(Math.floor(30 * r)).padStart(2, '0')}` : null,
        check_out:     isAttending ? `${16 + Math.floor(overtime_hours)}:${String(Math.floor(59 * rHrs)).padStart(2, '0')}` : null,
        working_hours,
        overtime_hours,
        status,
        source,
        period_type: actualPeriodType,
        period_status,
        created_at: `${dateStr}T20:00:00Z`,
      })
    }
  }

  return records
}

export const MOCK_ATTENDANCE: AttendanceRecord[] = makeAttendance()

// ---------------------------------------------------------------------------
// Work packages
// ---------------------------------------------------------------------------
export const MOCK_WORK_PACKAGES: WorkPackage[] = [
  // ── On Going ──────────────────────────────────────────────────────────────
  {
    id: 'wp-002', project_id: PROJECT_ID,
    package_code: 'WP-BKT2SA-002',
    category: 'Labour', subcategory: 'Safety Health & Environment', sub_subcategory: null,
    work_nature: 'Work On Behalf', remark: 'Safety officer deployment and daily toolbox briefings',
    budget_amount: 42000, actual_cost: null, physical_progress: 87, status: 'on_going',
    location: null,
    created_by_name: 'Kevin Tan Yong Sheng', assigned_to_name: 'Nurul Ain binti Malik',
    rejection_reason: null,
    created_at: '2024-10-22T08:00:00Z',
  },
  {
    id: 'wp-003', project_id: PROJECT_ID,
    package_code: 'WP-BKT2SA-003',
    category: 'Labour', subcategory: 'Structural', sub_subcategory: null,
    work_nature: 'Reinforced Concrete Works', remark: 'Basement slab pours — Levels B1 and B2',
    budget_amount: 310000, actual_cost: null, physical_progress: 62, status: 'on_going',
    location: 'Block B, Basement Level',
    created_by_name: 'Kevin Tan Yong Sheng', assigned_to_name: 'Shahril bin Ramli',
    rejection_reason: null,
    created_at: '2024-11-01T08:00:00Z',
  },
  {
    id: 'wp-006', project_id: PROJECT_ID,
    package_code: 'WP-BKT2SA-006',
    category: 'Labour', subcategory: 'M&E', sub_subcategory: 'Electrical',
    work_nature: 'Main Electrical Distribution', remark: null,
    budget_amount: 175000, actual_cost: null, physical_progress: 45, status: 'on_going',
    location: 'Block A, Electrical Riser',
    created_by_name: 'Kevin Tan Yong Sheng', assigned_to_name: 'Nurul Ain binti Malik',
    rejection_reason: null,
    created_at: '2024-11-15T08:00:00Z',
  },
  {
    id: 'wp-008', project_id: PROJECT_ID,
    package_code: 'WP-BKT2SA-008',
    category: 'Labour', subcategory: 'Structural', sub_subcategory: null,
    work_nature: 'Formwork Installation', remark: null,
    budget_amount: 140000, actual_cost: null, physical_progress: 71, status: 'on_going',
    location: null,
    created_by_name: 'Nurul Ain binti Malik', assigned_to_name: 'Shahril bin Ramli',
    rejection_reason: null,
    created_at: '2024-11-20T08:00:00Z',
  },
  {
    id: 'wp-011', project_id: PROJECT_ID,
    package_code: 'WP-BKT2SA-011',
    category: 'Labour', subcategory: 'Finishing', sub_subcategory: null,
    work_nature: 'Tiling Works', remark: 'Wet areas and common corridors — early mobilisation',
    budget_amount: 115000, actual_cost: null, physical_progress: 5, status: 'on_going',
    location: 'Block B, Level 2',
    created_by_name: 'Kevin Tan Yong Sheng', assigned_to_name: 'Nurul Ain binti Malik',
    rejection_reason: null,
    created_at: '2025-01-10T08:00:00Z',
  },
  // ── In Review ─────────────────────────────────────────────────────────────
  {
    id: 'wp-004', project_id: PROJECT_ID,
    package_code: 'WP-BKT2SA-004',
    category: 'Labour', subcategory: 'Finishing', sub_subcategory: null,
    work_nature: 'Plastering Works', remark: null,
    budget_amount: 95000, actual_cost: null, physical_progress: 38, status: 'in_review',
    location: null,
    created_by_name: 'Kevin Tan Yong Sheng', assigned_to_name: 'Shahril bin Ramli',
    rejection_reason: null,
    created_at: '2024-11-10T08:00:00Z',
  },
  {
    id: 'wp-009', project_id: PROJECT_ID,
    package_code: 'WP-BKT2SA-009',
    category: 'Labour', subcategory: 'Plumbing', sub_subcategory: null,
    work_nature: 'Internal Plumbing Rough-in', remark: null,
    budget_amount: 88000, actual_cost: null, physical_progress: 28, status: 'in_review',
    location: 'Block A, B, C (All Levels)',
    created_by_name: 'Nurul Ain binti Malik', assigned_to_name: 'Shahril bin Ramli',
    rejection_reason: null,
    created_at: '2024-12-01T08:00:00Z',
  },
  {
    id: 'wp-015', project_id: PROJECT_ID,
    package_code: 'WP-BKT2SA-015',
    category: 'Labour', subcategory: 'Finishing', sub_subcategory: null,
    work_nature: 'Painting Works', remark: 'Internal and external — awaiting QA sign-off',
    budget_amount: 95000, actual_cost: null, physical_progress: 92, status: 'in_review',
    location: null,
    created_by_name: 'Kevin Tan Yong Sheng', assigned_to_name: 'Nurul Ain binti Malik',
    rejection_reason: null,
    created_at: '2025-02-14T08:00:00Z',
  },
  // ── Completed ─────────────────────────────────────────────────────────────
  {
    id: 'wp-001', project_id: PROJECT_ID,
    package_code: 'KSK/BKT2SA/001',
    category: 'Labour', subcategory: 'Protection', sub_subcategory: null,
    work_nature: 'Site Preliminary Work', remark: 'Hoarding and fencing — full perimeter',
    budget_amount: 85000, actual_cost: 62000, physical_progress: 100, status: 'completed',
    location: 'Site Perimeter',
    created_by_name: 'Kevin Tan Yong Sheng', assigned_to_name: 'Shahril bin Ramli',
    rejection_reason: null,
    created_at: '2024-10-20T08:00:00Z',
  },
  {
    id: 'wp-005', project_id: PROJECT_ID,
    package_code: 'KSK/BKT2SA/005',
    category: 'Preliminary', subcategory: 'Earthworks', sub_subcategory: null,
    work_nature: 'Excavation & Backfill', remark: 'Phase 1 excavation complete; cut-to-fill balanced',
    budget_amount: 220000, actual_cost: 219200, physical_progress: 100, status: 'completed',
    location: 'Site Boundary',
    created_by_name: 'Kevin Tan Yong Sheng', assigned_to_name: 'Shahril bin Ramli',
    rejection_reason: null,
    created_at: '2024-10-15T08:00:00Z',
  },
  {
    id: 'wp-010', project_id: PROJECT_ID,
    package_code: 'KSK/BKT2SA/010',
    category: 'Preliminary', subcategory: 'Safety Health & Environment', sub_subcategory: null,
    work_nature: 'Site Hoarding Extension', remark: 'North perimeter extension — done ahead of schedule',
    budget_amount: 22000, actual_cost: 400, physical_progress: 100, status: 'completed',
    location: 'North Perimeter',
    created_by_name: 'Kevin Tan Yong Sheng', assigned_to_name: 'Nurul Ain binti Malik',
    rejection_reason: null,
    created_at: '2024-11-25T08:00:00Z',
  },
  {
    id: 'wp-013', project_id: PROJECT_ID,
    package_code: 'KSK/BKT2SA/013',
    category: 'Labour', subcategory: 'Structural', sub_subcategory: null,
    work_nature: 'Reinforced Concrete Works', remark: 'Ground floor slab — 28-day cube test passed',
    budget_amount: 180000, actual_cost: 162000, physical_progress: 100, status: 'completed',
    location: 'Block C, Ground Floor',
    created_by_name: 'Kevin Tan Yong Sheng', assigned_to_name: 'Shahril bin Ramli',
    rejection_reason: null,
    created_at: '2024-12-10T08:00:00Z',
  },
  {
    id: 'wp-014', project_id: PROJECT_ID,
    package_code: 'KSK/BKT2SA/014',
    category: 'Preliminary', subcategory: 'Earthworks', sub_subcategory: null,
    work_nature: 'Site Clearing', remark: 'Tree removal and vegetation clearance',
    budget_amount: 55000, actual_cost: 24000, physical_progress: 100, status: 'completed',
    location: null,
    created_by_name: 'Nurul Ain binti Malik', assigned_to_name: 'Shahril bin Ramli',
    rejection_reason: null,
    created_at: '2024-10-08T08:00:00Z',
  },
  // ── Rejected / Archived ───────────────────────────────────────────────────
  {
    id: 'wp-007', project_id: PROJECT_ID,
    package_code: 'WP-BKT2SA-007',
    category: 'Preliminary', subcategory: 'Protection', sub_subcategory: null,
    work_nature: 'Temporary Road Works', remark: 'Internal access road — stone base course',
    budget_amount: 38000, actual_cost: null, physical_progress: 15, status: 'rejected_archived',
    location: null,
    created_by_name: 'Kevin Tan Yong Sheng', assigned_to_name: 'Nurul Ain binti Malik',
    rejection_reason: 'Scope changed — temporary access road no longer required following site layout revision',
    created_at: '2024-11-05T08:00:00Z',
  },
  {
    id: 'wp-012', project_id: PROJECT_ID,
    package_code: 'KSK/BKT2SA/012',
    category: 'Labour', subcategory: 'Structural', sub_subcategory: null,
    work_nature: 'Steel Frame Erection', remark: null,
    budget_amount: 290000, actual_cost: null, physical_progress: 0, status: 'rejected_archived',
    location: null,
    created_by_name: 'Kevin Tan Yong Sheng', assigned_to_name: 'Shahril bin Ramli',
    rejection_reason: 'Subcontractor withdrew from project; scope reassigned to main contractor under revised contract',
    created_at: '2024-12-15T08:00:00Z',
  },
]

// ---------------------------------------------------------------------------
// Selector: Work packages
// ---------------------------------------------------------------------------
export function getWorkPackages(_projectId: string): WorkPackage[] {
  return MOCK_WORK_PACKAGES
}

// ---------------------------------------------------------------------------
// Helpers shared by selectors
// ---------------------------------------------------------------------------
const TODAY_STR = isoDate(REF_DATE)

function getLatestWorkday(): string {
  for (let offset = 0; offset < 7; offset++) {
    const d = new Date(REF_DATE)
    d.setDate(REF_DATE.getDate() - offset)
    if (d.getDay() !== 0) return isoDate(d)  // only skip Sundays
  }
  return TODAY_STR
}
const LATEST_WORKDAY = getLatestWorkday()

// Cut-off date for the daily trend window (last 30 calendar days)
const DAILY_CUTOFF = (() => {
  const d = new Date(REF_DATE)
  d.setDate(d.getDate() - 30)
  return isoDate(d)
})()

// ---------------------------------------------------------------------------
// Selector: Workforce KPIs
// ---------------------------------------------------------------------------
export interface WorkforceKPIs {
  totalWorkers: number
  activeToday: number
  attendanceRate: number
  absenteeismRate: number
  overtimeHours: number
}

export function getWorkforceKPIs(_projectId: string): WorkforceKPIs {
  const todayRecs = MOCK_ATTENDANCE.filter(a => a.date === LATEST_WORKDAY)
  const present   = todayRecs.filter(a => a.status !== 'absent').length
  const absent    = todayRecs.filter(a => a.status === 'absent').length
  const total     = todayRecs.length || MOCK_WORKERS.length

  const cutoff7d  = isoDate(new Date(REF_DATE.getTime() - 7 * 86400000))
  const totalOT   = MOCK_ATTENDANCE
    .filter(a => a.date >= cutoff7d)
    .reduce((s, a) => s + a.overtime_hours, 0)

  return {
    totalWorkers:    MOCK_WORKERS.length,
    activeToday:     present,
    attendanceRate:  total > 0 ? Math.round((present / total) * 1000) / 10 : 0,
    absenteeismRate: total > 0 ? Math.round((absent  / total) * 1000) / 10 : 0,
    overtimeHours:   Math.round(totalOT * 10) / 10,
  }
}

// ---------------------------------------------------------------------------
// Selector: Headcount by worker type
// ---------------------------------------------------------------------------
export interface HeadcountDataPoint {
  workerType: WorkerType
  label: string
  headcount: number
  workingHours: number
}

export const WORKER_TYPE_LABELS: Record<WorkerType, string> = {
  general_worker: 'General Worker',
  staff:          'Staff',
  subcon:         'Subcon',
  operator:       'Operator',
  subcon_as_gw:   'Subcon As GW',
}

export function getHeadcountByWorkerType(_projectId: string): HeadcountDataPoint[] {
  const types: WorkerType[] = ['general_worker', 'subcon', 'subcon_as_gw', 'operator', 'staff']
  const cutoff7d = isoDate(new Date(REF_DATE.getTime() - 7 * 86400000))

  return types.map(type => {
    const workers    = MOCK_WORKERS.filter(w => w.worker_type === type)
    const workerIds  = new Set(workers.map(w => w.id))
    const recent     = MOCK_ATTENDANCE.filter(a => workerIds.has(a.worker_id) && a.date >= cutoff7d)
    const withHours  = recent.filter(a => a.working_hours !== null)
    const avgHours   = withHours.length > 0
      ? withHours.reduce((s, a) => s + (a.working_hours ?? 0), 0) / withHours.length
      : 0
    return {
      workerType:   type,
      label:        WORKER_TYPE_LABELS[type],
      headcount:    workers.length,
      workingHours: Math.round(avgHours * 10) / 10,
    }
  })
}

// ---------------------------------------------------------------------------
// Selector: Today's attendance
// ---------------------------------------------------------------------------
export interface TodaysAttendance {
  present: number
  absent: number
  late: number
  earlyLeave: number
  total: number
  rate: number
  periodStatus: PeriodStatus
}

export function getTodaysAttendance(_projectId: string): TodaysAttendance {
  const recs      = MOCK_ATTENDANCE.filter(a => a.date === LATEST_WORKDAY)
  const present   = recs.filter(a => a.status === 'present').length
  const absent    = recs.filter(a => a.status === 'absent').length
  const late      = recs.filter(a => a.status === 'late').length
  const earlyLeave = recs.filter(a => a.status === 'early_leave').length
  const total     = recs.length
  const attending = present + late + earlyLeave

  return {
    present, absent, late, earlyLeave, total,
    rate:         total > 0 ? Math.round((attending / total) * 1000) / 10 : 0,
    periodStatus: recs[0]?.period_status ?? 'processing',
  }
}

// ---------------------------------------------------------------------------
// Trend helpers
// ---------------------------------------------------------------------------
export type Granularity = 'daily' | 'weekly' | 'monthly'

export interface TrendPoint {
  label: string
  value: number
}

function bucketKey(rec: AttendanceRecord, granularity: Granularity): string {
  const d = new Date(rec.date)
  if (granularity === 'daily') return rec.date
  if (granularity === 'weekly') {
    // Monday-based ISO week start
    const dow    = d.getDay() === 0 ? 7 : d.getDay()
    const monday = new Date(d)
    monday.setDate(d.getDate() - (dow - 1))
    return isoDate(monday)           // raw "YYYY-MM-DD" used as stable sort key
  }
  // monthly
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
}

const DAY_ABBR = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

function formatLabel(key: string, granularity: Granularity): string {
  if (granularity === 'daily') {
    const d = new Date(key + 'T00:00:00')  // force local parse
    return `${DAY_ABBR[d.getDay()]} ${String(d.getDate()).padStart(2, '0')}`
  }
  if (granularity === 'weekly') {
    // key is "YYYY-MM-DD" of Monday — format as "17 Feb"
    const d = new Date(key + 'T00:00:00')
    return d.toLocaleDateString('en-MY', { day: 'numeric', month: 'short' })
  }
  // monthly: "YYYY-MM" → "Feb '25"
  const [y, m] = key.split('-')
  const d = new Date(Number(y), Number(m) - 1)
  return d.toLocaleDateString('en-MY', { month: 'short', year: '2-digit' })
}

/** Group attendance records into sorted buckets for the given granularity.
 *  Daily view is windowed to the last 30 calendar days to keep the axis readable;
 *  weekly and monthly use the full 180-day history. */
function buildBuckets(granularity: Granularity): Map<string, AttendanceRecord[]> {
  const bucket = new Map<string, AttendanceRecord[]>()

  for (const rec of MOCK_ATTENDANCE) {
    // Window: daily → last 30 days only
    if (granularity === 'daily' && rec.date < DAILY_CUTOFF) continue

    const key = bucketKey(rec, granularity)
    if (!bucket.has(key)) bucket.set(key, [])
    bucket.get(key)!.push(rec)
  }

  // Return in chronological order (Map preserves insertion; records are oldest-first)
  return bucket
}

// ---------------------------------------------------------------------------
// Selector: Attendance trend (rate % per bucket)
// ---------------------------------------------------------------------------
export function getAttendanceTrend(_projectId: string, granularity: Granularity): TrendPoint[] {
  return [...buildBuckets(granularity).entries()].map(([key, recs]) => {
    const present = recs.filter(r => r.status !== 'absent').length
    const rate    = recs.length > 0 ? Math.round((present / recs.length) * 1000) / 10 : 0
    return { label: formatLabel(key, granularity), value: rate }
  })
}

// ---------------------------------------------------------------------------
// Selector: Working hours trend (avg hours per bucket)
// ---------------------------------------------------------------------------
export function getWorkingHoursTrend(_projectId: string, granularity: Granularity): TrendPoint[] {
  return [...buildBuckets(granularity).entries()].map(([key, recs]) => {
    const withHours = recs.filter(r => r.working_hours !== null)
    const avg = withHours.length > 0
      ? withHours.reduce((s, r) => s + (r.working_hours ?? 0), 0) / withHours.length
      : 0
    return { label: formatLabel(key, granularity), value: Math.round(avg * 10) / 10 }
  })
}

// ---------------------------------------------------------------------------
// Selector: Overtime trend (total OT hours per bucket)
// ---------------------------------------------------------------------------
export function getOvertimeTrend(_projectId: string, granularity: Granularity): TrendPoint[] {
  return [...buildBuckets(granularity).entries()].map(([key, recs]) => {
    const total = recs.reduce((s, r) => s + r.overtime_hours, 0)
    return { label: formatLabel(key, granularity), value: Math.round(total * 10) / 10 }
  })
}

// ---------------------------------------------------------------------------
// Selector: Manpower trend (avg unique workers PRESENT per day in each bucket)
// Using per-day unique count then averaging avoids the "count who appeared at
// least once this week" inflated number that the naive Set approach gives.
// ---------------------------------------------------------------------------
export function getManpowerTrend(_projectId: string, granularity: Granularity): TrendPoint[] {
  return [...buildBuckets(granularity).entries()].map(([key, recs]) => {
    // Group by date within this bucket
    const byDay = new Map<string, Set<string>>()
    for (const r of recs) {
      if (r.status === 'absent') continue
      if (!byDay.has(r.date)) byDay.set(r.date, new Set())
      byDay.get(r.date)!.add(r.worker_id)
    }
    const avgPresent = byDay.size > 0
      ? [...byDay.values()].reduce((s, s2) => s + s2.size, 0) / byDay.size
      : 0
    return { label: formatLabel(key, granularity), value: Math.round(avgPresent) }
  })
}

// ---------------------------------------------------------------------------
// Selector: Attendance by worker type (for the latest workday)
// ---------------------------------------------------------------------------
export interface AttendanceByTypeRow {
  workerType: WorkerType
  label: string
  total: number
  present: number
  late: number
  earlyLeave: number
  absent: number
  rate: number
  avgHours: number
}

export function getAttendanceByWorkerType(_projectId: string): AttendanceByTypeRow[] {
  const types: WorkerType[] = ['general_worker', 'subcon', 'subcon_as_gw', 'operator', 'staff']
  const recs = MOCK_ATTENDANCE.filter(a => a.date === LATEST_WORKDAY)
  const workerMap = new Map(MOCK_WORKERS.map(w => [w.id, w]))

  return types.map(type => {
    const typeRecs = recs.filter(r => workerMap.get(r.worker_id)?.worker_type === type)
    const present    = typeRecs.filter(r => r.status === 'present').length
    const late       = typeRecs.filter(r => r.status === 'late').length
    const earlyLeave = typeRecs.filter(r => r.status === 'early_leave').length
    const absent     = typeRecs.filter(r => r.status === 'absent').length
    const attending  = present + late + earlyLeave
    const withHours  = typeRecs.filter(r => r.working_hours !== null)
    const avgHours   = withHours.length > 0
      ? withHours.reduce((s, r) => s + (r.working_hours ?? 0), 0) / withHours.length
      : 0
    return {
      workerType: type,
      label: WORKER_TYPE_LABELS[type],
      total: typeRecs.length,
      present, late, earlyLeave, absent,
      rate: typeRecs.length > 0 ? Math.round((attending / typeRecs.length) * 1000) / 10 : 0,
      avgHours: Math.round(avgHours * 10) / 10,
    }
  }).filter(r => r.total > 0)
}

// ---------------------------------------------------------------------------
// Selector: Per-worker daily attendance records (joined with worker info)
// ---------------------------------------------------------------------------
export interface DailyWorkerRecord {
  workerId: string
  name: string
  workerType: WorkerType
  company: string | null
  tradeCategory: string | null
  status: AttendanceStatus
  source: AttendanceSource
  checkIn: string | null
  checkOut: string | null
  workingHours: number | null
  overtimeHours: number
  periodType: PeriodType
  periodStatus: PeriodStatus
}

export function getDailyWorkerRecords(_projectId: string, date?: string): DailyWorkerRecord[] {
  const targetDate = date ?? LATEST_WORKDAY
  const recs = MOCK_ATTENDANCE.filter(a => a.date === targetDate)
  const workerMap = new Map(MOCK_WORKERS.map(w => [w.id, w]))

  return recs
    .map(r => {
      const w = workerMap.get(r.worker_id)
      if (!w) return null
      return {
        workerId:     w.id,
        name:         w.name,
        workerType:   w.worker_type,
        company:      w.company,
        tradeCategory: w.trade_category,
        status:       r.status,
        source:       r.source,
        checkIn:      r.check_in,
        checkOut:     r.check_out,
        workingHours: r.working_hours,
        overtimeHours: r.overtime_hours,
        periodType:   r.period_type,
        periodStatus: r.period_status,
      } satisfies DailyWorkerRecord
    })
    .filter((r): r is DailyWorkerRecord => r !== null)
    .sort((a, b) => a.name.localeCompare(b.name))
}

// ---------------------------------------------------------------------------
// Helpers shared by attendance-module selectors
// ---------------------------------------------------------------------------
const MONTH_NAMES_SHORT = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
const DAY_NAMES_FULL    = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday']

export const HOURLY_RATES: Record<WorkerType, number> = {
  general_worker: 10,
  staff:          35,
  subcon:         18,
  operator:       22,
  subcon_as_gw:   12,
}

function daysInMonth(year: number, month: number): number {
  return new Date(year, month, 0).getDate()
}

function formatDateRangeLabel(startDay: number, endDay: number, month: number, year: number): string {
  const m = MONTH_NAMES_SHORT[month - 1]
  return `${String(startDay).padStart(2, '0')} ${m} – ${String(endDay).padStart(2, '0')} ${m} ${year}`
}

// ---------------------------------------------------------------------------
// Selector: Attendance periods (Tab A — Search/Amend)
// ---------------------------------------------------------------------------
export interface AttendancePeriod {
  id: string                 // "workerType__year__month__periodType"
  workerType: WorkerType
  workerTypeLabel: string
  periodType: PeriodType
  year: number
  month: number
  dateRangeStart: string     // "YYYY-MM-DD"
  dateRangeEnd: string       // "YYYY-MM-DD"
  dateRangeLabel: string     // "01 Aug – 15 Aug 2025"
  expiredDate: string        // "22 Aug 2025"
  status: PeriodStatus
  workerCount: number
}

export function getAttendancePeriods(
  _projectId: string,
  filters?: { workerType?: WorkerType | 'all'; status?: PeriodStatus | 'all'; month?: string }
): AttendancePeriod[] {
  const workerTypeMap = new Map(MOCK_WORKERS.map(w => [w.id, w.worker_type]))

  const groups = new Map<string, { status: PeriodStatus; workers: Set<string> }>()

  for (const rec of MOCK_ATTENDANCE) {
    const workerType = workerTypeMap.get(rec.worker_id)
    if (!workerType) continue
    const d = new Date(rec.date + 'T00:00:00')
    const year  = d.getFullYear()
    const month = d.getMonth() + 1
    const key   = `${workerType}__${year}__${month}__${rec.period_type}`

    if (!groups.has(key)) groups.set(key, { status: 'finalized', workers: new Set() })
    const g = groups.get(key)!
    g.workers.add(rec.worker_id)
    if (rec.period_status === 'processing') g.status = 'processing'
  }

  const periods: AttendancePeriod[] = []
  for (const [key, g] of groups.entries()) {
    const parts      = key.split('__')
    const workerType = parts[0] as WorkerType
    const year       = parseInt(parts[1])
    const month      = parseInt(parts[2])
    const periodType = parts[3] as PeriodType

    const lastDay = daysInMonth(year, month)
    let startDay: number, endDay: number
    if (periodType === '1st_half')  { startDay = 1;  endDay = 15 }
    else if (periodType === '2nd_half') { startDay = 16; endDay = lastDay }
    else                            { startDay = 1;  endDay = lastDay }

    const mm = String(month).padStart(2, '0')
    const expiry = new Date(`${year}-${mm}-${String(endDay).padStart(2, '0')}T00:00:00`)
    expiry.setDate(expiry.getDate() + 7)
    const expiredDate = `${String(expiry.getDate()).padStart(2,'0')} ${MONTH_NAMES_SHORT[expiry.getMonth()]} ${expiry.getFullYear()}`

    periods.push({
      id: key,
      workerType,
      workerTypeLabel: WORKER_TYPE_LABELS[workerType],
      periodType,
      year, month,
      dateRangeStart: `${year}-${mm}-${String(startDay).padStart(2, '0')}`,
      dateRangeEnd:   `${year}-${mm}-${String(endDay).padStart(2, '0')}`,
      dateRangeLabel: formatDateRangeLabel(startDay, endDay, month, year),
      expiredDate,
      status: g.status,
      workerCount: g.workers.size,
    })
  }

  let result = periods
  if (filters?.workerType && filters.workerType !== 'all') {
    result = result.filter(p => p.workerType === filters.workerType)
  }
  if (filters?.status && filters.status !== 'all') {
    result = result.filter(p => p.status === filters.status)
  }
  if (filters?.month) {
    const [fy, fm] = filters.month.split('-').map(Number)
    result = result.filter(p => p.year === fy && p.month === fm)
  }

  const ptOrder: Record<PeriodType, number> = { '1st_half': 0, '2nd_half': 1, 'monthly': 0 }
  result.sort((a, b) => {
    if (b.year  !== a.year)  return b.year  - a.year
    if (b.month !== a.month) return b.month - a.month
    return ptOrder[a.periodType] - ptOrder[b.periodType]
  })

  return result
}

// ---------------------------------------------------------------------------
// Selector: Personal daily attendance (Tab B — Personal Dashboard)
// ---------------------------------------------------------------------------
export interface PersonalDailyRecord {
  date: string
  dayName: string                          // "Monday"
  dayOfMonth: number
  isSunday: boolean
  checkIn: string | null
  checkOut: string | null
  workingHours: number | null
  lateIn: string | null                    // e.g. "30 min"
  otEligible: number
  status: AttendanceStatus | 'non_working'
  periodStatus: PeriodStatus | null
}

export function getPersonalAttendance(
  workerId: string,
  month: number,
  year: number,
): PersonalDailyRecord[] {
  const count  = daysInMonth(year, month)
  const mm     = String(month).padStart(2, '0')
  const prefix = `${year}-${mm}`

  const workerRecs = MOCK_ATTENDANCE.filter(r => r.worker_id === workerId && r.date.startsWith(prefix))
  const byDate     = new Map(workerRecs.map(r => [r.date, r]))

  const result: PersonalDailyRecord[] = []
  for (let day = 1; day <= count; day++) {
    const dateStr = `${prefix}-${String(day).padStart(2, '0')}`
    const d       = new Date(dateStr + 'T00:00:00')
    const dow     = d.getDay()
    const isSunday = dow === 0

    if (isSunday) {
      result.push({
        date: dateStr, dayName: 'Sunday', dayOfMonth: day,
        isSunday: true, checkIn: null, checkOut: null,
        workingHours: null, lateIn: null, otEligible: 0,
        status: 'non_working', periodStatus: null,
      })
      continue
    }

    const rec = byDate.get(dateStr)
    if (!rec) {
      result.push({
        date: dateStr, dayName: DAY_NAMES_FULL[dow], dayOfMonth: day,
        isSunday: false, checkIn: null, checkOut: null,
        workingHours: null, lateIn: null, otEligible: 0,
        status: 'absent', periodStatus: null,
      })
      continue
    }

    let lateIn: string | null = null
    if (rec.status === 'late' && rec.check_in) {
      const [h, m] = rec.check_in.split(':').map(Number)
      const minsLate = Math.max(0, (h * 60 + m) - (7 * 60 + 30))
      if (minsLate > 0) lateIn = `${minsLate} min`
    }

    result.push({
      date: dateStr, dayName: DAY_NAMES_FULL[dow], dayOfMonth: day,
      isSunday: false, checkIn: rec.check_in, checkOut: rec.check_out,
      workingHours: rec.working_hours, lateIn,
      otEligible: rec.overtime_hours,
      status: rec.status, periodStatus: rec.period_status,
    })
  }
  return result
}

export function countWorkingDaysInMonth(month: number, year: number): number {
  const count = daysInMonth(year, month)
  let working = 0
  for (let day = 1; day <= count; day++) {
    if (new Date(year, month - 1, day).getDay() !== 0) working++
  }
  return working
}

// ---------------------------------------------------------------------------
// Selector: Attendance summary (detail view)
// ---------------------------------------------------------------------------
export interface AttendanceSummaryData {
  periodId: string
  workerType: WorkerType
  workerTypeLabel: string
  periodType: PeriodType
  dateRangeLabel: string
  status: PeriodStatus
  source: AttendanceSource
  totalHeadcount: number
  totalHeadcountPrev: number
  totalPayment: number
  totalPaymentPrev: number
  totalBackcharge: number
  totalBackchargePrev: number
  employeesYetToSubmit: number
}

export function getAttendanceSummary(
  periodId: string,
  source: AttendanceSource,
): AttendanceSummaryData | null {
  const parts = periodId.split('__')
  if (parts.length < 4) return null

  const workerType = parts[0] as WorkerType
  const year       = parseInt(parts[1])
  const month      = parseInt(parts[2])
  const periodType = parts[3] as PeriodType

  const lastDay = daysInMonth(year, month)
  let startDay: number, endDay: number
  if (periodType === '1st_half')      { startDay = 1;  endDay = 15 }
  else if (periodType === '2nd_half') { startDay = 16; endDay = lastDay }
  else                                { startDay = 1;  endDay = lastDay }

  const mm        = String(month).padStart(2, '0')
  const dateStart = `${year}-${mm}-${String(startDay).padStart(2, '0')}`
  const dateEnd   = `${year}-${mm}-${String(endDay).padStart(2, '0')}`

  const typeWorkers    = MOCK_WORKERS.filter(w => w.worker_type === workerType)
  const typeWorkerIds  = new Set(typeWorkers.map(w => w.id))
  const rate           = HOURLY_RATES[workerType]
  const bcRate         = workerType === 'subcon' ? 0.12 : workerType === 'subcon_as_gw' ? 0.10 : 0.05

  function calcKPIs(recs: AttendanceRecord[]) {
    const headcount  = new Set(recs.map(r => r.worker_id)).size
    const totalHours = recs
      .filter(r => r.status !== 'absent' && r.working_hours !== null)
      .reduce((s, r) => s + (r.working_hours ?? 0), 0)
    const payment    = Math.round(totalHours * rate)
    const backcharge = Math.round(payment * bcRate)
    return { headcount, payment, backcharge }
  }

  const currRecs = MOCK_ATTENDANCE.filter(r =>
    typeWorkerIds.has(r.worker_id) && r.date >= dateStart && r.date <= dateEnd && r.source === source
  )
  const curr = calcKPIs(currRecs)

  // Previous period
  let prevYear = year, prevMonth = month, prevPT: PeriodType
  if (periodType === '2nd_half') {
    prevPT = '1st_half'
  } else {
    prevMonth = month === 1 ? 12 : month - 1
    prevYear  = month === 1 ? year - 1 : year
    prevPT    = periodType === 'monthly' ? 'monthly' : '2nd_half'
  }
  const prevLastDay = daysInMonth(prevYear, prevMonth)
  let prevStart: number, prevEnd: number
  if (prevPT === '1st_half')      { prevStart = 1;  prevEnd = 15 }
  else if (prevPT === '2nd_half') { prevStart = 16; prevEnd = prevLastDay }
  else                            { prevStart = 1;  prevEnd = prevLastDay }

  const pmm          = String(prevMonth).padStart(2, '0')
  const prevDateStart = `${prevYear}-${pmm}-${String(prevStart).padStart(2, '0')}`
  const prevDateEnd   = `${prevYear}-${pmm}-${String(prevEnd).padStart(2, '0')}`

  const prevRecs = MOCK_ATTENDANCE.filter(r =>
    typeWorkerIds.has(r.worker_id) && r.date >= prevDateStart && r.date <= prevDateEnd && r.source === source
  )
  const prev = calcKPIs(prevRecs)

  const status: PeriodStatus = currRecs.some(r => r.period_status === 'processing')
    ? 'processing' : 'finalized'

  const workerIdsWithRecs      = new Set(currRecs.map(r => r.worker_id))
  const employeesYetToSubmit   = typeWorkers.filter(w => !workerIdsWithRecs.has(w.id)).length

  return {
    periodId, workerType,
    workerTypeLabel: WORKER_TYPE_LABELS[workerType],
    periodType,
    dateRangeLabel: formatDateRangeLabel(startDay, endDay, month, year),
    status, source,
    totalHeadcount:      curr.headcount,
    totalHeadcountPrev:  prev.headcount,
    totalPayment:        curr.payment,
    totalPaymentPrev:    prev.payment,
    totalBackcharge:     curr.backcharge,
    totalBackchargePrev: prev.backcharge,
    employeesYetToSubmit,
  }
}

// ---------------------------------------------------------------------------
// Productivity scoring selectors
// Computed from attendance records — no raw "productivity" table.
// Score = attRate × punctuality × hoursScore × 100 (multiplicative: all
// three components must be high to achieve a high score).
// ---------------------------------------------------------------------------
export type ProductivityBand = 'high' | 'normal' | 'attention'

export interface WorkerProductivityScore {
  workerId:      string
  name:          string
  workerType:    WorkerType
  tradeCategory: string | null
  score:         number           // 0–100 utilisation score
  band:          ProductivityBand
  trendDelta:    number           // score change vs previous 30-day window (positive = improved)
}

export interface ProductivityByTypeRow {
  workerType: WorkerType
  label:      string
  avgScore:   number
}

export interface WPAttentionItem {
  packageCode:    string
  category:       string | null
  subcategory:    string | null
  attentionCount: number
  totalAssigned:  number
  pct:            number
}

function scoreBand(score: number): ProductivityBand {
  if (score >= 90) return 'high'
  if (score >= 70) return 'normal'
  return 'attention'
}

// Expected daily hours for score normalisation.
// Set at 9h to reflect actual site norms (operators, GW run long shifts).
const EXPECTED_DAILY_HOURS = 9
const PROD_WINDOW_DAYS     = 30

// Current window: last 30 days.  Previous: 30–60 days ago.
const PROD_CURRENT_END   = TODAY_STR
const PROD_CURRENT_START = isoDate(new Date(REF_DATE.getTime() - PROD_WINDOW_DAYS * 86_400_000))
const PROD_PREV_START    = isoDate(new Date(REF_DATE.getTime() - 2 * PROD_WINDOW_DAYS * 86_400_000))
const PROD_PREV_END      = isoDate(
  new Date(new Date(PROD_CURRENT_START + 'T00:00:00').getTime() - 86_400_000)
)

function computeScore(
  workerRecs: AttendanceRecord[],
  dateStart:  string,
  dateEnd:    string,
): number {
  const inWindow = workerRecs.filter(r => r.date >= dateStart && r.date <= dateEnd)
  // Only count Mon–Sat (Sundays are always absent; excluding them makes attRate meaningful)
  const workday  = inWindow.filter(r => new Date(r.date + 'T00:00:00').getDay() !== 0)
  if (workday.length === 0) return 0

  const present     = workday.filter(r => r.status !== 'absent')
  const attRate     = present.length / workday.length

  const lateOrEarly = workday.filter(r => r.status === 'late' || r.status === 'early_leave').length
  const punctuality = present.length > 0
    ? 1 - (lateOrEarly / present.length) * 0.5
    : 1

  const withHours  = present.filter(r => r.working_hours !== null)
  const avgHours   = withHours.length > 0
    ? withHours.reduce((s, r) => s + (r.working_hours ?? 0), 0) / withHours.length
    : 0
  const hoursScore = Math.min(1, avgHours / EXPECTED_DAILY_HOURS)

  return Math.round(attRate * punctuality * hoursScore * 100)
}

let _prodScoreCache: WorkerProductivityScore[] | null = null

function buildProductivityScores(): WorkerProductivityScore[] {
  if (_prodScoreCache) return _prodScoreCache

  const byWorker = new Map<string, AttendanceRecord[]>()
  for (const rec of MOCK_ATTENDANCE) {
    if (!byWorker.has(rec.worker_id)) byWorker.set(rec.worker_id, [])
    byWorker.get(rec.worker_id)!.push(rec)
  }

  _prodScoreCache = MOCK_WORKERS.map(w => {
    const recs  = byWorker.get(w.id) ?? []
    const score = computeScore(recs, PROD_CURRENT_START, PROD_CURRENT_END)
    const prev  = computeScore(recs, PROD_PREV_START, PROD_PREV_END)
    return {
      workerId:      w.id,
      name:          w.name,
      workerType:    w.worker_type,
      tradeCategory: w.trade_category,
      score,
      band:          scoreBand(score),
      trendDelta:    score - prev,
    }
  })

  return _prodScoreCache
}

export function getProductivityScores(_projectId: string): WorkerProductivityScore[] {
  return buildProductivityScores()
}

export function getProductivityByWorkerType(_projectId: string): ProductivityByTypeRow[] {
  const scores = buildProductivityScores()
  const types: WorkerType[] = ['general_worker', 'subcon', 'subcon_as_gw', 'operator', 'staff']
  return types.map(type => {
    const group = scores.filter(s => s.workerType === type)
    const avg   = group.length > 0
      ? Math.round(group.reduce((s, r) => s + r.score, 0) / group.length)
      : 0
    return { workerType: type, label: WORKER_TYPE_LABELS[type], avgScore: avg }
  })
}

export function getProductivityTrend(_projectId: string, granularity: Granularity): TrendPoint[] {
  return [...buildBuckets(granularity).entries()].map(([key, recs]) => {
    const workday = recs.filter(r => new Date(r.date + 'T00:00:00').getDay() !== 0)
    if (workday.length === 0) return { label: formatLabel(key, granularity), value: 0 }

    const present     = workday.filter(r => r.status !== 'absent')
    const attRate     = present.length / workday.length
    const lateOrEarly = workday.filter(r => r.status === 'late' || r.status === 'early_leave').length
    const punctuality = present.length > 0 ? 1 - (lateOrEarly / present.length) * 0.5 : 1
    const withHours   = present.filter(r => r.working_hours !== null)
    const avgHours    = withHours.length > 0
      ? withHours.reduce((s, r) => s + (r.working_hours ?? 0), 0) / withHours.length
      : 0
    const hoursScore  = Math.min(1, avgHours / EXPECTED_DAILY_HOURS)
    const score       = Math.round(attRate * punctuality * hoursScore * 100)
    return { label: formatLabel(key, granularity), value: score }
  })
}

// Maps WP subcategory → trade categories that typically staff it.
const WP_TRADE_MAP: Partial<Record<string, string[]>> = {
  'Structural':                  ['Structural', 'Civil Works', 'Excavation', 'Concrete', 'Carpentry'],
  'Finishing':                   ['Finishing', 'Tiling', 'Painting'],
  'Safety Health & Environment': ['Safety Officer', 'Site Supervisor'],
  'M&E':                         ['M&E Works', 'Plumbing'],
  'Plumbing':                    ['Plumbing'],
  'Earthworks':                  ['Excavation', 'Civil Works'],
  'Protection':                  ['Civil Works', 'Structural'],
}

export function getWPAttentionList(_projectId: string): WPAttentionItem[] {
  const scores   = buildProductivityScores()
  const activeWPs = MOCK_WORK_PACKAGES.filter(
    wp => wp.status === 'on_going' || wp.status === 'in_review'
  )

  return activeWPs.flatMap(wp => {
    const trades   = WP_TRADE_MAP[wp.subcategory ?? ''] ?? []
    if (trades.length === 0) return []

    const assigned = scores.filter(s => trades.includes(s.tradeCategory ?? ''))
    if (assigned.length === 0) return []

    const attn = assigned.filter(s => s.band === 'attention').length
    if (attn === 0) return []

    return [{
      packageCode:    wp.package_code,
      category:       wp.category,
      subcategory:    wp.subcategory,
      attentionCount: attn,
      totalAssigned:  assigned.length,
      pct:            Math.round((attn / assigned.length) * 100),
    } satisfies WPAttentionItem]
  }).sort((a, b) => b.pct - a.pct)
}
