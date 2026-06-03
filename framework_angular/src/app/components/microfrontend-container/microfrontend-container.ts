import { Component, Input, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { NgIf } from '@angular/common';
import { MICROFRONTEND_CONFIG } from '../../../environments/microfrontends';
import {
  getMicrofrontendOrigin,
  isAllowedMicrofrontendUrl,
  postMessageToTarget,
} from '../../utils/post-message.util';

@Component({
  selector: 'app-microfrontend-container',
  standalone: true,
  imports: [NgIf],
  template: `
    <div class="microfrontend-wrapper">
      <iframe
        *ngIf="iframeUrl"
        [src]="iframeUrl"
        class="microfrontend-iframe"
        title="Microfrontend"
        (load)="onIframeLoad()"
      ></iframe>
      <div *ngIf="!iframeUrl" class="microfrontend-placeholder">
        <p>Selecciona una ruta para cargar el microfrontend</p>
      </div>
    </div>
  `,
  styles: [`
    .microfrontend-wrapper {
      flex: 1;
      display: flex;
      flex-direction: column;
      min-height: 0;
    }

    .microfrontend-iframe {
      flex: 1;
      width: 100%;
      min-height: calc(100vh - 80px);
      border: none;
      display: block;
    }

    .microfrontend-placeholder {
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #666;
      font-size: 1.1rem;
    }
  `],
})
export class MicrofrontendContainer implements OnInit, OnChanges {
  @Input() app: 'react' | 'vue' = 'react';
  @Input() route = '';

  iframeUrl: SafeResourceUrl | null = null;

  constructor(
    private readonly sanitizer: DomSanitizer
  ) {}

  ngOnInit() {
    this.updateIframeUrl();
    // El listener de mensajes ahora está en App.ts para evitar duplicados
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['app'] || changes['route']) {
      this.updateIframeUrl();
    }
  }

  private updateIframeUrl() {
    if (!this.app || !this.route) {
      this.iframeUrl = null;
      return;
    }

    const config = MICROFRONTEND_CONFIG[this.app];
    const baseUrl = config.baseUrl;
    const path = this.route.startsWith('/') ? this.route : `/${this.route}`;
    const url = `${baseUrl}${path}`;
    if (!isAllowedMicrofrontendUrl(url)) {
      this.iframeUrl = null;
      return;
    }
    this.iframeUrl = this.sanitizer.bypassSecurityTrustResourceUrl(url);
  }

  onIframeLoad() {
    // Emitir evento para comunicación postMessage si es necesario
    globalThis.dispatchEvent(new CustomEvent('microfrontend-loaded', {
      detail: { app: this.app, route: this.route }
    }));

    // Enviar mensaje al iframe para indicar la sección (si es admin)
    const iframe = document.querySelector('.microfrontend-iframe') as HTMLIFrameElement;
    if (iframe?.contentWindow) {
      // Detectar sección desde la ruta o hash
      let section = 'menu';
      const routeLower = this.route.toLowerCase();
      if (routeLower.includes('#sedes') || routeLower.includes('sedes')) {
        section = 'sedes';
      } else if (routeLower.includes('#pedidos') || routeLower.includes('pedidos')) {
        section = 'pedidos';
      } else if (routeLower.includes('#reservas') || routeLower.includes('reservas')) {
        section = 'reservas';
      }

      // Enviar mensaje después de un pequeño delay para asegurar que el iframe esté listo
      const targetOrigin = getMicrofrontendOrigin(this.app);
      setTimeout(() => {
        postMessageToTarget(
          iframe.contentWindow,
          targetOrigin,
          { type: 'admin-section', section }
        );
      }, 500);
    }
  }
}
