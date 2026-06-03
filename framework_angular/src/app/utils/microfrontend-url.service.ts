import { Injectable } from '@angular/core';
import { buildMicrofrontendUrl, isMicrofrontendApp } from './microfrontend-url.util';

@Injectable({ providedIn: 'root' })
export class MicrofrontendUrlService {
  resolveMicrofrontendUrl(app: string, route: string): string | null {
    if (!app || !route || !isMicrofrontendApp(app)) {
      return null;
    }

    return buildMicrofrontendUrl(app, route);
  }
}
