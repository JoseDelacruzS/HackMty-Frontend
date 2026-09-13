import { defineStore } from "pinia";
import type { UserResourceDTO } from "~/types/api";

export interface UserProfile {
  first_name: string;
  last_name: string;
  _id: string;
  address?: {
    street_number: string;
    street_name: string;
    city: string;
    state: string;
    zip: string;
  };
  avatar?: string;
}

const STORAGE_KEY = "user_profile";

export const useUserStore = defineStore("user", {
  state: () => ({
    firstName: "",
    lastName: "",
    username: "",
    _id: "",
    nessieId: "",
    address: null as UserProfile["address"] | null,
    loaded: false,
  }),

  getters: {
    profile(state): UserProfile {
      return {
        first_name: state.firstName,
        last_name: state.lastName,
        _id: state._id,
        address: state.address ?? undefined,
        avatar: state.firstName
          ? `https://api.dicebear.com/9.x/notionists/svg?seed=${encodeURIComponent(state.firstName)}`
          : undefined,
      };
    },
    displayName(state): string {
      return (
        [state.firstName, state.lastName].filter(Boolean).join(" ").trim() ||
        state.username
      );
    },
    initials(state): string {
      const a = state.firstName?.[0] ?? "";
      const b = state.lastName?.[0] ?? "";
      return (a + b).toUpperCase() || state.username?.[0]?.toUpperCase() || "U";
    },
  },

  actions: {
    init() {
      if (!import.meta.client) return;
      try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (raw) {
          const data = JSON.parse(raw);
          this.firstName = data.firstName ?? "";
          this.lastName = data.lastName ?? "";
          this.username = data.username ?? "";
          this._id = data._id ?? "";
          this.nessieId = data.nessieId ?? "";
          this.loaded = true;
        }
      } catch (e) {
        console.warn("[userStore] perfil persistido inválido", e);
      }
    },

    hydrateUserResource(u: UserResourceDTO) {
      // password se descarta: nunca se guarda en el store ni en localStorage
      this.firstName = u.firstName ?? "";
      this.lastName = u.lastName ?? "";
      this.username = u.username ?? "";
      this._id = u._id ?? "";
      this.nessieId = u.nessieId ?? "";
      this.address = null; // el backend no devuelve address
      this.loaded = true;
    },

    persist() {
      if (!import.meta.client) return;
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          firstName: this.firstName,
          lastName: this.lastName,
          username: this.username,
          _id: this._id,
          nessieId: this.nessieId,
        })
      );
    },

    async fetchUser() {
      try {
        const { getUser } = useFinancialApi();
        const res = await getUser();
        const u = res?.resource?.[0];
        if (u) {
          this.hydrateUserResource(u);
          this.persist();
        }
        return u ?? null;
      } catch (e) {
        console.warn("[userStore] no se pudo obtener el usuario", e);
        return null;
      }
    },

    clear() {
      this.firstName = "";
      this.lastName = "";
      this.username = "";
      this._id = "";
      this.nessieId = "";
      this.address = null;
      this.loaded = false;
      if (import.meta.client) localStorage.removeItem(STORAGE_KEY);
    },
  },
});
