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

  constructor(private readonly router: Router) {}

  ngOnInit(): void {
    this.globalMessageHandler = (event) => this.handleMicrofrontendMessage(event);
    globalThis.addEventListener('message', this.globalMessageHandler);
    console.log('[App] ✅ Listener de mensajes configurado en App.ts');
  }

  ngOnDestroy(): void {
    if (this.globalMessageHandler) {
      globalThis.removeEventListener('message', this.globalMessageHandler);
    }
  }

  private handleMicrofrontendMessage(event: MessageEvent): void {
    if (!isAllowedMicrofrontendOrigin(event.origin)) {
      return;
    }

    const data = event.data;
    if (!isMicrofrontendMessage(data)) {
      return;
    }

    switch (data.type) {
      case 'navigate':
        this.handleNavigateMessage(data);
        break;
      case 'set-carrito':
        this.handleSetCarritoMessage(data);
        break;
      case 'get-carrito':
        this.handleGetCarritoMessage(event);
        break;
      default:
        break;
    }
  }

  private handleNavigateMessage(data: MicrofrontendMessage): void {
    const route = data.route;
    if (!route || typeof route !== 'string' || !route.startsWith('/')) {
      return;
    }

    console.log('[App] ✅ Navegación solicitada desde iframe:', route);

    this.router.navigateByUrl(route).then(() => {
      console.log('[App] ✅ Navegación completada a:', route);
    }).catch((err) => {
      console.error('[App] ❌ Error al navegar:', err);
      globalThis.location.href = route;
    });
  }

  private handleSetCarritoMessage(data: MicrofrontendMessage): void {
    const items = data.items;
    const sede = data.sede;

    if (Array.isArray(items)) {
      this.carritoCache = items;
      this.persistCarritoItems(items);
      console.log('[App] 🛒 Carrito recibido desde React. Items:', items.length);
    }

    if (typeof sede === 'string') {
      this.pedidoSedeCache = sede;
      this.persistPedidoSede(sede);
      console.log('[App] 🏪 Sede recibida desde React:', sede);
    }
  }

  private handleGetCarritoMessage(event: MessageEvent): void {
    this.hydrateCarritoCacheFromStorage();

    const response = {
      type: 'carrito-data',
      items: this.carritoCache,
      sede: this.pedidoSedeCache,
    };

    const itemCount = Array.isArray(response.items) ? response.items.length : 0;
    postMessageToTarget(event.source, event.origin, response);
    console.log('[App] ✅ Enviando carrito a Vue. Items:', itemCount);
  }

  private hydrateCarritoCacheFromStorage(): void {
    if (this.carritoCache.length > 0) {
      return;
    }

    try {
      const stored = localStorage.getItem('carritoItems');
      if (stored) {
        this.carritoCache = JSON.parse(stored) as unknown[];
      }
    } catch {
      // Sin carrito persistido
    }

    if (!this.pedidoSedeCache) {
      try {
        const storedSede = localStorage.getItem('pedidoSede');
        if (storedSede) {
          this.pedidoSedeCache = storedSede;
        }
      } catch {
        // Sin sede persistida
      }
    }
  }

  private persistCarritoItems(items: unknown[]): void {
    try {
      localStorage.setItem('carritoItems', JSON.stringify(items));
    } catch {
      // Almacenamiento no disponible
    }
  }

  private persistPedidoSede(sede: string): void {
    try {
      localStorage.setItem('pedidoSede', sede);
    } catch {
      // Almacenamiento no disponible
    }
  }
}
