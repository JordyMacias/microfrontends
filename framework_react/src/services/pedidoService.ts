import type { Pedido, PedidoItem } from '../types';

// Misma clave que Vue para que el admin vea los pedidos que hacen los usuarios
const STORAGE_KEY = 'tasty_pedidos';

function toDisplayString(value: unknown): string {
  if (typeof value === 'string') {
    return value;
  }
  if (typeof value === 'number') {
    return String(value);
  }
  return '';
}

// Obtener pedidos (desde tasty_pedidos, mismo storage que Vue)
export const obtenerPedidos = (): Pedido[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as Array<Record<string, unknown>>;
    return parsed.map((p) => ({
      id: Number(p['id']),
      fecha: typeof p['fecha'] === 'string' ? p['fecha'] : new Date().toISOString(),
      sede: toDisplayString(p['sede']),
      items: Array.isArray(p['items']) ? p['items'] as PedidoItem[] : [],
      total: Number(p['total'] ?? 0),
      estado: (p['estado'] as Pedido['estado']) || 'pendiente',
      cliente: toDisplayString(p['cliente']),
    }));
  } catch {
    return [];
  }
};

// Guardar pedidos (en tasty_pedidos para mantener sincronía con Vue)
export const guardarPedidos = (pedidos: Pedido[]): void => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(pedidos));
};

// Crear nuevo pedido
export const crearPedido = (
  items: PedidoItem[],
  sede: string,
  cliente: string
): Pedido => {
  const pedidos = obtenerPedidos();
  const total = items.reduce((sum, item) => sum + (item.precio * item.cantidad), 0);
  
  const nuevoPedido: Pedido = {
    id: pedidos.length > 0 ? Math.max(...pedidos.map(p => p.id)) + 1 : 1,
    fecha: new Date().toISOString(),
    sede,
    items,
    total,
    estado: 'pendiente',
    cliente
  };
  
  pedidos.push(nuevoPedido);
  guardarPedidos(pedidos);
  return nuevoPedido;
};

// Actualizar estado de pedido (lee y escribe en tasty_pedidos para que Vue lo vea)
export const actualizarEstadoPedido = (id: number, estado: Pedido['estado']): void => {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return;
  try {
    const pedidos = JSON.parse(raw) as Array<Record<string, unknown>>;
    const index = pedidos.findIndex((p) => Number(p['id']) === id);
    if (index !== -1) {
      pedidos[index]['estado'] = estado;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(pedidos));
    }
  } catch {
    // fallback: usar obtenerPedidos/guardarPedidos (puede perder campos extra)
    const pedidos = obtenerPedidos();
    const pedido = pedidos.find((p) => p.id === id);
    if (pedido) {
      pedido.estado = estado;
      guardarPedidos(pedidos);
    }
  }
};
