/**
 * Configuración de URLs para los microfrontends React y Vue
 * Asegúrate de que React corra en 5173 y Vue en 5174
 */
export const MICROFRONTEND_CONFIG = {
  react: {
    baseUrl: 'http://localhost:5173',
    routes: {
      inicio: '/',
      sede: (sedeId: string) => `/sede/${sedeId}`,
      adminMenu: '/admin/panel',
    },
  },
  vue: {
    baseUrl: 'http://localhost:5174',
    routes: {
      pedido: '/#/pedido',
      gestionPedido: '/#/gestion-pedido',
    },
  },
} as const;
