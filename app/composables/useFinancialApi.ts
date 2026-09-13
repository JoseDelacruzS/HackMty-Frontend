import type {
  DashboardResponse,
  HistoryResponse,
  HistoryQuery,
  AnalyticsResponse,
  SavingsResponse,
  SavingsOperationResponse,
  AforeContributeResponse,
  AnalyzeQuery,
  AnalyzeResponse,
  AnalyzeRecommendationResponse,
  OperationRequest,
  OperationResponse,
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

  function resolveToken(): string | null {
    if (auth.token) return auth.token;
    if (import.meta.client) {
      // Fallback directo a cookie/localStorage si Pinia aún no hidrató (evita 401 en /analyze)
      const cookieToken = useCookie<string | null>("auth_token").value;
      if (cookieToken) {
        // sincroniza Pinia para próximas calls
        auth.token = cookieToken;
        return cookieToken;
      }
      const ls = localStorage.getItem("auth_token");
      if (ls) {
        auth.token = ls;
        return ls;
      }
    } else {
      const cookieToken = useCookie<string | null>("auth_token").value;
      if (cookieToken) return cookieToken;
    }
    return null;
  }

  function headers() {
    const h: Record<string, string> = { accept: "application/json" };
    const token = resolveToken();
    if (token) {
      h["Authorization"] = `Bearer ${token}`;
      h["authToken"] = token;
      // compat: algunos backends leen `token` o `x-auth-token`
      h["token"] = token;
      h["x-auth-token"] = token;
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

  // ── Analyze / Recommendation ──
  // GET /api/analyze?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD → llena dashboard (resource.cash_flow, vault, scores)
  async function analyze(query: AnalyzeQuery) {
    return await $fetch<AnalyzeResponse>("/api/analyze", {
      headers: headers(),
      query,
      // asegura envío de cookies de sesión en fetch cliente
      credentials: "include" as any,
    });
  }
  // GET /api/analyze/recommendation (sin params, después de /analyze) → llena ConsoleLogs (modelo)
  async function getAnalyzeRecommendation() {
    return await $fetch<AnalyzeRecommendationResponse>("/api/analyze/recommendation", {
      headers: headers(),
      credentials: "include" as any,
    });
  }

  // ── Operation (cajita TRANSFER AHORRO) ──
  // POST /api/operation { type: "TRANSFER", medium: "balance", status: "completed", amount, description: "AHORRO", merchant }
  async function createOperation(body: OperationRequest) {
    return await $fetch<OperationResponse>("/api/operation", {
      method: "POST",
      headers: headers(),
      body,
      credentials: "include" as any,
    });
  }

  // ── Helpers para páginas ──
  async function getUser() {
    return await $fetch<{ user: DashboardResponse["user"] }>("/api/user", { headers: headers() });
  }

  return {
    getDashboard,
    getTransactions,
    getTransactionById,
    getAnalytics,
    getCajita,
    depositToCajita,
    withdrawFromCajita,
    contributeAfore,
    createOperation,
    analyze,
    getAnalyzeRecommendation,
    getUser,
  };
}
