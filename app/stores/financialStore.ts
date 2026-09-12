import { defineStore } from "pinia";

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
  }),
  actions: {
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
  },
});
