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
  physical_progress: number | null
  status: WorkPackageStatus
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

    const isWeekend = dow === 0 || dow === 6

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

      // Each worker has a stable personal tendency (±2h) seeded by their ID
      const workerHrsProfile = (seededRand(worker.id + 'hrs-profile') - 0.5) * 4.0
      // Plus a per-day individual noise (±1h)
      const working_hours = isAttending
        ? Math.max(3.0, Math.min(12.0, Math.round(
            (dayHoursBase + workerHrsProfile + (rHrs - 0.5) * 2.0
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
// Work packages (unchanged)
// ---------------------------------------------------------------------------
export const MOCK_WORK_PACKAGES: WorkPackage[] = [
  {
    id: 'wp-001', project_id: PROJECT_ID,
    package_code: 'WP-BKT2SA-001',
    category: 'Labour', subcategory: 'Protection', sub_subcategory: null,
    work_nature: 'Site Preliminary Work', remark: 'Hoarding and fencing',
    budget_amount: 85000, physical_progress: 100, status: 'completed',
    created_at: '2024-10-20T08:00:00Z',
  },
  {
    id: 'wp-002', project_id: PROJECT_ID,
    package_code: 'WP-BKT2SA-002',
    category: 'Labour', subcategory: 'Safety Health & Environment', sub_subcategory: null,
    work_nature: 'Work On Behalf', remark: 'Safety officer deployment',
    budget_amount: 42000, physical_progress: 87, status: 'on_going',
    created_at: '2024-10-22T08:00:00Z',
  },
  {
    id: 'wp-003', project_id: PROJECT_ID,
    package_code: 'WP-BKT2SA-003',
    category: 'Labour', subcategory: 'Structural', sub_subcategory: null,
    work_nature: 'Reinforced Concrete Works', remark: 'Basement slab pours',
    budget_amount: 310000, physical_progress: 62, status: 'on_going',
    created_at: '2024-11-01T08:00:00Z',
  },
  {
    id: 'wp-004', project_id: PROJECT_ID,
    package_code: 'KSK/BKT2SA/004',
    category: 'Labour', subcategory: 'Finishing', sub_subcategory: null,
    work_nature: 'Plastering Works', remark: null,
    budget_amount: 95000, physical_progress: 38, status: 'in_review',
    created_at: '2024-11-10T08:00:00Z',
  },
  {
    id: 'wp-005', project_id: PROJECT_ID,
    package_code: 'KSK/BKT2SA/005',
    category: 'Preliminary', subcategory: 'Earthworks', sub_subcategory: null,
    work_nature: 'Excavation & Backfill', remark: 'Phase 1 excavation complete',
    budget_amount: 220000, physical_progress: 100, status: 'completed',
    created_at: '2024-10-15T08:00:00Z',
  },
  {
    id: 'wp-006', project_id: PROJECT_ID,
    package_code: 'WP-BKT2SA-006',
    category: 'Labour', subcategory: 'M&E', sub_subcategory: 'Electrical',
    work_nature: 'Main Electrical Distribution', remark: null,
    budget_amount: 175000, physical_progress: 45, status: 'on_going',
    created_at: '2024-11-15T08:00:00Z',
  },
  {
    id: 'wp-007', project_id: PROJECT_ID,
    package_code: 'WP-BKT2SA-007',
    category: 'Preliminary', subcategory: 'Protection', sub_subcategory: null,
    work_nature: 'Temporary Road Works', remark: 'Rejected — scope changed',
    budget_amount: 38000, physical_progress: 15, status: 'rejected_archived',
    created_at: '2024-11-05T08:00:00Z',
  },
  {
    id: 'wp-008', project_id: PROJECT_ID,
    package_code: 'KSK/BKT2SA/008',
    category: 'Labour', subcategory: 'Structural', sub_subcategory: null,
    work_nature: 'Formwork Installation', remark: null,
    budget_amount: 140000, physical_progress: 71, status: 'on_going',
    created_at: '2024-11-20T08:00:00Z',
  },
  {
    id: 'wp-009', project_id: PROJECT_ID,
    package_code: 'WP-BKT2SA-009',
    category: 'Labour', subcategory: 'Plumbing', sub_subcategory: null,
    work_nature: 'Internal Plumbing Rough-in', remark: null,
    budget_amount: 88000, physical_progress: 28, status: 'in_review',
    created_at: '2024-12-01T08:00:00Z',
  },
  {
    id: 'wp-010', project_id: PROJECT_ID,
    package_code: 'KSK/BKT2SA/010',
    category: 'Preliminary', subcategory: 'Safety Health & Environment', sub_subcategory: null,
    work_nature: 'Site Hoarding Extension', remark: 'North perimeter extension',
    budget_amount: 22000, physical_progress: 100, status: 'completed',
    created_at: '2024-11-25T08:00:00Z',
  },
  {
    id: 'wp-011', project_id: PROJECT_ID,
    package_code: 'WP-BKT2SA-011',
    category: 'Labour', subcategory: 'Finishing', sub_subcategory: null,
    work_nature: 'Tiling Works', remark: null,
    budget_amount: 115000, physical_progress: 5, status: 'on_going',
    created_at: '2025-01-10T08:00:00Z',
  },
  {
    id: 'wp-012', project_id: PROJECT_ID,
    package_code: 'KSK/BKT2SA/012',
    category: 'Labour', subcategory: 'Structural', sub_subcategory: null,
    work_nature: 'Steel Frame Erection', remark: 'Rejected — subcon withdrawn',
    budget_amount: 290000, physical_progress: 0, status: 'rejected_archived',
    created_at: '2024-12-15T08:00:00Z',
  },
]

// ---------------------------------------------------------------------------
// Helpers shared by selectors
// ---------------------------------------------------------------------------
const TODAY_STR = isoDate(REF_DATE)

function getLatestWorkday(): string {
  for (let offset = 0; offset < 7; offset++) {
    const d = new Date(REF_DATE)
    d.setDate(REF_DATE.getDate() - offset)
    if (d.getDay() !== 0 && d.getDay() !== 6) return isoDate(d)
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

const WORKER_TYPE_LABELS: Record<WorkerType, string> = {
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
