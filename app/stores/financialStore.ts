import { defineStore } from "pinia";
import type { DashboardResponse, HistoryResponse, AnalyticsResponse, SavingsResponse } from "~/types/api";

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
  },
});
