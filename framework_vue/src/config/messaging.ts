/** Origen del shell Angular en desarrollo local */
export const SHELL_ORIGIN = 'http://localhost:4200';

export function getShellOrigin(): string {
  if (typeof document !== 'undefined' && document.referrer) {
    try {
      const origin = new URL(document.referrer).origin;
      if (origin) {
        return origin;
      }
    } catch {
      // Usar valor por defecto
    }
  }
  return SHELL_ORIGIN;
}

export function isShellOrigin(origin: string): boolean {
  if (!origin) {
    return false;
  }
  const shell = getShellOrigin();
  return origin === shell || origin === SHELL_ORIGIN;
}

export function postToParent(message: unknown): void {
  if (!window.parent || window.parent === window) {
    return;
  }
  window.parent.postMessage(message, getShellOrigin());
}
