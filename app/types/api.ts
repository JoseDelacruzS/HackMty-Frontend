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

// ── Analyze / Recommendations (Dashboard + ConsoleLogs) ──
// /analyze?startDate&endDate llena el dashboard; /analyze/recommendation llena la consola
export interface AnalyzeQuery {
  startDate: string // YYYY-MM-DD
  endDate: string   // YYYY-MM-DD
}

export interface AnalyzeResponse {
  message?: string
  success?: boolean
  analyzed?: number
  total?: number
  // Forma dashboard-like (preferida)
  user?: UserDTO
  metrics?: MetricsDTO
  aforeProjection?: AforeProjectionDTO
  agent?: AgentDTO
  summary?: {
    income?: number
    fixedExpenses?: number
    variableExpenses?: number
    totalExpenses?: number
    net?: number
  }
  // Forma flat (fallback directo)
  income?: number
  fixedExpenses?: number
  safeToSave?: number
  recommendedAfore?: number
  creditScore?: number
  withoutAgent?: number
  withAgent?: number
  leakAmount?: number
  leaksAmount?: number
  leaksDetected?: number
  logs?: string[]
  transactions?: TransactionDTO[]
  [key: string]: any
}

export interface RecommendationItem {
  id?: string
  title?: string
  description?: string
  message?: string
  amount?: number
  category?: string
  type?: string
  priority?: string
  [key: string]: any
}

// Respuesta real de /analyze/recommendation (ejemplo del usuario)
export interface RecommendationAllocation {
  to_vault_mxn: number
  flush_pending_mxn: number
  flush_at: string
  reason_key: string
  leak_recoverable_mxn: number
  recoverable_by_category: Record<string, number>
  capacity_mxn: number
}

export interface RecommendationRationale {
  narrative_es: string
  narrative_en: string
  tokens: {
    leak_total: number
    contribution: number
    impact_65: number
    flush_pending: number
  }
}

export interface RecommendationDiscretionary {
  txn_id: string
  verdict: string
  reason: string
  amount_mxn: number
  category: string
}

export interface RecommendationProjection {
  without_agent_mxn: number
  with_agent_mxn: number
  monthly_contribution_mxn: number
  assumptions: {
    annual_return: number
    scenario: string
    current_age: number
    retirement_age: number
  }
  disclaimer: string
}

export interface RecommendationAgentLog {
  step: string
  detail: string
  used_llm: boolean
  ms: number | null
}

export interface AnalyzeRecommendationResource {
  recommendation: {
    action: string
    allocation: RecommendationAllocation
    cadence: string
    confidence: number
  }
  rationale: RecommendationRationale
  discretionary: RecommendationDiscretionary[]
  projection: RecommendationProjection
  agent_log: RecommendationAgentLog[]
}

export interface AnalyzeRecommendationResponse {
  message?: string
  status?: number
  resource?: AnalyzeRecommendationResource
  // fallbacks legacy
  recommendations?: Array<string | RecommendationItem>
  data?: Array<string | RecommendationItem>
  result?: Array<string | RecommendationItem>
  [key: string]: any
}

// ── Operation (POST /api/v1/operation) ──
export type OperationType = "purchase" | "TRANSFER" | "transfer" | string
export interface OperationRequest {
  type: OperationType // para cajita: "TRANSFER"
  medium: Medium // "balance"
  status: TxnStatus // "completed"
  amount: number
  description: string // para cajita: "AHORRO"
  merchant: string // ej "AFORE" | "UBER EATS"
  category?: string
}

export interface OperationResponse {
  message?: string
  status?: number
  resource?: any
  transaction?: TransactionDTO
  [key: string]: any
}

// ── Generic ──
export interface Paginated<T> {
  data: T[]
  total: number
  page: number
  limit: number
}
