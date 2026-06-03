import { Injectable, inject } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { isMicrofrontendApp, toTrustedMicrofrontendResourceUrl } from './microfrontend-url.util';

@Injectable({ providedIn: 'root' })
export class MicrofrontendUrlService {
  private readonly sanitizer = inject(DomSanitizer);

  resolveTrustedResourceUrl(app: string, route: string): SafeResourceUrl | null {
    if (!app || !route || !isMicrofrontendApp(app)) {
      return null;
    }

    return toTrustedMicrofrontendResourceUrl(this.sanitizer, app, route);
  }
}
