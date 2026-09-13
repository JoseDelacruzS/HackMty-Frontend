import { en, es } from "@nuxt/ui/locale";

export default defineAppConfig({
  ui: {
    colors: {
      primary: "blue",
      secondary: "sky",
      neutral: "mist",
    },
    button: {
      defaultVariants: {
        variant: "soft",
      },
    },
    badge: {
      defaultVariants: {
        variant: "soft",
      },
    },
    card: {
      defaultVariants: {
        variant: "subtle",
      },
    },
    alert: {
      defaultVariants: {
        variant: "subtle",
      },
    },
    empty: {
      defaultVariants: {
        variant: "subtle",
      },
    },
    input: {
      defaultVariants: {
        variant: "soft",
      },
    },
    select: {
      defaultVariants: {
        variant: "soft",
      },
    },
    textarea: {
      defaultVariants: {
        variant: "soft",
      },
    },
    selectMenu: {
      defaultVariants: {
        variant: "soft",
      },
    },
    inputMenu: {
      defaultVariants: {
        variant: "soft",
      },
    },
    inputNumber: {
      defaultVariants: {
        variant: "soft",
      },
    },
    inputTags: {
      defaultVariants: {
        variant: "soft",
      },
    },
    inputDate: {
      defaultVariants: {
        variant: "soft",
      },
    },
    inputTime: {
      defaultVariants: {
        variant: "soft",
      },
    },
    pinInput: {
      defaultVariants: {
        variant: "soft",
      },
    },
  },
  locales: {
    es: defineLocale({
      ...es,
      messages: {
        ...es.messages,
        app: {
          title: "AlcancIA",
          shortTitle: "AlcancIA",
          live: "En vivo",
          stream: "Capital One Nessie Stream",
          greeting: "Hola de nuevo",
          greetingQuestion: "¿Ahorramos hoy, {name}?",
        },
        common: {
          close: "Cerrar",
        },
        nav: {
          dashboard: "Dashboard",
          history: "Movimientos",
          analytics: "Flujo",
          savings: "Cajita",
        },
        appHeader: {
          profile: "Perfil",
          notifications: "Notificaciones",
          settings: "Ajustes",
        },
        pages: {
          dashboard: "Dashboard",
          history: "Movimientos",
          analytics: "Flujo de caja",
        },
        history: {
          title: "Movimientos",
          subtitle: "Nessie stream",
          leaks: "{n} fugas",
          leak: "Fuga",
          detail: {
            title: "Detalle del movimiento",
            id: "ID de transacción",
            medium: "Medio",
            status: "Estado",
            amount: "Monto",
            txnDate: "Fecha de transacción",
            description: "Descripción",
            createdAt: "Fecha de creación",
          },
          medium: {
            balance: "Balance",
            checking: "Débito",
            savings: "Ahorros",
            creditCard: "Crédito",
          },
          status: {
            completed: "Completada",
            pending: "Pendiente",
            cancelled: "Cancelada",
          },
        },
        analytics: {
          title: "Flujo de Caja",
          subtitle: "Análisis en tiempo real",
          balance: "Resumen de balance",
          income: "Ingresos totales",
          expenses: "Egresos totales",
          net: "Balance neto",
          breakdown: "Desglose por categoría",
          housing: "Vivienda / Renta",
          food: "Comida / Delivery",
          subs: "Suscripciones",
          solvencyTitle: "Solvencia financiera",
          ofGoal: "{pct}% de la meta",
          solvencyBody:
            "Tu ahorro constante de {amount} al mes ({rate}% de tus ingresos) valida tu disciplina financiera y abre la puerta a mejores servicios en el banco: mayor línea de crédito, tasas preferenciales y beneficios en tu AFORE.",
          solvencyHint: "Meta recomendada: ahorrar el 20% de tus ingresos",
        },
        savings: {
          title: "Cajita de Ahorro",
          subtitle: "Rendimiento diario 7.5% anual",
          totalBalance: "Ahorro total en cajita",
          totalYield: "Rendimiento acumulado",
          deposit: "Guardar",
          withdraw: "Retirar",
          goal: "Meta: {amount}",
          rate: "7.5% Tasa anual",
          modalDepositTitle: "Guardar en {name}",
          modalWithdrawTitle: "Retirar de {name}",
          amountLabel: "Monto en MXN",
          submit: "Confirmar",
          successDeposit: "¡Dinero guardado con éxito con rendimiento optimizado!",
        },
        profile: {
          personal: "Datos personales",
          address: "Dirección",
          name: "Nombre",
          customerId: "Customer ID",
          edit: "Editar perfil",
          logout: "Cerrar sesión",
          zip: "C.P.",
        },
        notif: {
          title: "Notificaciones",
          markAll: "Marcar todo",
          "empty.title": "Sin notificaciones",
          "empty.description": "Cuando tu agente detecte algo, lo verás aquí.",
          viewAnalytics: "Ver mi flujo de caja",
        },
        settings: {
          title: "Ajustes",
          subtitle: "Personaliza tu experiencia",
          appearance: "Apariencia",
          appearanceDescription: "Modo claro u oscuro",
          language: "Idioma",
          languageDescription: "English · Español",
        },
        action: {
          title: "Recomendación del Agente",
          subtitle: "Optimizado con tu flujo de caja",
          detected: "Detectamos",
          leaksKind: "en fugas de comida a domicilio.",
          reassign: "Reasigna",
          noLifestyleChange:
            "a tu AFORE este mes sin reducir tu estilo de vida.",
          impact: "Impacto a los 65 años: +{amount} MXN",
          cta: "Reasignar {amount} a mi AFORE",
          ctaDone: "Aportación enviada a AFORE",
        },
        projection: {
          title: "Proyección a los {age}",
          without: "Sin agente",
          with: "Con agente",
          gain: "+{amount} MXN de ganancia proyectada con micro-aportaciones.",
        },
        projectionGraph: {
          title: "Proyección comparativa AFORE",
          subtitle: "Crecimiento del fondo con agente vs. sin agente",
          withoutAgent: "Sin agente",
          withAgent: "Con agente AI",
          gainSummary: "A los {age} años acumulas +{amount} MXN extra gracias al rebalanceo automático de micro-aportaciones.",
        },
        metrics: {
          score: "Score de crédito",
          points: "pts",
          freeBuffer: "Buffer libre disponible",
          verified: "Cash-Flow Verified",
          savingsRate: "Tasa de ahorro",
        },
        console: {
          title: "Consola de razonamiento",
        },
        category: {
          food_delivery: "Comida a domicilio",
          subscriptions: "Suscripciones",
          income: "Ingreso",
          convenience: "Tienda",
          coffee: "Café",
        },
        auth: {
          subtitle: "Inicia sesión para ver tu stream Nessie",
          email: "Correo",
          emailPlaceholder: "sofia@ejemplo.mx",
          password: "Contraseña",
          submit: "Entrar",
          demo: "Demo HackMTY 2026 — cualquier correo y contraseña de 6+ caracteres.",
          error:
            "Usa un correo válido y una contraseña de al menos 6 caracteres.",
          genericError: "Ocurrió un error al iniciar sesión.",
          togglePassword: "Mostrar u ocultar contraseña",
        },
        time: {
          now: "hace un momento",
          minutes: "hace {n} min",
          hours: "hace {n} h",
          days: "hace {n} d",
        },
        notifSamples: {
          leakTitle: "Fuga detectada en Uber Eats",
          leakBody:
            "Gasto de $427 MXN en comida a domicilio, 32% sobre tu promedio.",
          aforeTitle: "Aportación AFORE sugerida",
          aforeBody:
            "Tienes $1,850 MXN Safe-to-Save. Reasigna $500 a tu AFORE este mes.",
          creditTitle: "Cash-Flow Score subió +15 pts",
          creditBody:
            "Tu perfil ahora está en 755 pts. Sigue así para llegar a Premium.",
          streamTitle: "Stream Nessie activo",
          streamBody: "Conectado a Capital One. Recibirás txn en tiempo real.",
        },
      },
    }),
    en: defineLocale({
      ...en,
      messages: {
        ...en.messages,
        app: {
          title: "AlcancIA",
          shortTitle: "AlcancIA",
          live: "Live",
          stream: "Capital One Nessie Stream",
          greeting: "Welcome back",
          greetingQuestion: "Shall we save today, {name}?",
        },
        common: {
          close: "Close",
        },
        nav: {
          dashboard: "Dashboard",
          history: "Activity",
          analytics: "Flow",
          savings: "Vaults",
        },
        appHeader: {
          profile: "Profile",
          notifications: "Notifications",
          settings: "Settings",
        },
        pages: {
          dashboard: "Dashboard",
          history: "Activity",
          analytics: "Cash flow",
        },
        history: {
          title: "Activity",
          subtitle: "Nessie stream",
          leaks: "{n} leaks",
          leak: "Leak",
          detail: {
            title: "Transaction detail",
            id: "Transaction ID",
            medium: "Medium",
            status: "Status",
            amount: "Amount",
            txnDate: "Transaction date",
            description: "Description",
            createdAt: "Creation date",
          },
          medium: {
            balance: "Balance",
            checking: "Checking",
            savings: "Savings",
            creditCard: "Credit card",
          },
          status: {
            completed: "Completed",
            pending: "Pending",
            cancelled: "Cancelled",
          },
        },
        analytics: {
          title: "Cash Flow",
          subtitle: "Real-time analysis",
          balance: "Balance summary",
          income: "Total income",
          expenses: "Total expenses",
          net: "Net balance",
          breakdown: "Breakdown by category",
          housing: "Housing / Rent",
          food: "Food / Delivery",
          subs: "Subscriptions",
          solvencyTitle: "Financial solvency",
          ofGoal: "{pct}% of goal",
          solvencyBody:
            "Your steady saving of {amount} a month ({rate}% of your income) proves your financial discipline and unlocks better bank services: higher credit lines, preferential rates and AFORE perks.",
          solvencyHint: "Recommended goal: save 20% of your income",
        },
        savings: {
          title: "Savings Vault",
          subtitle: "Daily yield 7.5% annual",
          totalBalance: "Total vault balance",
          totalYield: "Accumulated yield",
          deposit: "Save",
          withdraw: "Withdraw",
          goal: "Goal: {amount}",
          rate: "7.5% Annual rate",
          modalDepositTitle: "Save to {name}",
          modalWithdrawTitle: "Withdraw from {name}",
          amountLabel: "Amount in MXN",
          submit: "Confirm",
          successDeposit: "Successfully saved with optimized yield!",
        },
        profile: {
          personal: "Personal data",
          address: "Address",
          name: "Name",
          customerId: "Customer ID",
          edit: "Edit profile",
          logout: "Log out",
          zip: "ZIP",
        },
        notif: {
          title: "Notifications",
          markAll: "Mark all as read",
          "empty.title": "No notifications",
          "empty.description":
            "When your agent spots something, it shows up here.",
          viewAnalytics: "See my cash flow",
        },
        settings: {
          title: "Settings",
          subtitle: "Make AlcancIA yours",
          appearance: "Appearance",
          appearanceDescription: "Light or dark mode",
          language: "Language",
          languageDescription: "English · Español",
        },
        action: {
          title: "Agent Recommendation",
          subtitle: "Optimized with your cash flow",
          detected: "We detected",
          leaksKind: "in food-delivery leaks.",
          reassign: "Reallocate",
          noLifestyleChange:
            "to your AFORE this month without cutting your lifestyle.",
          impact: "Impact at age 65: +{amount} MXN",
          cta: "Reallocate {amount} to my AFORE",
          ctaDone: "Contribution sent to AFORE",
        },
        projection: {
          title: "Projection at age {age}",
          without: "Without agent",
          with: "With agent",
          gain: "+{amount} MXN of projected gains with micro-contributions.",
        },
        projectionGraph: {
          title: "AFORE Comparative Projection",
          subtitle: "Fund growth with agent vs. without agent",
          withoutAgent: "Without agent",
          withAgent: "With AI agent",
          gainSummary: "By age {age} you accumulate +{amount} MXN extra thanks to automated micro-contribution rebalancing.",
        },
        metrics: {
          score: "Credit Score",
          points: "pts",
          freeBuffer: "Available free buffer",
          verified: "Cash-Flow Verified",
          savingsRate: "Savings rate",
        },
        console: {
          title: "Reasoning console",
        },
        category: {
          food_delivery: "Food delivery",
          subscriptions: "Subscriptions",
          income: "Income",
          convenience: "Store",
          coffee: "Coffee",
        },
        auth: {
          subtitle: "Sign in to see your Nessie stream",
          email: "Email",
          emailPlaceholder: "sofia@example.com",
          password: "Password",
          submit: "Sign in",
          demo: "HackMTY 2026 demo — any email and a 6+ character password.",
          error: "Use a valid email and a password of at least 6 characters.",
          genericError: "Something went wrong while signing in.",
          togglePassword: "Toggle password visibility",
        },
        time: {
          now: "just now",
          minutes: "{n} min ago",
          hours: "{n} h ago",
          days: "{n} d ago",
        },
        notifSamples: {
          leakTitle: "Leak detected on Uber Eats",
          leakBody:
            "Spent $427 MXN on food delivery, 32% above your average.",
          aforeTitle: "Suggested AFORE contribution",
          aforeBody:
            "You have $1,850 MXN Safe-to-Save. Reallocate $500 to your AFORE this month.",
          creditTitle: "Cash-Flow Score up +15 pts",
          creditBody:
            "Your profile is now at 755 pts. Keep going to reach Premium.",
          streamTitle: "Nessie stream live",
          streamBody: "Connected to Capital One. You will get live txn.",
        },
      },
    }),
  },
});
