import {
  buildMicrofrontendUrl,
  isMicrofrontendApp,
  normalizeMicrofrontendRoute,
} from './microfrontend-url.util';

describe('microfrontend-url.util', () => {

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
});
