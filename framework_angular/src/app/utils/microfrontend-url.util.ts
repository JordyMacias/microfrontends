import { MICROFRONTEND_CONFIG } from '../../environments/microfrontends';
import { isAllowedMicrofrontendUrl } from './post-message.util';

export type MicrofrontendApp = keyof typeof MICROFRONTEND_CONFIG;

const ALLOWED_APPS: readonly MicrofrontendApp[] = ['react', 'vue'];

export function isMicrofrontendApp(value: string): value is MicrofrontendApp {
  return (ALLOWED_APPS as readonly string[]).includes(value);
}

/**
 * Normaliza la ruta interna del microfrontend.
 * Rechaza rutas que intenten inyectar otro origen o esquema.
 */
export function normalizeMicrofrontendRoute(route: string): string | null {
  const trimmed = route.trim();
  if (!trimmed) {
    return null;
  }

  const lower = trimmed.toLowerCase();
  if (
    lower.includes('://') ||
    lower.includes('javascript:') ||
    lower.includes('data:') ||
    trimmed.startsWith('//')
  ) {
    return null;
  }

  return trimmed.startsWith('/') ? trimmed : `/${trimmed}`;
}

/**
 * Arma la URL del iframe solo con baseUrl de configuración estática + ruta validada.
 */
export function buildMicrofrontendUrl(app: MicrofrontendApp, route: string): string | null {
  const path = normalizeMicrofrontendRoute(route);
  if (!path) {
    return null;
  }

  const baseUrl = MICROFRONTEND_CONFIG[app].baseUrl.replace(/\/$/, '');
  const url = `${baseUrl}${path}`;

  return isAllowedMicrofrontendUrl(url) ? url : null;
}
