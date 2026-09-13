import type {
  DashboardResponse,
  HistoryResponse,
  HistoryQuery,
  OperationResponse,
  CreateOperationBody,
  CreateOperationResponse,
  UserResponse,
  AnalyticsResponse,
  SavingsResponse,
  SavingsOperationResponse,
  AforeContributeResponse,
} from "~/types/api";
import { useAuthStore } from "~/stores/auth";

/**
 * Capa de API por pantalla.
 * Cada método mapea 1 pantalla → 1-2 endpoints.
 * Usa proxy Nuxt /api/* (server/api/*) para no exponer BANK_API_BASE_URL y enviar authToken.
 * Fallback: si el backend no está listo, el store mantiene mocks.
 */
export function useFinancialApi() {
  const auth = useAuthStore();

  function headers() {
    const h: Record<string, string> = { accept: "application/json" };
    if (auth.token) {
      h["Authorization"] = `Bearer ${auth.token}`;
      h["authToken"] = auth.token;
    }
    return h;
  }

  // ── Dashboard ──
  // GET /api/dashboard → DashboardResponse
  // Necesita: user, metrics, aforeProjection, agent.logs
  async function getDashboard() {
    return await $fetch<DashboardResponse>("/api/dashboard", { headers: headers() });
  }

  // ── History ──
  // GET /api/transactions?limit&offset&category&isLeak
  async function getTransactions(query: HistoryQuery = {}) {
    return await $fetch<HistoryResponse>("/api/transactions", {
      headers: headers(),
      query,
    });
  }

  async function getTransactionById(id: string) {
    return await $fetch<HistoryResponse>(`/api/transactions/${id}`, { headers: headers() });
  }

  // ── Operations (backend real) ──
  // GET /api/operation?limit&offset&category&isLeak&status → OperationResponse
  // Backend devuelve { message, status, resource: [...] }
  async function getOperations(query: HistoryQuery = {}) {
    return await $fetch<OperationResponse>("/api/operation", {
      headers: headers(),
      query,
    });
  }

  // ── Operations (backend real) ──
  // POST /api/operation { type, medium, status, amount, description, merchant }
  async function createOperation(body: CreateOperationBody) {
    return await $fetch<CreateOperationResponse>("/api/operation", {
      method: "POST",
      headers: headers(),
      body,
    });
  }

  // ── Analytics ──
  // GET /api/analytics → AnalyticsResponse
  async function getAnalytics() {
    return await $fetch<AnalyticsResponse>("/api/analytics", { headers: headers() });
  }

  // ── Savings / Cajita ──
  // GET /api/savings/cajita
  async function getCajita() {
    return await $fetch<SavingsResponse>("/api/savings/cajita", { headers: headers() });
  }

  // POST /api/savings/cajita/deposit { amount }
  async function depositToCajita(amount: number) {
    return await $fetch<SavingsOperationResponse>("/api/savings/cajita/deposit", {
      method: "POST",
      headers: headers(),
      body: { amount },
    });
  }

  // POST /api/savings/cajita/withdraw { amount }
  async function withdrawFromCajita(amount: number) {
    return await $fetch<SavingsOperationResponse>("/api/savings/cajita/withdraw", {
      method: "POST",
      headers: headers(),
      body: { amount },
    });
  }

  // POST /api/afore/contribute { amount }
  async function contributeAfore(amount: number) {
    return await $fetch<AforeContributeResponse>("/api/afore/contribute", {
      method: "POST",
      headers: headers(),
      body: { amount },
    });
  }

  // ── Helpers para páginas ──
  // GET /api/user → UserResponse { message, status, resource: [...] }
  async function getUser() {
    return await $fetch<UserResponse>("/api/user", { headers: headers() });
  }

  return {
    getDashboard,
    getTransactions,
    getTransactionById,
    getOperations,
    createOperation,
    getAnalytics,
    getCajita,
    depositToCajita,
    withdrawFromCajita,
    contributeAfore,
    getUser,
  };
}
