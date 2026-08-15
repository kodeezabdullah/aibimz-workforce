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
// Raw mock data
// ---------------------------------------------------------------------------

const PROJECT_ID = 'bkt2sa-proj-0001-0000-000000000001'

export const MOCK_PROJECT: Project = {
  id: PROJECT_ID,
  code: 'BKT2SA',
  name: 'Bukit 2 Site A',
  created_at: '2024-10-01T08:00:00Z',
}

// --- Workers (42 total, realistic distribution) ---
// general_worker ~40%, subcon ~30%, subcon_as_gw ~15%, operator ~10%, staff ~5%
const TRADE_CATEGORIES = {
  general_worker: ['Civil Works', 'Structural', 'Finishing', 'Excavation', 'Concrete'],
  staff: ['Site Supervisor', 'QS Engineer', 'Safety Officer', 'Project Engineer'],
  subcon: ['M&E Works', 'Plumbing', 'Roofing', 'Tiling', 'Painting'],
  operator: ['Tower Crane', 'Excavator', 'Forklift', 'Concrete Pump'],
  subcon_as_gw: ['Civil Works', 'Structural', 'Carpentry'],
}
const SUBCON_COMPANIES = ['Mutiara Jaya Sdn Bhd', 'Kota Bina Resources', 'Prisma Maju Sdn Bhd', 'Alam Baru Construction']

function makeWorker(
  idx: number,
  type: WorkerType,
  name: string,
  company?: string,
): Worker {
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
  makeWorker(18, 'subcon', 'Raziman bin Osman',    SUBCON_COMPANIES[0]),
  makeWorker(19, 'subcon', 'Lee Chee Wah',         SUBCON_COMPANIES[1]),
  makeWorker(20, 'subcon', 'Kumaresan a/l Samy',   SUBCON_COMPANIES[0]),
  makeWorker(21, 'subcon', 'Firdaus bin Rosli',    SUBCON_COMPANIES[2]),
  makeWorker(22, 'subcon', 'Tan Beng Huat',        SUBCON_COMPANIES[1]),
  makeWorker(23, 'subcon', 'Ariffin bin Md Salleh',SUBCON_COMPANIES[3]),
  makeWorker(24, 'subcon', 'Ravi a/l Gunasegaran', SUBCON_COMPANIES[2]),
  makeWorker(25, 'subcon', 'Mohd Hafiz bin Ismail',SUBCON_COMPANIES[0]),
  makeWorker(26, 'subcon', 'Loh Chin Keong',       SUBCON_COMPANIES[3]),
  makeWorker(27, 'subcon', 'Shamsul bin Bakar',    SUBCON_COMPANIES[1]),
  makeWorker(28, 'subcon', 'Vijay a/l Devarajan',  SUBCON_COMPANIES[2]),
  makeWorker(29, 'subcon', 'Azwan bin Mansor',     SUBCON_COMPANIES[3]),
  makeWorker(30, 'subcon', 'Chia Kok Weng',        SUBCON_COMPANIES[0]),

  // Subcon as GW (6)
  makeWorker(31, 'subcon_as_gw', 'Norazam bin Talib',    SUBCON_COMPANIES[1]),
  makeWorker(32, 'subcon_as_gw', 'Heng Kim Swee',         SUBCON_COMPANIES[2]),
  makeWorker(33, 'subcon_as_gw', 'Periasamy a/l Durai',   SUBCON_COMPANIES[0]),
  makeWorker(34, 'subcon_as_gw', 'Effendi bin Yusoff',    SUBCON_COMPANIES[3]),
  makeWorker(35, 'subcon_as_gw', 'Lim Yew Heng',          SUBCON_COMPANIES[1]),
  makeWorker(36, 'subcon_as_gw', 'Karunakaran a/l Nair',  SUBCON_COMPANIES[2]),

  // Operators (4)
  makeWorker(37, 'operator', 'Shahril bin Ramli'),
  makeWorker(38, 'operator', 'Chew Kin Hoe'),
  makeWorker(39, 'operator', 'Baharudin bin Musa'),
  makeWorker(40, 'operator', 'Gunalan a/l Suppiah'),

  // Staff (2)
  makeWorker(41, 'staff', 'Nurul Ain binti Malik'),
  makeWorker(42, 'staff', 'Kevin Tan Yong Sheng'),
]

// --- Attendance: 30 days back from a reference date ---
// Most-recent period (current 2nd half of month) = processing
// Older periods = finalized

const REF_DATE = new Date('2025-08-15') // "today" in mock world

function isoDate(d: Date): string {
  return d.toISOString().split('T')[0]
}

function periodOf(date: Date): { period_type: PeriodType; period_status: PeriodStatus } {
  const day = date.getDate()
  const month = date.getMonth() // 0-indexed
  const refMonth = REF_DATE.getMonth()
  const refYear = REF_DATE.getFullYear()
  const dYear = date.getFullYear()

  const isCurrentPeriod =
    dYear === refYear && month === refMonth && day >= 16 // 2nd half of Aug = processing

  const period_type: PeriodType = day <= 15 ? '1st_half' : '2nd_half'
  const period_status: PeriodStatus = isCurrentPeriod ? 'processing' : 'finalized'
  return { period_type, period_status }
}

// Pseudo-random deterministic float [0,1) seeded by string
function seededRand(seed: string): number {
  let h = 2166136261
  for (let i = 0; i < seed.length; i++) {
    h = Math.imul(h ^ seed.charCodeAt(i), 16777619)
  }
  return ((h >>> 0) % 10000) / 10000
}

function makeAttendance(): AttendanceRecord[] {
  const records: AttendanceRecord[] = []
  let recIdx = 0

  for (let d = 29; d >= 0; d--) {
    const dateObj = new Date(REF_DATE)
    dateObj.setDate(REF_DATE.getDate() - d)
    const dateStr = isoDate(dateObj)
    const { period_type, period_status } = periodOf(dateObj)

    // Skip weekends (Sat=6, Sun=0)
    const dow = dateObj.getDay()
    if (dow === 0 || dow === 6) continue

    for (const worker of MOCK_WORKERS) {
      const seed = `${worker.id}-${dateStr}`
      const r = seededRand(seed)
      const r2 = seededRand(seed + 'src')
      const r3 = seededRand(seed + 'ot')

      // Subcon workers: monthly period
      const actualPeriodType: PeriodType =
        worker.worker_type === 'subcon' ? 'monthly' : period_type

      // Realistic attendance distribution:
      // ~78% present, ~10% absent, ~8% late, ~4% early_leave
      let status: AttendanceStatus
      if (r < 0.78) status = 'present'
      else if (r < 0.88) status = 'absent'
      else if (r < 0.96) status = 'late'
      else status = 'early_leave'

      // Source distribution: rfid 65%, face_scan 25%, manual 10%
      let source: AttendanceSource
      if (r2 < 0.65) source = 'rfid'
      else if (r2 < 0.90) source = 'face_scan'
      else source = 'manual'

      const isPresent = status === 'present' || status === 'late' || status === 'early_leave'
      const working_hours = isPresent ? (status === 'late' ? 6 + r * 1.5 : status === 'early_leave' ? 5 + r : 7 + r) : null
      const overtime_hours = isPresent && r3 > 0.7 ? Math.round(r3 * 3 * 2) / 2 : 0

      records.push({
        id: `att-${String(recIdx++).padStart(5, '0')}`,
        worker_id: worker.id,
        project_id: PROJECT_ID,
        date: dateStr,
        check_in: isPresent ? `07:${String(Math.floor(30 * r)).padStart(2, '0')}` : null,
        check_out: isPresent ? `${16 + Math.floor(overtime_hours)}:${String(Math.floor(59 * r)).padStart(2, '0')}` : null,
        working_hours: working_hours !== null ? Math.round(working_hours * 100) / 100 : null,
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

// --- Work packages (12 across varied statuses, categories, progress) ---
export const MOCK_WORK_PACKAGES: WorkPackage[] = [
  {
    id: 'wp-001', project_id: PROJECT_ID,
    package_code: 'WP-BKT2SA-001',
    category: 'Labour', subcategory: 'Protection', sub_subcategory: null,
    work_nature: 'Site Preliminary Work',
    remark: 'Hoarding and fencing',
    budget_amount: 85000, physical_progress: 100,
    status: 'completed', created_at: '2024-10-20T08:00:00Z',
  },
  {
    id: 'wp-002', project_id: PROJECT_ID,
    package_code: 'WP-BKT2SA-002',
    category: 'Labour', subcategory: 'Safety Health & Environment', sub_subcategory: null,
    work_nature: 'Work On Behalf',
    remark: 'Safety officer deployment',
    budget_amount: 42000, physical_progress: 87,
    status: 'on_going', created_at: '2024-10-22T08:00:00Z',
  },
  {
    id: 'wp-003', project_id: PROJECT_ID,
    package_code: 'WP-BKT2SA-003',
    category: 'Labour', subcategory: 'Structural', sub_subcategory: null,
    work_nature: 'Reinforced Concrete Works',
    remark: 'Basement slab pours',
    budget_amount: 310000, physical_progress: 62,
    status: 'on_going', created_at: '2024-11-01T08:00:00Z',
  },
  {
    id: 'wp-004', project_id: PROJECT_ID,
    package_code: 'KSK/BKT2SA/004',
    category: 'Labour', subcategory: 'Finishing', sub_subcategory: null,
    work_nature: 'Plastering Works',
    remark: null,
    budget_amount: 95000, physical_progress: 38,
    status: 'in_review', created_at: '2024-11-10T08:00:00Z',
  },
  {
    id: 'wp-005', project_id: PROJECT_ID,
    package_code: 'KSK/BKT2SA/005',
    category: 'Preliminary', subcategory: 'Earthworks', sub_subcategory: null,
    work_nature: 'Excavation & Backfill',
    remark: 'Phase 1 excavation complete',
    budget_amount: 220000, physical_progress: 100,
    status: 'completed', created_at: '2024-10-15T08:00:00Z',
  },
  {
    id: 'wp-006', project_id: PROJECT_ID,
    package_code: 'WP-BKT2SA-006',
    category: 'Labour', subcategory: 'M&E', sub_subcategory: 'Electrical',
    work_nature: 'Main Electrical Distribution',
    remark: null,
    budget_amount: 175000, physical_progress: 45,
    status: 'on_going', created_at: '2024-11-15T08:00:00Z',
  },
  {
    id: 'wp-007', project_id: PROJECT_ID,
    package_code: 'WP-BKT2SA-007',
    category: 'Preliminary', subcategory: 'Protection', sub_subcategory: null,
    work_nature: 'Temporary Road Works',
    remark: 'Rejected — scope changed',
    budget_amount: 38000, physical_progress: 15,
    status: 'rejected_archived', created_at: '2024-11-05T08:00:00Z',
  },
  {
    id: 'wp-008', project_id: PROJECT_ID,
    package_code: 'KSK/BKT2SA/008',
    category: 'Labour', subcategory: 'Structural', sub_subcategory: null,
    work_nature: 'Formwork Installation',
    remark: null,
    budget_amount: 140000, physical_progress: 71,
    status: 'on_going', created_at: '2024-11-20T08:00:00Z',
  },
  {
    id: 'wp-009', project_id: PROJECT_ID,
    package_code: 'WP-BKT2SA-009',
    category: 'Labour', subcategory: 'Plumbing', sub_subcategory: null,
    work_nature: 'Internal Plumbing Rough-in',
    remark: null,
    budget_amount: 88000, physical_progress: 28,
    status: 'in_review', created_at: '2024-12-01T08:00:00Z',
  },
  {
    id: 'wp-010', project_id: PROJECT_ID,
    package_code: 'KSK/BKT2SA/010',
    category: 'Preliminary', subcategory: 'Safety Health & Environment', sub_subcategory: null,
    work_nature: 'Site Hoarding Extension',
    remark: 'North perimeter extension',
    budget_amount: 22000, physical_progress: 100,
    status: 'completed', created_at: '2024-11-25T08:00:00Z',
  },
  {
    id: 'wp-011', project_id: PROJECT_ID,
    package_code: 'WP-BKT2SA-011',
    category: 'Labour', subcategory: 'Finishing', sub_subcategory: null,
    work_nature: 'Tiling Works',
    remark: null,
    budget_amount: 115000, physical_progress: 5,
    status: 'on_going', created_at: '2025-01-10T08:00:00Z',
  },
  {
    id: 'wp-012', project_id: PROJECT_ID,
    package_code: 'KSK/BKT2SA/012',
    category: 'Labour', subcategory: 'Structural', sub_subcategory: null,
    work_nature: 'Steel Frame Erection',
    remark: 'Rejected — subcon withdrawn',
    budget_amount: 290000, physical_progress: 0,
    status: 'rejected_archived', created_at: '2024-12-15T08:00:00Z',
  },
]

// ---------------------------------------------------------------------------
// Selector / aggregator functions — the ONLY public API for page components
// ---------------------------------------------------------------------------

const TODAY_STR = isoDate(REF_DATE)

/** Returns the most recent working day's attendance for "today" stats */
function getLatestWorkday(): string {
  // Walk back from REF_DATE to find a weekday
  for (let offset = 0; offset < 7; offset++) {
    const d = new Date(REF_DATE)
    d.setDate(REF_DATE.getDate() - offset)
    if (d.getDay() !== 0 && d.getDay() !== 6) return isoDate(d)
  }
  return TODAY_STR
}

const LATEST_WORKDAY = getLatestWorkday()

// --- KPI selectors ---

export interface WorkforceKPIs {
  totalWorkers: number
  activeToday: number
  attendanceRate: number    // 0-100
  absenteeismRate: number   // 0-100
  overtimeHours: number
}

export function getWorkforceKPIs(_projectId: string): WorkforceKPIs {
  const todayRecords = MOCK_ATTENDANCE.filter(a => a.date === LATEST_WORKDAY)
  const present = todayRecords.filter(a => a.status !== 'absent').length
  const absent = todayRecords.filter(a => a.status === 'absent').length
  const total = todayRecords.length || MOCK_WORKERS.length

  const recentRecords = MOCK_ATTENDANCE.filter(a => {
    const d = new Date(a.date)
    const cutoff = new Date(REF_DATE)
    cutoff.setDate(cutoff.getDate() - 7)
    return d >= cutoff
  })
  const totalOT = recentRecords.reduce((s, a) => s + a.overtime_hours, 0)

  return {
    totalWorkers: MOCK_WORKERS.length,
    activeToday: present,
    attendanceRate: total > 0 ? Math.round((present / total) * 1000) / 10 : 0,
    absenteeismRate: total > 0 ? Math.round((absent / total) * 1000) / 10 : 0,
    overtimeHours: Math.round(totalOT * 10) / 10,
  }
}

// --- Headcount by worker type ---

export interface HeadcountDataPoint {
  workerType: WorkerType
  label: string
  headcount: number
  workingHours: number   // avg daily working hours for this type
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
  return types.map(type => {
    const workers = MOCK_WORKERS.filter(w => w.worker_type === type)
    const workerIds = new Set(workers.map(w => w.id))
    const recent = MOCK_ATTENDANCE.filter(
      a => workerIds.has(a.worker_id) && a.date >= isoDate(new Date(REF_DATE.getTime() - 7 * 86400000))
    )
    const presentRecords = recent.filter(a => a.working_hours !== null)
    const avgHours = presentRecords.length > 0
      ? presentRecords.reduce((s, a) => s + (a.working_hours ?? 0), 0) / presentRecords.length
      : 0

    return {
      workerType: type,
      label: WORKER_TYPE_LABELS[type],
      headcount: workers.length,
      workingHours: Math.round(avgHours * 10) / 10,
    }
  })
}

// --- Today's attendance ---

export interface TodaysAttendance {
  present: number
  absent: number
  late: number
  earlyLeave: number
  total: number
  rate: number    // present (including late/early_leave) / total
  periodStatus: PeriodStatus
}

export function getTodaysAttendance(_projectId: string): TodaysAttendance {
  const records = MOCK_ATTENDANCE.filter(a => a.date === LATEST_WORKDAY)
  const present = records.filter(a => a.status === 'present').length
  const absent = records.filter(a => a.status === 'absent').length
  const late = records.filter(a => a.status === 'late').length
  const earlyLeave = records.filter(a => a.status === 'early_leave').length
  const total = records.length
  const attending = present + late + earlyLeave

  // Today is in processing period
  const periodStatus: PeriodStatus = records[0]?.period_status ?? 'processing'

  return {
    present,
    absent,
    late,
    earlyLeave,
    total,
    rate: total > 0 ? Math.round((attending / total) * 1000) / 10 : 0,
    periodStatus,
  }
}

// --- Trend data ---

export type Granularity = 'daily' | 'weekly' | 'monthly'

export interface TrendPoint {
  label: string
  value: number
}

function bucketAttendance(granularity: Granularity): Map<string, AttendanceRecord[]> {
  const bucket = new Map<string, AttendanceRecord[]>()

  for (const rec of MOCK_ATTENDANCE) {
    const d = new Date(rec.date)
    let key: string
    if (granularity === 'daily') {
      key = rec.date
    } else if (granularity === 'weekly') {
      // ISO week: Monday-based
      const dow = d.getDay() === 0 ? 7 : d.getDay()
      const monday = new Date(d)
      monday.setDate(d.getDate() - (dow - 1))
      key = `Wk ${isoDate(monday).slice(5)}`  // "Wk MM-DD"
    } else {
      key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
    }
    if (!bucket.has(key)) bucket.set(key, [])
    bucket.get(key)!.push(rec)
  }
  return bucket
}

function formatLabel(key: string, granularity: Granularity): string {
  if (granularity === 'daily') {
    // "Aug 01"
    const d = new Date(key)
    return d.toLocaleDateString('en-MY', { month: 'short', day: '2-digit' })
  }
  if (granularity === 'weekly') return key    // already "Wk MM-DD"
  // monthly "YYYY-MM" → "Aug '25"
  const [y, m] = key.split('-')
  const d = new Date(Number(y), Number(m) - 1)
  return d.toLocaleDateString('en-MY', { month: 'short', year: '2-digit' })
}

export function getAttendanceTrend(_projectId: string, granularity: Granularity): TrendPoint[] {
  const bucket = bucketAttendance(granularity)
  return [...bucket.entries()].map(([key, recs]) => {
    const total = recs.length
    const present = recs.filter(r => r.status !== 'absent').length
    return { label: formatLabel(key, granularity), value: total > 0 ? Math.round((present / total) * 1000) / 10 : 0 }
  })
}

export function getWorkingHoursTrend(_projectId: string, granularity: Granularity): TrendPoint[] {
  const bucket = bucketAttendance(granularity)
  return [...bucket.entries()].map(([key, recs]) => {
    const withHours = recs.filter(r => r.working_hours !== null)
    const avg = withHours.length > 0
      ? withHours.reduce((s, r) => s + (r.working_hours ?? 0), 0) / withHours.length
      : 0
    return { label: formatLabel(key, granularity), value: Math.round(avg * 10) / 10 }
  })
}

export function getOvertimeTrend(_projectId: string, granularity: Granularity): TrendPoint[] {
  const bucket = bucketAttendance(granularity)
  return [...bucket.entries()].map(([key, recs]) => {
    const total = recs.reduce((s, r) => s + r.overtime_hours, 0)
    return { label: formatLabel(key, granularity), value: Math.round(total * 10) / 10 }
  })
}

export function getManpowerTrend(_projectId: string, granularity: Granularity): TrendPoint[] {
  const bucket = bucketAttendance(granularity)
  return [...bucket.entries()].map(([key, recs]) => {
    // Unique workers present that day/week/month
    const uniquePresent = new Set(
      recs.filter(r => r.status !== 'absent').map(r => r.worker_id)
    ).size
    return { label: formatLabel(key, granularity), value: uniquePresent }
  })
}
