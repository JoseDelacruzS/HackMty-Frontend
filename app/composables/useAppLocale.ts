import { en, es } from "@nuxt/ui/locale";
import { useLocale } from "@nuxt/ui/composables";

export { useLocale };

export type LocaleCode = "es" | "en";

const LOCALES = { es, en } as const;

export function useAppLocale() {
  const appConfig = useAppConfig();

  const code = useState<LocaleCode>("app:locale-code", () => {
    if (import.meta.client) {
      const stored = window.localStorage.getItem("app:locale");
      if (stored === "es" || stored === "en") return stored as LocaleCode;
    }
    return "es";
  });

  const locale = computed(
    () => appConfig.locales?.[code.value] ?? LOCALES[code.value],
  );

  function setLocale(next: LocaleCode | string) {
    if (next !== "es" && next !== "en") return;
    code.value = next as LocaleCode;
    if (import.meta.client) {
      window.localStorage.setItem("app:locale", next);
    }
  }

  return { code, locale, setLocale, es, en };
}
