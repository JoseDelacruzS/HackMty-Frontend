import { defineStore } from "pinia";
import type { DashboardResponse, HistoryResponse, AnalyticsResponse, SavingsResponse, AnalyzeRecommendationResponse } from "~/types/api";

export interface Transaction {
  id: string;
  merchant: string;
  amount: number;
  category: string;
  timestamp: string;
  isLeak?: boolean;
  medium?: string;
  status?: string;
  description?: string;
}

export interface Cajita {
  id: string;
  title: string;
  icon: string;
  balance: number;
  goal: number;
  yieldRate: number;
  earnedYield: number;
}

export const useFinancialStore = defineStore("financial", {
  state: () => ({
    user: {
      name: "Sofía",
      age: 26,
      retirementAge: 65,
    },
    metrics: {
      income: 25000,
      fixedExpenses: 12000,
      safeToSave: 1850,
      recommendedAfore: 500,
      creditScore: 740,
    },
    aforeProjection: {
      withoutAgent: 1100000,
      withAgent: 2425000,
    },
    agentLogs: [
      "Connected to Capital One Nessie API stream...",
      "Analyzed 30-day cash flow volatility.",
      "Safe-to-Save limit established at $1,850 MXN.",
    ] as string[],
    transactions: [
      {
        id: "1",
        merchant: "UBER EATS",
        amount: -427,
        category: "food_delivery",
        timestamp: "2026-09-11T20:30:00",
        isLeak: true,
        medium: "balance",
        status: "completed",
        description: "Uber Eats · comida a domicilio",
      },
      {
        id: "2",
        merchant: "NETFLIX",
        amount: -219,
        category: "subscriptions",
        timestamp: "2026-09-10T14:20:00",
        isLeak: false,
        medium: "balance",
        status: "completed",
        description: "Netflix · suscripción mensual",
      },
      {
        id: "3",
        merchant: "EMPRESA NOMINA",
        amount: 25000,
        category: "income",
        timestamp: "2026-09-01T09:00:00",
        isLeak: false,
        medium: "checking",
        status: "completed",
        description: "Nómina mensual",
      },
    ] as Transaction[],
    executed: false,
    cajita: {
      id: "c1",
      title: "Cajita Afore",
      icon: "i-heroicons-sparkles",
      balance: 12500,
      goal: 20000,
      yieldRate: 0.145,
      earnedYield: 412.50,
    } as Cajita,
    analyze: {
      startDate: "" as string,
      endDate: "" as string,
      rawStart: "" as string,
      rawEnd: "" as string,
      loading: false as boolean,
      error: "" as string,
      lastAnalyze: null as any,
      recommendations: [] as Array<string | any>,
      recommendationResource: null as any, // resource de /analyze/recommendation (allocation, rationale, discretionary, projection, agent_log)
      leakAmount: 0 as number,
      leaksDetected: 0 as number,
    },
  }),
  actions: {
    // ── local optimistic (fallback) ──
    depositToCajita(amount: number) {
      if (this.cajita && amount > 0) {
        this.cajita.balance += amount;
        this.cajita.earnedYield += Number((amount * 0.002).toFixed(2));
        this.agentLogs.push(`SAVINGS: Deposited $${amount} MXN into "${this.cajita.title}".`);
      }
    },
    withdrawFromCajita(amount: number) {
      if (this.cajita && amount > 0 && this.cajita.balance >= amount) {
        this.cajita.balance -= amount;
        this.agentLogs.push(`SAVINGS: Withdrew $${amount} MXN from "${this.cajita.title}".`);
      }
    },
    applyAforeContribution(amount: number) {
      if (this.executed) return;
      this.executed = true;
      this.metrics.creditScore += 15;
      this.agentLogs.push(
        `ACTION: $${amount} MXN redirected to AFORE Voluntary Savings.`
      );
      this.agentLogs.push(
        `CREDIT UPDATE: Cash-flow score increased to ${this.metrics.creditScore} pts.`
      );
    },
    addLiveTransaction(txn: Transaction) {
      this.transactions.unshift({
        medium: "balance",
        status: "completed",
        ...txn,
      });
      if (txn.isLeak) {
        this.agentLogs.push(
          `LEAK DETECTED: Abnormal spending at ${txn.merchant} ($${Math.abs(txn.amount)} MXN)`
        );
      }
    },
    setUser(userData: { name: string; age?: number; retirementAge?: number; customerId?: string }) {
      this.user = { ...this.user, ...userData };
    },
    logout() {
      this.user = { name: "Sofía", age: 26, retirementAge: 65 };
      this.executed = false;
    },

    // ── hidratación desde backend (usa proxies /api/*) ──
    hydrateDashboard(data: DashboardResponse) {
      if (data.user) this.user = { ...this.user, ...data.user, name: data.user.name || this.user.name };
      if (data.metrics) this.metrics = { ...this.metrics, ...data.metrics };
      if (data.aforeProjection) this.aforeProjection = { ...this.aforeProjection, ...data.aforeProjection };
      if (data.agent?.logs?.length) this.agentLogs = data.agent.logs;
    },
    hydrateHistory(data: HistoryResponse) {
      if (data.transactions) this.transactions = data.transactions as Transaction[];
    },
    hydrateAnalytics(data: AnalyticsResponse) {
      if (data.summary) {
        this.metrics.income = data.summary.income ?? this.metrics.income;
        this.metrics.fixedExpenses = data.summary.fixedExpenses ?? this.metrics.fixedExpenses;
      }
      if (data.aforeProjection) this.aforeProjection = { ...this.aforeProjection, ...data.aforeProjection };
    },
    hydrateCajita(data: SavingsResponse) {
      if (data.cajita) this.cajita = { ...this.cajita, ...data.cajita };
    },

    async fetchDashboard() {
      try {
        const { getDashboard } = useFinancialApi();
        const data = await getDashboard();
        this.hydrateDashboard(data);
        return data;
      } catch (e) { console.warn("[fetchDashboard] backend no disponible, usando mocks", e); return null; }
    },
    async fetchTransactions(query: any = {}) {
      try {
        const { getTransactions } = useFinancialApi();
        const data = await getTransactions(query);
        this.hydrateHistory(data as any);
        return data;
      } catch (e) { console.warn("[fetchTransactions] backend no disponible", e); return null; }
    },
    async fetchAnalytics() {
      try {
        const { getAnalytics } = useFinancialApi();
        const data = await getAnalytics();
        this.hydrateAnalytics(data);
        return data;
      } catch (e) { console.warn("[fetchAnalytics] backend no disponible", e); return null; }
    },
    async fetchCajita() {
      try {
        const { getCajita } = useFinancialApi();
        const data = await getCajita();
        this.hydrateCajita(data);
        return data;
      } catch (e) { console.warn("[fetchCajita] backend no disponible", e); return null; }
    },
    async depositToCajitaRemote(amount: number) {
      try {
        const { depositToCajita } = useFinancialApi();
        const res = await depositToCajita(amount);
        if (res.cajita) this.cajita = res.cajita as any;
        return res;
      } catch { this.depositToCajita(amount); return null; }
    },
    async withdrawFromCajitaRemote(amount: number) {
      try {
        const { withdrawFromCajita } = useFinancialApi();
        const res = await withdrawFromCajita(amount);
        if (res.cajita) this.cajita = res.cajita as any;
        return res;
      } catch { this.withdrawFromCajita(amount); return null; }
    },
    async contributeAforeRemote(amount: number) {
      try {
        const { contributeAfore } = useFinancialApi();
        const res = await contributeAfore(amount);
        if (res.newCreditScore) this.metrics.creditScore = res.newCreditScore;
        this.executed = true;
        return res;
      } catch { this.applyAforeContribution(amount); return null; }
    },

    ensureAnalyze() {
      // Guardia SSR/persistencia: si el estado viene sin `analyze` (hot reload), lo inicializa
      if (!(this as any).analyze) {
        (this as any).analyze = {
          startDate: "",
          endDate: "",
          rawStart: "",
          rawEnd: "",
          loading: false,
          error: "",
          lastAnalyze: null,
          recommendations: [],
          recommendationResource: null,
          leakAmount: 0,
          leaksDetected: 0,
        };
      }
      // migracion: si no existe recommendationResource en estado viejo
      if ((this as any).analyze.recommendationResource === undefined) {
        (this as any).analyze.recommendationResource = null;
      }
      return (this as any).analyze;
    },

    // ── Analyze: rango mes actual expandido ±1 día + /analyze + /analyze/recommendation ──
    getAnalyzeRange(expanded = true) {
      const now = new Date();
      const y = now.getFullYear();
      const m = now.getMonth();
      const first = new Date(y, m, 1);
      const today = new Date(y, m, now.getDate());
      const fmt = (d: Date) => d.toISOString().slice(0, 10);
      const rawStart = fmt(first);
      const rawEnd = fmt(today);
      if (!expanded) return { startDate: rawStart, endDate: rawEnd, rawStart, rawEnd };
      const startExp = new Date(first); startExp.setDate(startExp.getDate() - 1);
      const endExp = new Date(today); endExp.setDate(endExp.getDate() + 1);
      return { startDate: fmt(startExp), endDate: fmt(endExp), rawStart, rawEnd };
    },

    hydrateAnalyze(data: any) {
      if (!data || typeof data !== "object") return;
      // Soporta shape anidado o flat — mapea todo lo que llegue de /analyze al dashboard
      // Tu backend real responde: { message, status, resource: { cash_flow, vault, scores, leaks, recurring, categories... } }
      const src: any = data;
      const res: any = src.resource || src.data?.resource || src;

      // user
      if (src.user) this.user = { ...this.user, ...src.user, name: src.user.name || src.user.first_name || this.user.name };
      if (res.user) this.user = { ...this.user, ...res.user, name: res.user.name || res.user.first_name || this.user.name };

      // metrics anidado clásico
      if (src.metrics) this.metrics = { ...this.metrics, ...src.metrics };
      if (res.metrics) this.metrics = { ...this.metrics, ...res.metrics };

      // ── Mapeo principal: resource.cash_flow → metrics ──
      if (res.cash_flow) {
        if (typeof res.cash_flow.monthly_income === "number") this.metrics.income = res.cash_flow.monthly_income;
        if (typeof res.cash_flow.fixed_expenses === "number") this.metrics.fixedExpenses = res.cash_flow.fixed_expenses;
        if (typeof res.cash_flow.safe_to_save === "number") this.metrics.safeToSave = res.cash_flow.safe_to_save;
        // backups flat por si backend cambia naming
        if (typeof res.cash_flow.monthlyIncome === "number") this.metrics.income = res.cash_flow.monthlyIncome;
        if (typeof res.cash_flow.fixedExpenses === "number") this.metrics.fixedExpenses = res.cash_flow.fixedExpenses;
        if (typeof res.cash_flow.safeToSave === "number") this.metrics.safeToSave = res.cash_flow.safeToSave;
      }

      // vault → cajita principal
      if (res.vault) {
        if (typeof res.vault.balance_mxn === "number") this.cajita.balance = res.vault.balance_mxn;
        if (typeof res.vault.balanceMxn === "number") this.cajita.balance = res.vault.balanceMxn;
        // si el vault trae earnedYield o similar
        if (typeof res.vault.earned_yield === "number") this.cajita.earnedYield = res.vault.earned_yield;
      }

      // scores → creditScore / solvency
      if (res.scores) {
        if (typeof res.scores.financial_health === "number") {
          // financial_health 0-100 → creditScore 0-850 (500 base + escala)
          const fh = res.scores.financial_health;
          this.metrics.creditScore = fh <= 100 ? Math.round(500 + fh * 3.5) : fh;
        }
        if (typeof res.scores.savings_rate === "number" && typeof res.cash_flow?.safe_to_save !== "number") {
          // fallback si no hay safe_to_save pero hay savings_rate
          // no pisa cash_flow.safe_to_save si ya existe
        }
      }

      // leaks → ActionCard
      if (Array.isArray(res.leaks)) {
        this.analyze.leaksDetected = res.leaks.length;
        // suma de fugas si vienen con amount
        const sum = res.leaks.reduce((acc: number, l: any) => acc + (Number(l.amount) || 0), 0);
        if (sum) this.analyze.leakAmount = sum;
      }
      if (Array.isArray(src.leaks)) {
        this.analyze.leaksDetected = src.leaks.length;
      }

      // flat legacy
      if (typeof src.income === "number") this.metrics.income = src.income;
      if (typeof src.fixedExpenses === "number") this.metrics.fixedExpenses = src.fixedExpenses;
      if (typeof src.safeToSave === "number") this.metrics.safeToSave = src.safeToSave;
      if (typeof src.recommendedAfore === "number") this.metrics.recommendedAfore = src.recommendedAfore;
      if (typeof src.creditScore === "number") this.metrics.creditScore = src.creditScore;
      if (typeof src.safe_to_save === "number") this.metrics.safeToSave = src.safe_to_save;
      if (typeof src.recommended_afore === "number") this.metrics.recommendedAfore = src.recommended_afore;
      if (typeof src.credit_score === "number") this.metrics.creditScore = src.credit_score;

      // summary
      if (src.summary) {
        if (typeof src.summary.income === "number") this.metrics.income = src.summary.income;
        if (typeof src.summary.fixedExpenses === "number") this.metrics.fixedExpenses = src.summary.fixedExpenses;
        if (typeof src.summary.safeToSave === "number") this.metrics.safeToSave = src.summary.safeToSave;
      }
      if (res.summary) {
        if (typeof res.summary.income === "number") this.metrics.income = res.summary.income;
        if (typeof res.summary.fixedExpenses === "number") this.metrics.fixedExpenses = res.summary.fixedExpenses;
      }

      // afore projections
      if (src.aforeProjection) this.aforeProjection = { ...this.aforeProjection, ...src.aforeProjection };
      if (src.afore_projection) this.aforeProjection = { ...this.aforeProjection, ...src.afore_projection };
      if (res.aforeProjection) this.aforeProjection = { ...this.aforeProjection, ...res.aforeProjection };
      if (typeof src.withoutAgent === "number") this.aforeProjection.withoutAgent = src.withoutAgent;
      if (typeof src.withAgent === "number") this.aforeProjection.withAgent = src.withAgent;
      if (typeof src.without_agent === "number") this.aforeProjection.withoutAgent = src.without_agent;
      if (typeof src.with_agent === "number") this.aforeProjection.withAgent = src.with_agent;
      if (typeof res.withoutAgent === "number") this.aforeProjection.withoutAgent = res.withoutAgent;
      if (typeof res.withAgent === "number") this.aforeProjection.withAgent = res.withAgent;
      if (src.agent?.aforeProjection) this.aforeProjection = { ...this.aforeProjection, ...src.agent.aforeProjection };

      // agent / logs / leaks (genérico)
      if (src.agent) {
        if (Array.isArray(src.agent.logs)) this.agentLogs = [...src.agent.logs];
        if (typeof src.agent.leakAmount === "number") this.analyze.leakAmount = src.agent.leakAmount;
        if (typeof src.agent.leaksDetected === "number") this.analyze.leaksDetected = src.agent.leaksDetected;
      }
      if (typeof src.leakAmount === "number") this.analyze.leakAmount = src.leakAmount;
      if (typeof src.leaksAmount === "number") this.analyze.leakAmount = src.leaksAmount;
      if (typeof src.leaksDetected === "number") this.analyze.leaksDetected = src.leaksDetected;
      if (Array.isArray(src.logs)) this.agentLogs = [...src.logs];
      if (Array.isArray(res.logs)) this.agentLogs = [...res.logs];

      // transacciones si viene histórico
      if (Array.isArray(src.transactions)) this.transactions = src.transactions as Transaction[];
      if (Array.isArray(res.transactions)) this.transactions = res.transactions as Transaction[];
      if (Array.isArray(src.data) && src.data[0]?.merchant) this.transactions = src.data as Transaction[];
      // categories → si vienen como transactions agregadas
      if (Array.isArray(res.categories) && res.categories.length && !this.transactions.length) {
        // no pisa si ya hay txns mock, solo si está vacío
      }
    },

    hydrateRecommendationResource(resource: any) {
      if (!resource || typeof resource !== "object") return;
      const rec = resource.recommendation;
      const rat = resource.rationale;
      const proj = resource.projection;
      const disc = resource.discretionary;
      const agentLog = resource.agent_log;

      // Dashboard: allocation.to_vault_mxn → recommendedAfore
      if (rec?.allocation && typeof rec.allocation.to_vault_mxn === "number") {
        this.metrics.recommendedAfore = rec.allocation.to_vault_mxn;
      }
      // capacity y leak recoverable
      if (rec?.allocation && typeof rec.allocation.leak_recoverable_mxn === "number") {
        this.analyze.leakAmount = rec.allocation.leak_recoverable_mxn;
      }
      if (rat?.tokens && typeof rat.tokens.leak_total === "number") {
        // si no hay leakAmount de allocation, usa tokens
        if (!this.analyze.leakAmount) this.analyze.leakAmount = rat.tokens.leak_total;
      }

      // Proyección AFORE
      if (proj) {
        if (typeof proj.without_agent_mxn === "number") this.aforeProjection.withoutAgent = proj.without_agent_mxn;
        if (typeof proj.with_agent_mxn === "number") this.aforeProjection.withAgent = proj.with_agent_mxn;
      }

      // Discretionary → métrica leaksDetected para ActionCard
      if (Array.isArray(disc)) {
        // cuenta solo los no ambiguos o todos? usa total para badge
        this.analyze.leaksDetected = disc.length;
      }

      // Guarda resource completo para ConsoleLogs
      this.analyze.recommendationResource = resource;

      // Agent log del modelo → consola
      if (Array.isArray(agentLog)) {
        agentLog.forEach((l: any) => {
          const flag = l.used_llm ? " [LLM]" : "";
          this.agentLogs.push(`AGENT[${l.step}]${flag}: ${l.detail}${l.ms != null ? ` (${l.ms}ms)` : ""}`);
        });
      }
    },

    async fetchAnalyzeAndRecommendations() {
      // Asegura token de sesión logueada antes de pedir /analyze (evita 401)
      const auth = useAuthStore();
      if (!auth.token) auth.init();
      if (!(auth as any).token && import.meta.client) {
        const ck = useCookie<string | null>("auth_token").value || localStorage.getItem("auth_token");
        if (ck) (auth as any).token = ck;
      }
      const a = this.ensureAnalyze();
      const { startDate, endDate, rawStart, rawEnd } = this.getAnalyzeRange(true);
      a.startDate = startDate;
      a.endDate = endDate;
      a.rawStart = rawStart;
      a.rawEnd = rawEnd;
      a.loading = true;
      a.error = "";
      a.recommendations = [];
      try {
        const { analyze, getAnalyzeRecommendation } = useFinancialApi();
        const analyzeRes: any = await analyze({ startDate, endDate });
        a.lastAnalyze = analyzeRes;
        // Hidrata dashboard con todo lo de /analyze
        this.hydrateAnalyze(analyzeRes);
        const msg = analyzeRes?.message || analyzeRes?.msg || "Transacciones analizadas de manera exitosa.";
        this.agentLogs.push(`ANALYZE: ${startDate} → ${endDate} :: ${msg}`);

        let recRes: any = null;
        try {
          recRes = await getAnalyzeRecommendation() as any;
        } catch (e: any) {
          // Si /recommendation falla, no rompas todo el flujo de dashboard
          console.warn("[getAnalyzeRecommendation] no disponible", e);
          recRes = null;
        }

        // Caso principal: { message, status, resource: { recommendation, rationale, discretionary, projection, agent_log } }
        if (recRes?.resource && typeof recRes.resource === "object") {
          const resource = recRes.resource;
          this.hydrateRecommendationResource(resource);
          // Recommendations para compatibilidad: usa discretionary como lista
          const disc = Array.isArray(resource.discretionary) ? resource.discretionary : [];
          a.recommendations = disc as any;
          // Log narrativa principal
          const narrative = resource.rationale?.narrative_es || resource.rationale?.narrative_en;
          if (narrative) this.agentLogs.push(`RECOMMENDATION: ${narrative}`);
          // Log allocation
          const alloc = resource.recommendation?.allocation;
          if (alloc) this.agentLogs.push(`ALLOCATION: to_vault $${alloc.to_vault_mxn} MXN (reason: ${alloc.reason_key}, confidence: ${resource.recommendation?.confidence ?? "-"})`);
          return { analyzeRes, recommendations: disc, resource };
        }

        // Fallbacks legacy: array directo | {recommendations} | {data} | {result} | null
        let recs: any[] = [];
        if (Array.isArray(recRes)) recs = recRes;
        else if (Array.isArray(recRes?.recommendations)) recs = recRes.recommendations;
        else if (Array.isArray(recRes?.data)) recs = recRes.data;
        else if (Array.isArray(recRes?.result)) recs = recRes.result;
        else if (recRes && typeof recRes === "object" && Object.keys(recRes).length) recs = [recRes];

        a.recommendations = recs as any;
        // Guarda fallback también como resource si no había resource
        if (recRes && !a.recommendationResource) a.recommendationResource = recRes;
        // Vuelca recomendaciones del modelo al log (Consola)
        recs.forEach((r: any, i: number) => {
          const text = typeof r === "string" ? r : r.message || r.description || r.title || r.recommendation || JSON.stringify(r);
          this.agentLogs.push(`RECOMMENDATION ${i + 1}: ${text}`);
        });
        return { analyzeRes, recommendations: recs };
      } catch (e: any) {
        const msg = e?.data?.message || e?.statusMessage || e?.message || "Error en analyze";
        a.error = msg;
        this.agentLogs.push(`ANALYZE ERROR: ${msg}`);
        return null;
      } finally {
        a.loading = false;
      }
    },
  },
});
