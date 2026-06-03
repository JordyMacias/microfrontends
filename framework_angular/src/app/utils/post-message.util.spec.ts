import {
  getMicrofrontendOrigin,
  isAllowedMicrofrontendOrigin,
  isAllowedMicrofrontendUrl,
} from './post-message.util';

describe('post-message.util', () => {
  it('acepta orígenes de React y Vue en localhost', () => {
    expect(isAllowedMicrofrontendOrigin('http://localhost:5173')).toBeTrue();
    expect(isAllowedMicrofrontendOrigin('http://localhost:5174')).toBeTrue();
    expect(isAllowedMicrofrontendOrigin('http://evil.example')).toBeFalse();
  });

  it('solo permite URLs de microfrontends configurados', () => {
    expect(isAllowedMicrofrontendUrl('http://localhost:5173/sede/tasty-central')).toBeTrue();
    expect(isAllowedMicrofrontendUrl('http://localhost:5174/#/pedido')).toBeTrue();
    expect(isAllowedMicrofrontendUrl('javascript:alert(1)')).toBeFalse();
    expect(isAllowedMicrofrontendUrl('http://malicious.test/')).toBeFalse();
  });

  it('resuelve el origen por app', () => {
    expect(getMicrofrontendOrigin('react')).toBe('http://localhost:5173');
    expect(getMicrofrontendOrigin('vue')).toBe('http://localhost:5174');
  });
});
