import { defineStore } from "pinia";

interface AuthState {
  token: string | null;
  username: string | null;
}

export const useAuthStore = defineStore("auth", {
  state: (): AuthState => ({
    token: null,
    username: null,
  }),

  getters: {
    isAuthenticated: (state) => !!state.token,
    authHeader: (state) => (state.token ? `Bearer ${state.token}` : ""),
  },

  actions: {
    init() {
      if (import.meta.client) {
        const cookieToken = useCookie<string | null>("auth_token", {
          maxAge: 60 * 60 * 24 * 7,
          sameSite: "lax",
          watch: true,
        });
        if (cookieToken.value) {
          this.token = cookieToken.value;
        } else {
          const stored = localStorage.getItem("auth_token");
          if (stored) {
            this.token = stored;
            cookieToken.value = stored;
          }
        }
        const storedUser = localStorage.getItem("auth_username");
        if (storedUser) this.username = storedUser;
      } else {
        const cookieToken = useCookie<string | null>("auth_token");
        if (cookieToken.value) this.token = cookieToken.value;
      }
    },

    setToken(token: string, username?: string) {
      this.token = token;
      if (username) this.username = username;

      const cookie = useCookie<string | null>("auth_token", {
        maxAge: 60 * 60 * 24 * 7,
        sameSite: "lax",
        watch: true,
      });
      cookie.value = token;

      if (import.meta.client) {
        localStorage.setItem("auth_token", token);
        if (username) localStorage.setItem("auth_username", username);
      }
    },

    async login(username: string, password: string) {
      // Usa proxy interno /api/auth/login para evitar CORS y ocultar BANK_API_BASE_URL en prod.
      // El proxy reenvía a `${BANK_API_BASE_URL}/auth/login` con { username, password }
      const res = await $fetch<{ authToken: string }>("/api/auth/login", {
        method: "POST",
        body: { username, password },
      });

      if (!res?.authToken) {
        throw new Error("Respuesta de login sin authToken");
      }

      this.setToken(res.authToken, username);
      return res.authToken;
    },

    async register(username: string, password: string) {
      const res = await $fetch<{ authToken: string }>("/api/auth/register", {
        method: "POST",
        body: { username, password },
      });
      if (res?.authToken) this.setToken(res.authToken, username);
      return res;
    },

    logout() {
      this.token = null;
      this.username = null;
      const cookie = useCookie<string | null>("auth_token");
      cookie.value = null;
      if (import.meta.client) {
        localStorage.removeItem("auth_token");
        localStorage.removeItem("auth_username");
      }
    },
  },
});
