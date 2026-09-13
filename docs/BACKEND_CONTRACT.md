# Contrato Backend ↔ Frontend — AlcancIA

**Base URL**: `BANK_API_BASE_URL` → `https://mlh-hackaton-app-backend.onrender.com/api/v1`  
**Auth**: Header `Authorization: Bearer <authToken>` + `authToken: <authToken>` (compat) + `x-api-key` opcional.  
**Proxy Nuxt**: Frontend llama a `/api/*` (server/api/*) que reenvía al backend con el token en cookie `auth_token`.

---

## 1. Auth (ya implementado)

| Método | Ruta | Body | Respuesta |
|---|---|---|---|
| POST | `/auth/login` | `{ username, password }` | `{ authToken: string }` |
| POST | `/auth/register` | `{ username, password }` | `{ authToken: string }` |

Frontend: `app/stores/auth.ts:login()` → `POST /api/auth/login` → `server/api/auth/login.post.ts` → `${BANK}/auth/login`

---

## 2. Dashboard — `pages/index.vue`

**Componentes**: `Greeting` + `DashboardMetricCards` + `AgentActionCard` + `DashboardProjectionChart` + `AgentConsoleLogs`

**Request frontend**:
```ts
GET /api/dashboard
Header: Authorization: Bearer <token>
```
→ proxy `server/api/dashboard.get.ts` → `GET ${BANK}/dashboard`

**Response esperada** (`app/types/api.ts:DashboardResponse`):
```json
{
  "user": { "name": "Sofía", "age": 26, "retirementAge": 65, "customerId": "e96df8a9..." },
  "metrics": {
    "income": 25000,
    "fixedExpenses": 12000,
    "safeToSave": 1850,
    "recommendedAfore": 500,
    "creditScore": 740
  },
  "aforeProjection": { "withoutAgent": 1100000, "withAgent": 2425000 },
  "agent": {
    "logs": ["Connected to Capital One Nessie API stream...", "Safe-to-Save limit established at $1,850 MXN."],
    "leaksDetected": 3,
    "leakAmount": 840
  }
}
```
Mapeo: `MetricCards` usa `metrics.safeToSave / metrics.income` → `savingsRate`, `solvencyPct`. `ActionCard` usa `metrics.recommendedAfore` + `aforeProjection.gain` + `agent.leakAmount`. `ProjectionChart/GraphCard` usa `aforeProjection` + `user.retirementAge`.

**Mock actual**: `app/stores/financialStore.ts:26-42`

---

## 3. History / Movimientos — `pages/history.vue`

**Request**:
```ts
GET /api/transactions?limit=50&offset=0&category=food_delivery&isLeak=true
```
→ `server/api/transactions.get.ts` → `GET ${BANK}/transactions?...`

**Response** (`HistoryResponse`):
```json
{
  "transactions": [
    {
      "id": "1",
      "merchant": "UBER EATS",
      "amount": -427,
      "category": "food_delivery",
      "timestamp": "2026-09-11T20:30:00Z",
      "description": "Uber Eats · comida a domicilio",
      "isLeak": true,
      "medium": "balance",
      "status": "completed",
      "createdAt": "2026-09-11T20:30:00Z"
    }
  ],
  "total": 42,
  "leaks": 5
}
```
`category` valores: `food_delivery|subscriptions|income|convenience|coffee` (traducidos en `app.config.ts:category`). `medium`: `balance|checking|savings|creditCard`. `status`: `completed|pending|cancelled`. Frontend hace `GET /api/transactions/:id` para detalle modal.

---

## 4. Analytics / Flujo — `pages/analytics.vue`

**Request**: `GET /api/analytics` → `server/api/analytics.get.ts` → `GET ${BANK}/analytics`

**Response** (`AnalyticsResponse`):
```json
{
  "summary": {
    "income": 25000,
    "fixedExpenses": 12000,
    "variableExpenses": 646,
    "totalExpenses": 12646,
    "net": 12354
  },
  "breakdown": [
    { "key": "housing", "label": "Vivienda / Renta", "amount": 12000, "sharePct": 85, "hasLeak": false },
    { "key": "food", "label": "Comida / Delivery", "amount": 427, "sharePct": 3, "hasLeak": true },
    { "key": "subs", "label": "Suscripciones", "amount": 219, "sharePct": 2, "hasLeak": false }
  ],
  "solvency": { "savingsRate": 0.074, "goalRate": 0.2, "pct": 37, "hint": "Meta recomendada: ahorrar el 20%..." },
  "aforeProjection": { "withoutAgent": 1100000, "withAgent": 2425000 }
}
```
Si backend no quiere calcular `sharePct`, frontend lo deriva `amount/totalExpenses`. `solvency.pct = min(100, savingsRate/goalRate*100)`.

---

## 5. Savings / Cajita — `pages/saving.vue`

**Unica cajita principal** (ya migrado de array `cajitas`).

**Requests**:
```ts
GET  /api/savings/cajita              → { cajita, summary }
POST /api/savings/cajita/deposit  { amount: 500 }
POST /api/savings/cajita/withdraw { amount: 500 }
```
Proxies: `server/api/savings/cajita.get.ts`, `.../deposit.post.ts`, `.../withdraw.post.ts` → `${BANK}/savings/cajita*`

**Response `GET`** (`SavingsResponse`):
```json
{
  "cajita": { "id": "c1", "title": "Cajita Afore", "icon": "i-heroicons-sparkles", "balance": 12500, "goal": 20000, "yieldRate": 0.145, "earnedYield": 412.5 },
  "summary": { "totalBalance": 12500, "totalYield": 412.5, "yieldRate": 0.145, "availability": "24/7 Inmediata" }
}
```
**Response `POST`** (`SavingsOperationResponse`):
```json
{ "cajita": { "...actualizada" }, "message": "Depósito exitoso" }
```
Validación: `amount > 0` y `withdraw amount <= balance`. Store ya hace `fetchCajita()` en `onMounted` y usa `depositToCajitaRemote()` con fallback optimista.

---

## 6. AFORE Contribute — `components/agent/ActionCard.vue`

**Request**: `POST /api/afore/contribute { amount: 500 }` → `server/api/afore/contribute.post.ts` → `POST ${BANK}/afore/contribute`

**Response** (`AforeContributeResponse`):
```json
{ "success": true, "newCreditScore": 755, "logs": ["ACTION: $500 MXN redirected..."] }
```
Frontend actualiza `metrics.creditScore` y `executed=true`. Fallback local hace `+15 pts`.

---

## 7. User — `components/layout/UserProfileDrawer.vue`, `MobileHeader`

**Request**: `GET /api/user` → `server/api/user.get.ts` → `GET ${BANK}/user`

**Response** (`UserDTO`):
```json
{
  "name": "Sofía González",
  "age": 26,
  "retirementAge": 65,
  "customerId": "e96df8a9-433b-4f53-91db-fb19def43c07",
  "address": { "street_name": "Av arturo B", "street_number": "528", "city": "San Nicolas", "state": "Nuevo Leon", "zip": "66414" },
  "avatar": "https://api.dicebear.com/9.x/notionists/svg?seed=Sofia"
}
```

---

## 8. Uso en código (frontend listo)

```ts
// cualquier página
const store = useFinancialStore()
await store.fetchDashboard()      // → GET /api/dashboard
await store.fetchTransactions()   // → GET /api/transactions
await store.fetchAnalytics()      // → GET /api/analytics
await store.fetchCajita()         // → GET /api/savings/cajita
await store.depositToCajitaRemote(500)
await store.withdrawFromCajitaRemote(300)
await store.contributeAforeRemote(500)

// composable directo
const { getDashboard, getTransactions } = useFinancialApi()
const { apiFetch } = useApi() // genérico con auth headers
```

Si el backend aún no implementa un endpoint, el `catch` en `financialStore` mantiene los mocks y loguea `warn` — la app no se rompe.

---

## 9. Qué necesita implementar el backend (checklist)

- [ ] `GET /dashboard` devuelve `DashboardResponse` (user+metrics+projection+agent)
- [ ] `GET /transactions` con query `limit|offset|category|isLeak|status`
- [ ] `GET /transactions/:id`
- [ ] `GET /analytics` devuelve `AnalyticsResponse`
- [ ] `GET /savings/cajita`
- [ ] `POST /savings/cajita/deposit` y `/withdraw`
- [ ] `POST /afore/contribute`
- [ ] `GET /user`
- Todos validados con `authToken`, retornando JSON con los campos exactos tipados en `app/types/api.ts`.

