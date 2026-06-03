import { Component, signal, OnInit, OnDestroy } from '@angular/core';
import { RouterOutlet, Router } from '@angular/router';
import {
  isAllowedMicrofrontendOrigin,
  postMessageToTarget,
} from './utils/post-message.util';

interface MicrofrontendMessage {
  type: string;
  route?: string;
  items?: unknown[];
  sede?: string;
}

function isMicrofrontendMessage(data: unknown): data is MicrofrontendMessage {
  return Boolean(data) && typeof data === 'object' && 'type' in (data as object);
}

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App implements OnInit, OnDestroy {
  protected readonly title = signal('tasty');
  private globalMessageHandler?: (event: MessageEvent) => void;
  private carritoCache: unknown[] = [];
  private pedidoSedeCache = '';

  constructor(private router: Router) {}

  ngOnInit() {
    // Listener global para mensajes de navegación desde iframes
    this.globalMessageHandler = (event: MessageEvent) => {
      if (!isAllowedMicrofrontendOrigin(event.origin)) {
        return;
      }

      const data = event.data;
      if (!isMicrofrontendMessage(data)) {
        return;
      }

      // 1) Navegación solicitada desde React/Vue
      if (data.type === 'navigate') {
        const route = data.route;
        if (route && typeof route === 'string' && route.startsWith('/')) {
          console.log('[App] ✅ Navegación solicitada desde iframe:', route, 'Origen:', event.origin);

          this.router.navigateByUrl(route).then(() => {
            console.log('[App] ✅ Navegación completada a:', route);
          }).catch(err => {
            console.error('[App] ❌ Error al navegar:', err);
            console.log('[App] Usando fallback: window.location.href');
            window.location.href = route;
          });
        }
        return;
      }

      // 2) React -> Angular: guardar carrito para Vue
      if (data.type === 'set-carrito') {
        const items = data.items;
        const sede = data.sede;
        if (Array.isArray(items)) {
          this.carritoCache = items;
          try {
            localStorage.setItem('carritoItems', JSON.stringify(items));
          } catch {
            // ignore
          }
          console.log('[App] 🛒 Carrito recibido desde React. Items:', items.length);
        }
        if (typeof sede === 'string') {
          this.pedidoSedeCache = sede;
          try {
            localStorage.setItem('pedidoSede', sede);
          } catch {
            // ignore
          }
          console.log('[App] 🏪 Sede recibida desde React:', sede);
        }
        return;
      }

      // 3) Vue -> Angular: solicitar carrito (Angular responde al source)
      if (data.type === 'get-carrito') {
        // Intentar recuperar desde localStorage si el cache está vacío
        if (!this.carritoCache?.length) {
          try {
            const stored = localStorage.getItem('carritoItems');
            if (stored) this.carritoCache = JSON.parse(stored);
          } catch {
            // ignore
          }
        }
        if (!this.pedidoSedeCache) {
          try {
            const storedSede = localStorage.getItem('pedidoSede');
            if (storedSede) this.pedidoSedeCache = storedSede;
          } catch {
            // ignore
          }
        }

        const response = {
          type: 'carrito-data',
          items: this.carritoCache ?? [],
          sede: this.pedidoSedeCache ?? '',
        };

        const source = event.source as Window | null;
        postMessageToTarget(source, event.origin, response);
        console.log('[App] ✅ Enviando carrito a Vue. Items:', (response.items as unknown[]).length);
        return;
      }
    };
    window.addEventListener('message', this.globalMessageHandler);
    console.log('[App] ✅ Listener de mensajes configurado en App.ts');
  }

  ngOnDestroy() {
    if (this.globalMessageHandler) {
      window.removeEventListener('message', this.globalMessageHandler);
    }
  }
}
