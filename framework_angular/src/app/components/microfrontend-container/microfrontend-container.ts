import {
  Component,
  ElementRef,
  Input,
  OnInit,
  OnChanges,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import { NgIf } from '@angular/common';
import {
  getMicrofrontendOrigin,
  postMessageToTarget,
} from '../../utils/post-message.util';
import { MicrofrontendUrlService } from '../../utils/microfrontend-url.service';

@Component({
  selector: 'app-microfrontend-container',
  standalone: true,
  imports: [NgIf],
  template: `
    <div class="microfrontend-wrapper">
      <iframe
        #mfIframe
        *ngIf="iframeSrc"
        class="microfrontend-iframe"
        title="Microfrontend"
        (load)="onIframeLoad()"
      ></iframe>
      <div *ngIf="!iframeSrc" class="microfrontend-placeholder">
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

  iframeSrc: string | null = null;

  private mfIframeRef?: ElementRef<HTMLIFrameElement>;

  @ViewChild('mfIframe')
  set mfIframe(ref: ElementRef<HTMLIFrameElement> | undefined) {
    this.mfIframeRef = ref;
    this.syncIframeSrc();
  }

  constructor(
    private readonly microfrontendUrlService: MicrofrontendUrlService
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
    this.iframeSrc = this.microfrontendUrlService.resolveMicrofrontendUrl(
      this.app,
      this.route
    );
    this.syncIframeSrc();
  }

  /** Asigna src tras validación; evita bypassSecurityTrustResourceUrl en plantilla. */
  private syncIframeSrc(): void {
    const iframe = this.mfIframeRef?.nativeElement;
    const url = this.iframeSrc;
    if (!iframe || !url) {
      return;
    }
    if (iframe.getAttribute('src') !== url) {
      iframe.setAttribute('src', url);
    }
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
