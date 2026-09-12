import type { Transaction } from "~/stores/financialStore";
import { useFinancialStore } from "~/stores/financialStore";

const MOCK_POOL: Array<Omit<Transaction, "id" | "timestamp">> = [
  { merchant: "RAPPI", amount: -312, category: "food_delivery", isLeak: true },
  { merchant: "OXXO", amount: -145, category: "convenience", isLeak: false },
  {
    merchant: "SPOTIFY",
    amount: -129,
    category: "subscriptions",
    isLeak: false,
  },
  { merchant: "STARBUCKS", amount: -95, category: "coffee", isLeak: true },
];

/** Mock del stream Nessie: emite una transacción sintética cada N segundos. */
export function useAgentEngine(intervalMs = 15000) {
  const store = useFinancialStore();
  let timer: ReturnType<typeof setInterval> | null = null;
  let counter = 0;

  function emitOne() {
    const tpl = MOCK_POOL[counter % MOCK_POOL.length]!;
    counter += 1;
    store.addLiveTransaction({
      ...tpl,
      id: `live-${Date.now()}`,
      timestamp: new Date().toISOString(),
    });
  }

  function start() {
    if (timer || !import.meta.client) return;
    store.agentLogs.push("Live Nessie mock stream started.");
    timer = setInterval(emitOne, intervalMs);
  }

  function stop() {
    if (timer) clearInterval(timer);
    timer = null;
  }

  onBeforeUnmount(stop);

  return { start, stop, emitOne };
}
