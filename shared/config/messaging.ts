/** Origen del shell Angular en desarrollo local */
export const SHELL_ORIGIN = 'http://localhost:4200';

function getBrowserWindow(): Window {
  return globalThis as unknown as Window;
}

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
  const win = getBrowserWindow();
  if (!win.parent || win.parent === win) {
    return;
  }
  win.parent.postMessage(message, getShellOrigin());
}

export function postToTop(message: unknown): void {
  const win = getBrowserWindow();
  if (!win.top || win.top === win) {
    return;
  }
  win.top.postMessage(message, getShellOrigin());
}

export function isEmbeddedInShell(): boolean {
  const win = getBrowserWindow();
  return Boolean(win.parent && win.parent !== win);
}
