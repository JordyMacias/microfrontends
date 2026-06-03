import type { Pedido, PedidoItem } from '../types';

const STORAGE_KEY = 'tasty_pedidos';

// Obtener pedidos desde localStorage
export const obtenerPedidos = async (): Promise<Pedido[]> => {
  try {
    const pedidosStr = localStorage.getItem(STORAGE_KEY);
    if (!pedidosStr) {
      return [];
    }
    
    const pedidos = JSON.parse(pedidosStr) as Pedido[];
    
    // Asegurar que cada pedido tenga la estructura correcta
    return pedidos.map(p => ({
      id: p.id,
      fecha: p.fecha || new Date().toISOString(),
      sede: p.sede || '',
      facultad: p.facultad || undefined,
      items: (p.items || []) as PedidoItem[],
      total: typeof p.total === 'number' ? p.total : Number.parseFloat(String(p.total)) || 0,
      estado: (p.estado as Pedido['estado']) || 'pendiente',
      cliente: p.cliente || '',
      cedula: p.cedula || undefined,
      usuario_id: p.usuario_id || undefined
    }));
  } catch (error) {
    console.error('Error al obtener pedidos desde localStorage:', error);
    return [];
  }
};

// Guardar pedidos en localStorage
const guardarPedidosEnStorage = (pedidos: Pedido[]): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(pedidos));
  } catch (error) {
    console.error('Error al guardar pedidos en localStorage:', error);
  }
};

// Guardar pedidos (para compatibilidad)
export const guardarPedidos = async (pedidos: Pedido[]): Promise<void> => {
  guardarPedidosEnStorage(pedidos);
};

// Crear nuevo pedido en localStorage
export const crearPedido = async (
  items: PedidoItem[],
  sede: string,
  cliente: string,
  usuarioId?: string,
  facultad?: string,
  cedula?: string
): Promise<Pedido | null> => {
  try {
    const total = items.reduce((sum, item) => sum + (item.precio * item.cantidad), 0);
    
    // Obtener pedidos existentes
    const pedidosExistentes = await obtenerPedidos();
    
    // Obtener el siguiente ID
    const nuevoId = pedidosExistentes.length > 0 
      ? Math.max(...pedidosExistentes.map(p => p.id)) + 1 
      : 1;
    
    // Crear nuevo pedido
    // Asegurar que usuario_id sea string si se proporciona
    const usuarioIdFinal = usuarioId ? String(usuarioId) : undefined;
    
    console.log('📝 Creando pedido con:');
    console.log('  - usuarioId recibido:', usuarioId);
    console.log('  - usuarioId final (string):', usuarioIdFinal);
    
    const nuevoPedido: Pedido = {
      id: nuevoId,
      fecha: new Date().toISOString(),
      sede: sede,
      facultad: facultad || undefined,
      items: items,
      total: total,
      estado: 'pendiente',
      cliente: cliente,
      cedula: cedula || undefined,
      usuario_id: usuarioIdFinal
    };
    
    console.log('📦 Pedido creado:', {
      id: nuevoPedido.id,
      usuario_id: nuevoPedido.usuario_id,
      usuario_id_tipo: typeof nuevoPedido.usuario_id,
      cliente: nuevoPedido.cliente
    });
    
    // Agregar el nuevo pedido
    const pedidosActualizados = [nuevoPedido, ...pedidosExistentes];
    
    // Guardar en localStorage
    guardarPedidosEnStorage(pedidosActualizados);
    
    // Verificar que se guardó correctamente
    const pedidosVerificados = await obtenerPedidos();
    const pedidoGuardado = pedidosVerificados.find(p => p.id === nuevoPedido.id);
    
    if (!pedidoGuardado) {
      console.error('❌ ERROR: El pedido no se guardó correctamente en localStorage');
      return null;
    }
    
    console.log('✅ Pedido creado exitosamente:', nuevoPedido);
    console.log('✅ Pedido verificado en storage:', {
      id: pedidoGuardado.id,
      usuario_id: pedidoGuardado.usuario_id,
      usuario_id_tipo: typeof pedidoGuardado.usuario_id,
      cliente: pedidoGuardado.cliente
    });
    
    return nuevoPedido;
  } catch (error) {
    console.error('Error al crear pedido:', error);
    return null;
  }
};

// Actualizar estado de pedido en localStorage
export const actualizarEstadoPedido = async (id: number, estado: Pedido['estado']): Promise<boolean> => {
  try {
    const pedidos = await obtenerPedidos();
    const pedidoIndex = pedidos.findIndex(p => p.id === id);
    
    if (pedidoIndex === -1) {
      console.error('Pedido no encontrado:', id);
      return false;
    }
    
    const pedido = pedidos[pedidoIndex];
    if (!pedido) {
      console.error('Pedido no encontrado:', id);
      return false;
    }
    
    // Actualizar el estado
    pedido.estado = estado;
    
    // Guardar en localStorage
    guardarPedidosEnStorage(pedidos);
    
    console.log(`Estado del pedido #${id} actualizado a: ${estado}`);
    return true;
  } catch (error) {
    console.error('Error al actualizar estado del pedido:', error);
    return false;
  }
};

// Función para eliminar un pedido completamente
export const eliminarPedido = async (id: number): Promise<boolean> => {
  try {
    const pedidos = await obtenerPedidos();
    const pedidosFiltrados = pedidos.filter(p => p.id !== id);
    
    guardarPedidosEnStorage(pedidosFiltrados);
    
    console.log(`Pedido #${id} eliminado`);
    return true;
  } catch (error) {
    console.error('Error al eliminar pedido:', error);
    return false;
  }
};

// Función para inicializar con datos de ejemplo (opcional)
// NOTA: Esta función ya no se usa para evitar mostrar pedidos de ejemplo
// Los pedidos se crean solo cuando los usuarios los realizan
export const inicializarPedidosEjemplo = (): void => {
  // No inicializar pedidos de ejemplo automáticamente
  // Los pedidos se crearán solo cuando los usuarios los realicen
  console.log('Inicialización de pedidos: Los pedidos se crearán cuando los usuarios los realicen.');
};
