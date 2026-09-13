import { useAuthStore } from "~/stores/auth";

export default defineNuxtRouteMiddleware((to) => {
  const auth = useAuthStore();

  // init desde cookie en primer paso (SSR + client)
  if (!auth.token) {
    // useCookie ya esta hidratado
    const cookie = useCookie<string | null>("auth_token");
    if (cookie.value) auth.token = cookie.value;
  }

  const isAuthRoute = to.path === "/login";
  const isAuthenticated = !!auth.token;

  // no autenticado -> forzar login
  if (!isAuthenticated && !isAuthRoute) {
    return navigateTo("/login");
  }

  // autenticado y va a login -> redirigir a dashboard
  if (isAuthenticated && isAuthRoute) {
    return navigateTo("/");
  }
});
