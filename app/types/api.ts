// ──────────────────────────────────────────────────────────────
//  Contrato central Frontend ↔ Backend
//  Basado en mocks de app/stores/financialStore.ts + i18n app.config.ts
//  Cada pantalla declara qué necesita renderizar → qué debe devolver el backend
// ──────────────────────────────────────────────────────────────

// Commons
export type Category = 'food_delivery' | 'subscriptions' | 'income' | 'convenience' | 'coffee' | string
export type Medium = 'balance' | 'checking' | 'savings' | 'creditCard' | string
export type TxnStatus = 'completed' | 'pending' | 'cancelled' | string

export interface TransactionDTO {
  id: string
  merchant: string
  amount: number // negativo = gasto, positivo = ingreso
  category: Category
  timestamp: string // ISO 8601
  description?: string
  isLeak?: boolean
  medium?: Medium
  status?: TxnStatus
  createdAt?: string
}

export interface UserDTO {
  name: string
  age: number
  retirementAge: number
  customerId?: string
  email?: string
  first_name?: string
  last_name?: string
  address?: {
    street_name: string
    street_number: string
    city: string
    state: string
    zip: string
  }
  avatar?: string
}

// ── Backend real: GET /user ──
// Shape: { message, status, resource: UserResourceDTO[] }
export interface UserResourceDTO {
  _id: string
  username: string
  firstName: string
  lastName: string
  nessieId: string
  createdAt: string
  updatedAt: string
  // password se excluye: no se persiste en cliente
}

export interface UserResponse {
  message: string
  status: number
  resource: UserResourceDTO[]
}

export interface MetricsDTO {
  income: number
  fixedExpenses: number
  safeToSave: number
  recommendedAfore: number
  creditScore: number // 0-850
  // derivados opcionales (si backend los calcula)
  savingsRate?: number // safeToSave/income
  solvencyPct?: number // vs meta 20%
}

export interface AforeProjectionDTO {
  withoutAgent: number
  withAgent: number
  gain?: number // withAgent - withoutAgent
  pctGain?: number
}

export interface AgentDTO {
  logs: string[]
  leaksDetected?: number
  leakAmount?: number // suma de fugas del mes
}

export interface CajitaDTO {
  id: string
  title: string
  icon: string // i-heroicons-*
  balance: number
  goal: number
  yieldRate: number // 0.145
  earnedYield: number
  progressPct?: number // balance/goal*100
}

// ── Pantalla: Dashboard (pages/index.vue) ──
// Componentes: Greeting + MetricCards + ActionCard + ProjectionChart + ConsoleLogs
export interface DashboardResponse {
  user: UserDTO
  metrics: MetricsDTO
  aforeProjection: AforeProjectionDTO
  agent: AgentDTO
}

// MetricCards necesita: metrics.safeToSave, metrics.income, creditScore → savingsRate, solvencyPct
// ActionCard necesita: metrics.recommendedAfore, aforeProjection gain, agent.leakAmount
// ProjectionChart necesita: aforeProjection + user.retirementAge
// ConsoleLogs necesita: agent.logs

// ── Pantalla: History / Movimientos (pages/history.vue) ──
export interface HistoryResponse {
  transactions: TransactionDTO[]
  total: number
  leaks: number
  // paginación opcional
  page?: number
  limit?: number
}
export interface HistoryQuery {
  limit?: number
  offset?: number
  category?: string
  isLeak?: boolean
  status?: string
}

// ── Backend real: GET /operation ──
// Shape: { message, status, resource: OperationDTO[] }
export interface OperationDTO {
  _id: string
  type: string // PURCHASE | DEPOSIT | ...
  medium: string // balance | checking | ...
  transactionDate: string // YYYY-MM-DD
  status: string // COMPLETED | PENDING | ...
  amount: number // negativo = gasto, positivo = ingreso
  customerId: string
  accountNumber: string
  description: string
  merchant?: string // ausente en DEPOSIT
  createdAt: string // ISO 8601
  updatedAt: string // ISO 8601
}

export interface OperationResponse {
  message: string
  status: number
  resource: OperationDTO[]
}

// ── POST /operation (registrar operación en el ledger) ──
export interface CreateOperationBody {
  type: 'PURCHASE' | 'DEPOSIT' | 'WITHDRAWAL' | string
  medium: string
  status: 'completed' | 'pending' | string
  amount: number // negativo = sale de la cuenta, positivo = entra
  description: string
  merchant: string
}

export interface CreateOperationResponse {
  message: string
  status: number
  resource: OperationDTO
}

// ── Pantalla: Analytics / Flujo (pages/analytics.vue) ──
export interface AnalyticsBucketDTO {
  key: 'housing' | 'food' | 'subs' | string
  label: string // ya traducido o key para i18n
  amount: number
  sharePct: number // % sobre totalExpenses
  hasLeak: boolean
  color?: string
}

export interface AnalyticsResponse {
  summary: {
    income: number
    fixedExpenses: number
    variableExpenses: number
    totalExpenses: number
    net: number
  }
  breakdown: AnalyticsBucketDTO[]
  solvency: {
    savingsRate: number
    goalRate: number // 0.2
    pct: number // 0-100
    hint: string
  }
  aforeProjection: AforeProjectionDTO
}

// ── Pantalla: Savings / Cajita (pages/saving.vue) ──
export interface SavingsResponse {
  cajita: CajitaDTO
  summary: {
    totalBalance: number
    totalYield: number
    yieldRate: number
    availability: string // "24/7 Inmediata"
  }
}
export interface SavingsOperationBody {
  amount: number
}
export interface SavingsOperationResponse {
  cajita: CajitaDTO
  message?: string
}

// ── Agent extras ──
export interface AforeContributeBody {
  amount: number
}
export interface AforeContributeResponse {
  success: boolean
  newCreditScore?: number
  logs?: string[]
}

// ── Generic ──
export interface Paginated<T> {
  data: T[]
  total: number
  page: number
  limit: number
}
