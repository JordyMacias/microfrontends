// Tipos para usuarios
export interface Usuario {
  id: string | number; // UUID en Supabase, pero puede ser number para compatibilidad
  nombre: string;
  apellido: string;
  email: string;
  telefono: string;
  password: string;
  fechaNacimiento?: string;
  newsletter: boolean;
  fechaRegistro: string;
  activo: boolean;
}


// Tipos para pedidos
export interface PedidoItem {
  id: number;
  nombre: string;
  precio: number;
  cantidad: number;
}

export interface Pedido {
  id: number;
  fecha: string;
  sede: string;
  facultad?: string;
  items: PedidoItem[];
  total: number;
  estado: 'pendiente' | 'en_preparacion' | 'listo' | 'entregado' | 'cancelado';
  cliente: string;
  cedula?: string;
  usuario_id?: string; // UUID del usuario en Supabase
}

// Tipos para menú
export interface MenuItem {
  id: number;
  nombre: string;
  sede: string;
  categoria: string;
  precio: number;
  descripcion: string;
  ingredientes?: string;
  imagen?: string;
}
