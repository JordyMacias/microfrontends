import { MICROFRONTEND_CONFIG } from '../../environments/microfrontends';

function toOrigin(baseUrl: string): string {
  return new URL(baseUrl).origin;
}

const ALLOWED_MF_ORIGINS = new Set(
  Object.values(MICROFRONTEND_CONFIG).map((config) => toOrigin(config.baseUrl))
);

export function isAllowedMicrofrontendOrigin(origin: string): boolean {
  return Boolean(origin) && ALLOWED_MF_ORIGINS.has(origin);
}

export function getMicrofrontendOrigin(app: 'react' | 'vue'): string {
  return toOrigin(MICROFRONTEND_CONFIG[app].baseUrl);
}

export function isAllowedMicrofrontendUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
      return false;
    }
    return Object.values(MICROFRONTEND_CONFIG).some(
      (config) => toOrigin(config.baseUrl) === parsed.origin
    );
  } catch {
    return false;
  }
}

function isWindowTarget(target: MessageEventSource): target is Window {
  return typeof Window !== 'undefined' && target instanceof Window;
}

export function postMessageToTarget(
  target: MessageEventSource | null | undefined,
  targetOrigin: string,
  message: unknown
): void {
  if (!target || !targetOrigin || !isWindowTarget(target)) {
    return;
  }
  try {
    target.postMessage(message, targetOrigin);
  } catch {
    // Ignorar errores de cross-origin en entorno local
  }
}
