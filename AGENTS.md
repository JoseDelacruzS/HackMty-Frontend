# Agent Directive: AutoAfore Agent (PWA Mobile-First)

Documento operativo para agentes AI/IDE que trabajen en este repo. La spec original del hackathon (brief) está en la sección "Agent Directive" histórica al final — es referencia, no contrato. El contrato vivo está en `README.md` y en el código.

---

## 0. Convenciones duras (no negociables)

1. **No hardcodear colores Tailwind** (`bg-slate-*`, `text-teal-*`, `from-indigo-*`, anillos `ring-teal-*`, etc.). Usar siempre los tokens semánticos de Nuxt UI: `bg-default`, `bg-muted`, `bg-elevated`, `text-highlighted`, `text-toned`, `text-muted`, `text-dimmed`, `border-default`, `border-muted`, `text-primary`, `text-secondary`, `text-success`, `text-info`, `text-warning`, `text-error`.
2. **No añadir CSS custom en `@layer base`** ni reglas globales en `app/assets/css/main.css` salvo que se pida. El tema vive en `app/app.config.ts`.
3. **No usar `dark:` ni colores literales en componentes.** El tema se controla desde `app.config.ts` y los `defaultVariants` de cada componente Nuxt UI.
4. **Respetar `app.config.ts` como está.** Colores actuales: `primary: "emerald"`, `neutral: "mist"`. Si un componente necesita `secondary`/`success`/`error`, **primero** añadirlos a `app.config.ts.ui.colors` y **después** usarlos.
5. **Componentes Nuxt UI v4**:
   - `UProgress` → prop `model-value` (no `value`). Sin valor = estado indeterminate (carrusel infinito). Casi siempre es un bug.
   - `UModal`/`UPopover`/`UTooltip` → `v-model:open`.
   - Iconos `i-heroicons-*` funcionan via `@nuxt/icon` (incluido en `@nuxt/ui` v4). No instalar nada extra.
6. **No usar emojis** salvo que el usuario los pida explícitamente.
7. **No crear archivos de documentación** (`*.md`, `README`, etc.) salvo que se pida.

---

## 1. Arquitectura y flujo de la app

```
[Pages]            → composición visual + onMounted
[Components]       → UI pura, leen store con useFinancialStore()
[Composables]      → useAgentEngine: orquesta efectos (setInterval)
[Store / Pinia]    → única fuente de verdad reactiva
[main.css]         → tokens semánticos de tema (dark por default)
[app.config.ts]    → defaults de variantes de Nuxt UI
```

### Bootstrapping del stream

1. `app.vue` monta `UApp > NuxtLayout > NuxtPage`.
2. `pages/index.vue` ejecuta `onMounted(() => useAgentEngine().start())`.
3. `useAgentEngine` setea `setInterval(emitOne, 15000)` solo en cliente (`import.meta.client`).
4. Cada `emitOne` toma una txn del pool mock, le añade `id` + `timestamp`, llama `store.addLiveTransaction()`.
5. La store la `unshift`-ea en `transactions` y, si `isLeak`, apila un log en `agentLogs`.
6. `ConsoleLogs.vue` observa `store.agentLogs.length` y hace `scrollTo` suave al fondo.

### Layout nativo fijo (`app/layouts/default.vue`)

```
┌─────────────────────────────────────────┐ ← bg-muted (fuera del shell)
│  ┌───────────────────────────────────┐  │
│  │ header (sticky top-0)             │  │  z-30, shrink-0
│  │  <LayoutMobileHeader />           │  │  - avatar Sofía
│  │                                   │  │  - badge Live (dot pulsante)
│  ├───────────────────────────────────┤  │
│  │                                   │  │
│  │  <div class="flex-1 min-h-0       │  │  ÚNICA zona con scroll
│  │           overflow-y-auto">       │  │  (overscroll-contain)
│  │    <slot />                       │  │  - pages/index.vue
│  │    <slot />                       │  │  - pages/history.vue
│  │    <slot />                       │  │  - pages/credit.vue
│  │  </div>                           │  │
│  │                                   │  │
│  ├───────────────────────────────────┤  │
│  │  nav (sticky bottom-0)            │  │  z-30, shrink-0
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

| Ruta       | Layout    | Qué muestra                                                                                                         |
| ---------- | --------- | ------------------------------------------------------------------------------------------------------------------- |
| `/`        | `default` | Greeting + `MetricCards` + `ActionCard` + `ProjectionChart` + `ConsoleLogs`                                         |
| `/history` | `default` | Lista de `store.transactions` con `UAvatar` por categoría, badge "Fuga" en `isLeak`, contador de fugas en el header |
| `/credit`  | `default` | `UMeter` (gauge) del score, desglose de cómo se calcula, CTA para ir a aportar                                      |
| `/login`   | `auth`    | `UAuthForm` con email + password, navega a `/` al validar                                                           |

### Componentes

| Componente          | Lee de store                                              | Mutaciones                                 |
| ------------------- | --------------------------------------------------------- | ------------------------------------------ |
| `MetricCards`       | `metrics.safeToSave`, `metrics.creditScore`               | —                                          |
| `ActionCard`        | `metrics.recommendedAfore`, `aforeProjection`, `executed` | `applyAforeContribution()`                 |
| `ProjectionChart`   | `aforeProjection`, `user.retirementAge`                   | —                                          |
| `ConsoleLogs`       | `agentLogs` (auto-scroll)                                 | —                                          |
| `pages/history.vue` | `transactions`                                            | — (los nuevos vienen por `useAgentEngine`) |
| `pages/credit.vue`  | `metrics.creditScore`, `metrics.*`                        | —                                          |

### Mutaciones de la store

| Acción                           | Trigger                             | Efecto                                                  |
| -------------------------------- | ----------------------------------- | ------------------------------------------------------- |
| `applyAforeContribution(amount)` | Botón "Reasignar $X a mi AFORE"     | `executed = true`, `creditScore += 15`, dos logs nuevos |
| `addLiveTransaction(txn)`        | `useAgentEngine.emitOne()` cada 15s | `unshift` en `transactions`, log si es `isLeak`         |

---

## 2. Tech Stack

- **Framework**: Nuxt 4 (`app/` es el source dir).
- **UI**: Nuxt UI v4 + Tailwind v4.
- **Iconos**: `i-heroicons-*` via `@nuxt/icon` (incluido en `@nuxt/ui`).
- **Estado**: Pinia (`@pinia/nuxt`).
- **PWA**: `@vite-pwa/nuxt` activo (`registerType: autoUpdate`, manifiesto `AutoAfore`, iconos en `public/icons/`). Al añadir rutas/páginas, el precache de Workbox las incluye solo (ver `globPatterns` en `nuxt.config.ts`).

---

## 3. Estructura del proyecto

```text
Frontend/
├── app/
│   ├── app.vue                       # <UApp> + <NuxtLayout> + <NuxtPage>
│   ├── app.config.ts                 # Tema Nuxt UI (emerald/mist, soft/subtle)
│   ├── assets/css/main.css           # Tailwind v4 + @import "@nuxt/ui" + overrides dark
│   ├── layouts/
│   │   ├── default.vue               # Shell móvil (header sticky + nav fijo)
│   │   └── auth.vue                  # Shell sin nav (login)
│   ├── components/
│   │   ├── layout/MobileHeader.vue   # Avatar + badge Live Stream + btn notificaciones
│   │   ├── dashboard/MetricCards.vue # Safe-to-Save™ + Credit Score con UProgress
│   │   ├── dashboard/ProjectionChart.vue  # Barras comparativas (con/sin agente) + UAlert
│   │   ├── agent/ActionCard.vue      # Recomendación 1-click ($500 MXN → AFORE)
│   │   └── agent/ConsoleLogs.vue     # UAccordion + terminal con auto-scroll
│   ├── composables/
│   │   └── useAgentEngine.ts         # Mock del stream Nessie (setInterval client-only)
│   ├── pages/
│   │   ├── index.vue                 # Dashboard / feed de acciones
│   │   ├── history.vue               # Stream de transacciones + badge "Fuga"
│   │   ├── credit.vue                # Perfil crediticio (UMeter gauge)
│   │   └── login.vue                 # UAuthForm (layout: auth)
│   └── stores/
│       └── financialStore.ts         # Estado Pinia + datos sintéticos (Sofía, MXN)
├── nuxt.config.ts
├── package.json
└── README.md
```

---

## 4. Cómo extender (recetas)

### Añadir un nuevo color al tema

1. Editar `app/app.config.ts.ui.colors`: añadir `secondary: "indigo"` (o el que toque).
2. Ya puedes usar `color="secondary"`, `text-secondary`, `bg-secondary`, etc.

### Añadir una nueva página

1. Crear `app/pages/foo.vue`.
2. Si debe llevar bottom nav, no tocar `app/layouts/default.vue` — Nuxt ya lo aplica por convención.
3. Si debe ir sin nav (ej. onboarding), usar `definePageMeta({ layout: 'auth' })`.

### Añadir un componente nuevo

1. Crear en `app/components/<area>/<Name>.vue`.
2. Se auto-importa como `<Area><Name>` (`<DashboardFoo>`, `<AgentBar>`, `<LayoutBaz>`).
3. Usar **solo** tokens semánticos + props de Nuxt UI.

### Conectar el stream real a Nessie

1. Reemplazar el cuerpo de `useAgentEngine.start()` por una subscripción SSE/REST.
2. Mantener la firma: `start()` / `stop()` / `emitOne()`.
3. `useAgentEngine` solo se llama desde `onMounted` en `pages/index.vue`, así que el ciclo de vida ya está cubierto.

---

## 5. Setup y comandos

```bash
pnpm install
pnpm dev       # http://localhost:3000
pnpm build
pnpm preview
```

`postinstall` corre `nuxt prepare`. Sin tests, lint ni CI por ahora.

---

## 6. Roadmap (no implementado)

- Onboarding / app tour: explicar en el primer uso Safe-to-Save™, fugas, aportación AFORE y solvencia (pendiente de diseño e implementación).
- Conexión real a Nessie API (hoy es `setInterval` mockeado).
- Persistencia offline de datos (el SW ya hace precache del app-shell; falta guardar txns/estado).
- Notificaciones push al detectar fuga.
- Multi-cuenta / onboarding de AFORE real.

---

# Agent Directive: AutoAfore Agent (PWA Mobile-First) — spec original del brief

> **Referencia histórica.** La spec del brief está abajo. El contrato vivo es todo lo de arriba de este separador.

## Project Overview & Goal

Build the base architecture and mobile-first UI for **AutoAfore Agent**, an autonomous financial agent for Capital One's Hackathon (Track 1: B2C Financial Autonomy & Credit Building).

The app converts raw transaction streams into automated voluntary AFORE contributions and cash-flow credit scoring.

## Tech Stack Requirements

- **Framework:** Nuxt 3 (SSR/SPA Mobile Layout)
- **UI Library:** Nuxt UI v4 + Tailwind CSS
- **Icons:** `@nuxt/icon` or Lucide icons via Nuxt UI
- **State Management:** Pinia (Memory & Mock Sync)
- **Design Target:** Mobile Viewport Only (`max-w-md` centered on desktop for testing, native app feel on mobile).
- **Scope Note:** OFFLINE MODE / PWA STORAGE IS EXCLUDED. Focus purely on UI/UX, API consumption, and real-time streaming reactivity.
