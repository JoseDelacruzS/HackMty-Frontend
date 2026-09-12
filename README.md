# AutoAfore Agent — Frontend

Agente financiero autónomo para **HackMTY 2026 (Capital One Track 1: B2C Financial Autonomy & Credit Building)**. Convierte el stream de transacciones en aportaciones voluntarias AFORE y scoring crediticio por flujo de caja. Maqueta mobile-first con datos sintéticos.

> Documento operativo para agentes AI/IDE: `AGENTS.md`.
> Documento histórico de directivas iniciales del hackathon: la sección "Agent Directive" del propio `AGENTS.md` (es la spec original del brief).

---

## Stack

| Capa | Tecnología | Notas |
|------|-----------|-------|
| Framework | Nuxt 4 (`app/` como source dir) | SPA / SSR friendly |
| UI | Nuxt UI v4 | Componentes `UCard`, `UButton`, `UBadge`, `UProgress`, `UMeter`, `UAlert`, `UAccordion`, `UAvatar`, `UIcon` |
| Estilos | Tailwind v4 + tokens semánticos de Nuxt UI | Solo `bg-default`/`text-muted`/`text-highlighted`/`border-default` |
| Iconos | Heroicons via `UIcon` (`i-heroicons-*`) | Auto-import desde `@nuxt/icon` (incluido en `@nuxt/ui`) |
| Estado | Pinia (`@pinia/nuxt`) | Una sola store: `useFinancialStore` |
| PWA | `@vite-pwa/nuxt` | Desactivado por scope; instalado pero sin service worker activo |

---

## Setup

```bash
pnpm install
pnpm dev       # http://localhost:3000
pnpm build
pnpm preview
```

`postinstall` corre `nuxt prepare` (regenera `.nuxt/`, gitignored).

Sin tests, lint ni CI por ahora. Verificar build con `pnpm build`.

---

## Estructura

```text
app/
├── app.vue                          # <UApp> + <NuxtLayout> + <NuxtPage>
├── app.config.ts                    # Tema Nuxt UI (primary: emerald, neutral: mist, soft/subtle)
├── assets/css/main.css              # Tailwind v4 + @import "@nuxt/ui" + overrides dark
├── layouts/
│   ├── default.vue                  # Shell móvil con header sticky + bottom-nav fijo
│   └── auth.vue                     # Shell sin nav (login)
├── components/
│   ├── layout/MobileHeader.vue      # Avatar + badge Live Stream + btn notificaciones
│   ├── dashboard/MetricCards.vue    # Safe-to-Save™ + Credit Score con UProgress
│   ├── dashboard/ProjectionChart.vue# Barras comparativas (con/sin agente) + UAlert
│   ├── agent/ActionCard.vue         # Recomendación 1-click ($500 MXN → AFORE)
│   └── agent/ConsoleLogs.vue        # UAccordion + terminal con auto-scroll
├── composables/useAgentEngine.ts    # Mock del stream Nessie (setInterval client-only)
├── pages/
│   ├── index.vue                    # Dashboard / feed de acciones
│   ├── history.vue                  # Stream de transacciones + badge "Fuga"
│   ├── credit.vue                   # Perfil crediticio (UMeter gauge)
│   └── login.vue                    # UAuthForm (layout: auth)
└── stores/financialStore.ts         # Estado Pinia + datos sintéticos (Sofía, MXN)
```

---

## Flujo de la app

```
┌─────────────────────────────────────────────────────────────┐
│                       App.vue                               │
│  <UApp> → <NuxtLayout> → <NuxtPage>                         │
└─────────────────────────────────────────────────────────────┘
                              │
                ┌─────────────┴─────────────┐
                │                           │
        pages/login.vue               pages/index.vue
        (layout: auth)                (layout: default)
                                            │
            ┌───────────────────────────────┼───────────────────────────────┐
            │                               │                               │
    pages/history.vue                pages/credit.vue                       │
                                    (también default)                        │
```

### Capas y responsabilidades

```
[Pages]            → composición visual + onMounted
[Components]       → UI pura, leen store con useFinancialStore()
[Composables]      → useAgentEngine: orquesta efectos (setInterval)
[Store / Pinia]    → única fuente de verdad reactiva
[main.css]         → tokens semánticos de tema (dark por default)
[app.config.ts]    → defaults de variantes de Nuxt UI
```

### Bootstrapping del stream

1. `app.vue` monta `NuxtLayout > NuxtPage`.
2. En `index.vue`, `onMounted` llama `useAgentEngine().start()`.
3. `useAgentEngine` setea un `setInterval(emitOne, 15000)` solo en cliente (`import.meta.client`).
4. Cada `emitOne` saca una txn del pool mock, le pone `id` + `timestamp` y llama `store.addLiveTransaction()`.
5. La store la `unshift`-ea en `transactions` y, si es `isLeak`, apila un log en `agentLogs`.
6. `ConsoleLogs.vue` observa `store.agentLogs.length` y hace auto-scroll al fondo.

### Layout nativo fijo (`app/layouts/default.vue`)

```
┌─────────────────────────────────────────┐ ← bg-muted (fuera del shell)
│  ┌───────────────────────────────────┐  │
│  │ header (sticky top-0)            │  │  z-30, shrink-0
│  │  <LayoutMobileHeader />           │  │  - avatar Sofía
│  │                                   │  │  - badge Live (dot pulsante)
│  ├───────────────────────────────────┤  │
│  │                                   │  │
│  │  <div class="flex-1 min-h-0      │  │  ÚNICA zona con scroll
│  │           overflow-y-auto">      │  │  (overscroll-contain)
│  │    <slot />                       │  │  - pages/index.vue
│  │    <slot />                       │  │  - pages/history.vue
│  │    <slot />                       │  │  - pages/credit.vue
│  │  </div>                           │  │
│  │                                   │  │
│  ├───────────────────────────────────┤  │
│  │  nav (sticky bottom-0)           │  │  z-30, shrink-0
│  │  Dashboard · Movimientos · Crédito│  │  grid-cols-3, NuxtLink
│  └───────────────────────────────────┘  │  active = text-primary bg-primary/10
│                                         │
└─────────────────────────────────────────┘
```

- **Altura**: `h-dvh` en móvil, `h-[844px] sm:max-h-[90vh]` en desktop.
- **Header + nav**: `shrink-0` para que el scroll del medio consuma el resto.
- **Scroll único**: el wrapper del `<slot />` es el único `overflow-y-auto` de la app, evita doble scroll.
- **Bottom nav**: `sticky bottom-0` con `pb-[env(safe-area-inset-bottom)]` para gesture bar de iOS.
- **Active state**: computa `route.path === item.to` y aplica `text-primary bg-primary/10`.

### Páginas

| Ruta | Layout | Qué muestra |
|------|--------|-------------|
| `/` | `default` | Greeting + `MetricCards` + `ActionCard` + `ProjectionChart` + `ConsoleLogs` |
| `/history` | `default` | Lista de `store.transactions` con `UAvatar` por categoría, badge "Fuga" en `isLeak`, contador de fugas en el header |
| `/credit` | `default` | `UMeter` (gauge) del score, desglose de cómo se calcula, CTA para ir a aportar |
| `/login` | `auth` | `UAuthForm` con email + password, navega a `/` al validar |

### Componentes

| Componente | Lee de store | Mutaciones |
|------------|-------------|------------|
| `MetricCards` | `metrics.safeToSave`, `metrics.creditScore` | — |
| `ActionCard` | `metrics.recommendedAfore`, `aforeProjection`, `executed` | `applyAforeContribution()` |
| `ProjectionChart` | `aforeProjection`, `user.retirementAge` | — |
| `ConsoleLogs` | `agentLogs` (auto-scroll) | — |
| `history.vue` | `transactions` | — (los nuevos vienen por `useAgentEngine`) |
| `credit.vue` | `metrics.creditScore`, `metrics.*` | — |

### Mutaciones de la store

| Acción | Trigger | Efecto |
|--------|---------|--------|
| `applyAforeContribution(amount)` | Botón "Reasignar $X a mi AFORE" | `executed = true`, `creditScore += 15`, dos logs nuevos |
| `addLiveTransaction(txn)` | `useAgentEngine.emitOne()` cada 15s | `unshift` en `transactions`, log si es `isLeak` |

### Tokens de tema (respetar al añadir UI)

- **NO** hardcodear colores Tailwind (`bg-slate-*`, `text-teal-*`, `from-indigo-*`, etc.).
- **SÍ** usar tokens semánticos de Nuxt UI: `bg-default`, `bg-muted`, `bg-elevated`, `text-highlighted`, `text-toned`, `text-muted`, `text-dimmed`, `border-default`, `border-muted`, `ring-default`, `text-primary`, `text-secondary`, `text-success`, `text-info`, `text-warning`, `text-error`.
- Colores en `app.config.ts`: `primary: "emerald"`, `neutral: "mist"`. Si necesitas `secondary`/`success`/`error` en componentes, añádelos ahí primero.

### Componentes Nuxt UI — gotchas v4

- `UProgress` usa `model-value` (no `value`). Sin valor → estado indeterminate (animación carrusel infinita).
- `UModal`/`UPopover`/`UTooltip`: usa `v-model:open`.
- Iconos `i-heroicons-*` requieren `@nuxt/icon` (ya viene dentro de `@nuxt/ui` v4).
- Auto-imports: no hace falta importar `UCard`, `UButton`, etc. manualmente.

---

## Flujo demo (para judges)

1. Abrir `/` → ver Safe-to-Save™ ($1,850), score (740 pts) y recomendación de $500 MXN.
2. Click **"Reasignar $500 MXN a mi AFORE"** → `executed = true`, score sube a 755, dos logs en la consola.
3. Ir a **Movimientos** → ver fugas marcadas; cada ~15s entra una txn mock del stream.
4. Ir a **Crédito** → ver el `UMeter` con el score actual y el desglose.
5. En el header, el badge **Live** pulsa mientras el stream está activo.

---

## Convenciones

- Componentes en `app/components/<area>/<Name>.vue` — auto-import con prefijo del área (`<Area><Name>` → `DashboardMetricCards`, `AgentActionCard`, etc.).
- Stores en `app/stores/*.ts` — auto-import del composable `useXxxStore()`.
- Composables en `app/composables/*.ts` — auto-import del composable.
- Idioma de UI: español (es-MX). Logs del agente: inglés.
- Moneda: MXN, formato `$X,XXX`.

---

## Roadmap (no implementado)

- Onboarding / app tour: explicar en el primer uso Safe-to-Save™, fugas, aportación AFORE y solvencia (pendiente de diseño e implementación).
- Conexión real a Nessie API (hoy es `setInterval` mockeado).
- Persistencia offline (PWA desactivado por scope del hackathon).
- Notificaciones push al detectar fuga.
- Multi-cuenta / onboarding de AFORE real.
