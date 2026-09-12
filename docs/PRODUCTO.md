# AutoAfore Agent — Documento de Producto

## 1. Qué es

**AutoAfore Agent** es una aplicación móvil (PWA instalable) que convierte el flujo de transacciones bancarias del usuario en **aportaciones voluntarias a su AFORE** y en un **perfil de solvencia por flujo de caja**. Un agente autónomo observa el stream de movimientos en tiempo real, detecta fugas de gasto, calcula cuánto se puede ahorrar sin reducir el estilo de vida y ejecuta la aportación con un solo toque.

## 2. Por qué existe

- La mayoría de los jóvenes ahorra $0 para el retiro porque "no sabe cuánto puede apartar".
- El gasto hormiga (delivery, suscripciones, compras impulsivas) se come el margen de ahorro sin que nadie lo señale.
- Los bancos evalúan crédito por historial, no por comportamiento: quien ahorra constante no recibe mejores condiciones.

AutoAfore cierra ese ciclo: **detecta → recomienda → aporta → valida solvencia**.

## 3. Para quién es

| Perfil | Qué obtiene |
|--------|-------------|
| **Ahorrador primerizo (18–30)** | Su primera aportación AFORE sin entender de finanzas: la app le dice cuánto y lo hace en 1 tap. |
| **Gastador por delivery/suscripciones** | Alertas de fuga con nombre y monto, y el equivalente proyectado a los 65 años si reasigna ese dinero. |
| **Usuario sin historial crediticio** | Un medidor de solvencia que premia el ahorro constante y abre la puerta a mejores servicios del banco. |
| **Usuario bilingüe ES/EN** | Toda la app opera en español e inglés con un conmutador siempre visible. |

---

## 4. Estructura del proyecto

```text
Frontend/
├── docs/
│   └── PRODUCTO.md               # Este documento
├── public/
│   ├── icons/                    # Iconos PWA 192/512 + maskable
│   ├── apple-touch-icon.png      # Icono iOS
│   ├── favicon.ico
│   └── robots.txt
├── app/
│   ├── app.vue                   # Raíz: <UApp> + idioma + layout + página
│   ├── app.config.ts             # Tema Nuxt UI + catálogo de traducciones ES/EN
│   ├── assets/css/main.css       # Tailwind v4, fuente y variables de marca
│   ├── layouts/
│   │   ├── default.vue           # Shell móvil: header fijo + zona de scroll + bottom nav
│   │   └── auth.vue              # Shell sin navegación (acceso)
│   ├── pages/                    # Pantallas (ver sección 5)
│   │   ├── login.vue             # Acceso
│   │   ├── index.vue             # Dashboard
│   │   ├── history.vue           # Movimientos
│   │   └── analytics.vue         # Análisis de flujo de caja
│   ├── components/
│   │   ├── layout/               # Header, notificaciones, perfil, ajustes
│   │   ├── dashboard/            # Tarjetas de métricas y proyección AFORE
│   │   └── agent/                # Recomendación 1-click y consola del agente
│   ├── composables/
│   │   ├── useAgentEngine.ts     # Motor del agente: consume el stream y emite eventos
│   │   └── useAppLocale.ts       # Idioma activo (ES/EN) con persistencia local
│   └── stores/
│       └── financialStore.ts     # Estado global: usuario, métricas, transacciones, logs
├── nuxt.config.ts                # Módulos, manifiesto PWA, Workbox, metas iOS/Android
└── package.json
```

**Capas y responsabilidades:**

- **Pages** → composición visual de cada pantalla y arranque de efectos.
- **Components** → UI pura; leen la store, no guardan estado propio de negocio.
- **Composables** → `useAgentEngine` orquesta el stream; `useAppLocale` resuelve el idioma.
- **Store (Pinia)** → única fuente de verdad reactiva de toda la app.
- **`app.config.ts`** → tema visual y diccionario completo de textos en español e inglés.
- **`nuxt.config.ts`** → configuración PWA (manifiesto, service worker, caché).

---

## 5. Pantallas

### 5.1. Acceso — `/login`

**Para qué es.** Puerta de entrada a la cuenta del usuario.

**Por qué existe.** Proteger los datos financieros y personalizar todo (nombre, stream, idioma) desde el primer segundo.

**A quién sirve.** A todo usuario que abre la app sin sesión.

**Qué muestra.**
- Marca AutoAfore y mensaje de bienvenida.
- Conmutador de idioma **ES/EN** siempre visible arriba del formulario.
- Campos de correo y contraseña con mostrar/ocultar contraseña.
- Botón de entrada y mensajes de error claros (correo inválido, contraseña corta, falla de acceso).

**Cómo funciona.** Valida el formulario en el dispositivo, muestra el error correspondiente sin recargar y, al autenticar, navega al Dashboard. El idioma elegido se guarda y aplica a toda la app al instante.

**Qué genera.** Sesión iniciada + preferencia de idioma persistida.

---

### 5.2. Dashboard — `/`

**Para qué es.** El centro de comando diario: salud del dinero y la acción que más importa hoy.

**Por qué existe.** El usuario abre la app 10 segundos; en ese tiempo debe responder: "¿cuánto puedo ahorrar?" y "¿qué hago?".

**A quién sirve.** Al ahorrador que quiere una instrucción clara, no gráficos que interpretar.

**Qué muestra.**
- Saludo personalizado ("¿Ahorramos hoy, {nombre}?").
- **Safe-to-Save™**: buffer libre disponible este mes con barra de nivel.
- **Tasa de ahorro**: % del ingreso que se está apartando, con avance hacia la meta del 20% y sello Cash-Flow Verified.
- **Recomendación del Agente**: cuánto detectó en fugas, cuánto reasignar a la AFORE, impacto proyectado a los 65 años y botón de aportación en 1 click.
- **Proyección AFORE**: comparativa con vs. sin agente y ganancia proyectada.
- **Consola del agente**: bitácora en vivo de lo que el agente está analizando y decidiendo.

**Cómo funciona.** Al entrar se activa el motor del agente, que escucha el stream de transacciones de Capital One (Nessie). Cada movimiento nuevo recalcula métricas, fugas y recomendación en tiempo real. Al confirmar la aportación, el score sube y la consola registra la acción y la actualización crediticia.

**Qué genera.** Aportación voluntaria a la AFORE ejecutada + mejora del perfil de solvencia (+15 pts por aportación) + bitácora auditable de decisiones del agente.

---

### 5.3. Movimientos — `/history`

**Para qué es.** El extracto vivo: cada peso que entra o sale, explicado.

**Por qué existe.** La confianza en un agente financiero nace de la transparencia: el usuario debe ver exactamente qué vio el agente y por qué marcó algo como fuga.

**A quién sirve.** Al usuario que quiere auditar su gasto y entender cada alerta.

**Qué muestra.**
- Contador de fugas activas en el encabezado.
- Lista cronológica con icono por categoría, comercio, fecha, categoría traducida y monto (+ ingresos / − egresos).
- Badge **"Fuga"** en los gastos anómalos.
- **Modal de detalle** al tocar cualquier movimiento: monto, estado, medio, fecha de transacción, descripción, ID de transacción y fecha de creación.

**Cómo funciona.** La lista se alimenta del stream en tiempo real: los movimientos nuevos aparecen arriba automáticamente. El modal toma el registro completo estilo Nessie (`_id`, `medium`, `status`, `transaction_date`, `description`, `creation_date`) y lo presenta en el idioma activo.

**Qué genera.** Trazabilidad total: cada decisión del agente puede rastrearse hasta el movimiento que la originó.

---

### 5.4. Análisis de Flujo de Caja — `/analytics`

**Para qué es.** Demostrar con números que el dinero alcanza y que el ahorro constante tiene premio.

**Por qué existe.** Es la pantalla que convierte disciplina en beneficios: valida la solvencia del usuario frente al banco.

**A quién sirve.** Al usuario que quiere verse "aprobado" por su comportamiento y al banco, que recibe un perfil de riesgo basado en flujo real.

**Qué muestra.**
- **Resumen de balance**: Ingresos totales (+) vs. Egresos totales (−) y balance neto.
- **Desglose por categoría** (Vivienda/Renta, Comida/Delivery, Suscripciones) con barras de % sobre el gasto total; la categoría con fuga activa se resalta en color de alerta con su badge.
- **Medidor de solvencia financiera**: avance hacia la meta del 20% de ahorro y tarjeta explicativa de cómo el ahorro constante desbloquea mayor línea de crédito, tasas preferenciales y beneficios en la AFORE.

**Cómo funciona.** Todo se recalcula desde las transacciones y métricas vivas: si entra un gasto nuevo, el balance, los porcentajes y la solvencia se actualizan. La tasa de ahorro (`Safe-to-Save™ / ingreso`) determina el avance del medidor.

**Qué genera.** Un perfil de solvencia verificable por comportamiento, compartible con el banco para mejores condiciones.

---

## 6. Superficies globales

| Superficie | Dónde | Qué hace |
|------------|-------|----------|
| **Header móvil** | Todas (layout `default`) | Marca, badge Live del stream, accesos a notificaciones, ajustes y perfil. |
| **Drawer de notificaciones** | Icono campana | Alertas de fuga, aportación sugerida, subida de score y estado del stream; marcar individual o todo como leído; acceso directo al análisis. |
| **Drawer de perfil** | Avatar | Datos personales, dirección, Customer ID, editar perfil y **cerrar sesión**. |
| **Drawer de ajustes** | Icono engrane | Modo claro/oscuro/sistema y cambio de idioma ES/EN. |
| **Bottom nav** | Todas (layout `default`) | Dashboard · Movimientos · Flujo, con estado activo. |

---

## 7. Flujos de extremo a extremo

**Fuga → aporte → solvencia.**
1. El agente detecta gasto anómalo (ej. delivery 32% sobre el promedio) → badge "Fuga" + notificación + log en consola.
2. El Dashboard recomienda reasignar el monto a la AFORE mostrando el impacto a los 65 años.
3. El usuario confirma en 1 tap → aportación ejecutada, score +15, logs de acción y actualización crediticia.
4. La tasa de ahorro sube → el medidor de solvencia en Flujo avanza → mejores servicios bancarios.

**Cambio de idioma.** Desde el login o Ajustes: toda la UI, fechas, categorías, estados y notificaciones cambian al instante y la preferencia persiste.

**Instalación.** La app es PWA: manifiesto `AutoAfore`, icono propio, modo standalone, service worker con actualización automática y caché del shell + avatares para operar con conexión intermitente.

---

## 8. Principios de producto

- **Mobile-first**: diseñada para teléfono; en escritorio se presenta como shell de app.
- **1 tap para lo importante**: aportar a la AFORE nunca toma más de un toque.
- **Transparencia radical**: todo lo que el agente decide puede verse en la consola y rastrearse al movimiento origen.
- **Bilingüe real**: ES/EN en cada cadena visible, fechas y categorías.
- **Sin fricción visual**: un solo scroll por pantalla, tokens semánticos de color, modo claro/oscuro.
