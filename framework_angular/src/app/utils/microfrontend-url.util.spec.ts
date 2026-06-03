import { TestBed } from '@angular/core/testing';
import { DomSanitizer } from '@angular/platform-browser';
import {
  buildMicrofrontendUrl,
  isMicrofrontendApp,
  normalizeMicrofrontendRoute,
  toTrustedMicrofrontendResourceUrl,
} from './microfrontend-url.util';

describe('microfrontend-url.util', () => {
  let sanitizer: DomSanitizer;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    sanitizer = TestBed.inject(DomSanitizer);
  });

  it('acepta solo apps configuradas', () => {
    expect(isMicrofrontendApp('react')).toBeTrue();
    expect(isMicrofrontendApp('vue')).toBeTrue();
    expect(isMicrofrontendApp('evil')).toBeFalse();
  });

  it('rechaza rutas con esquemas maliciosos', () => {
    expect(normalizeMicrofrontendRoute('javascript:alert(1)')).toBeNull();
    expect(normalizeMicrofrontendRoute('//evil.test/path')).toBeNull();
    expect(normalizeMicrofrontendRoute('https://evil.test')).toBeNull();
    expect(normalizeMicrofrontendRoute('/sede/tasty-central')).toBe('/sede/tasty-central');
  });

  it('solo construye URLs de orígenes permitidos', () => {
    expect(buildMicrofrontendUrl('react', '/sede/tasty-central')).toBe(
      'http://localhost:5173/sede/tasty-central'
    );
    expect(buildMicrofrontendUrl('vue', '/#/pedido')).toBe(
      'http://localhost:5174/#/pedido'
    );
    expect(buildMicrofrontendUrl('react', 'javascript:alert(1)')).toBeNull();
  });

  it('genera SafeResourceUrl solo para URLs validadas', () => {
    const trusted = toTrustedMicrofrontendResourceUrl(sanitizer, 'react', '/');
    expect(trusted).not.toBeNull();

    const blocked = toTrustedMicrofrontendResourceUrl(
      sanitizer,
      'react',
      'javascript:alert(1)'
    );
    expect(blocked).toBeNull();
  });
});
