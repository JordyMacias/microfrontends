<template>
  <div class="admin-body">
    <header class="admin-header">
      <div class="container admin-header-inner">
        <div class="admin-logo">
          <h1>Tasty Uleam</h1>
          <span class="admin-subtitle">Gestión de Pedidos</span>
        </div>
        <nav class="admin-nav">
          <button class="btn-logout" @click="handleCerrarSesion">
            Cerrar Sesión
          </button>
        </nav>
      </div>
    </header>

    <main class="admin-main">
      <div class="container">
        <section class="admin-section active">
          <div class="section-header">
            <h2>Gestión de Pedidos</h2>
            <button class="btn-primary" @click="cargarPedidos" :disabled="loading">
              {{ loading ? 'Cargando...' : 'Actualizar' }}
            </button>
          </div>

          <div class="admin-filters">
            <select
              class="admin-select"
              v-model="filters.estado"
              @change="aplicarFiltros"
            >
              <option value="">Todos los estados</option>
              <option value="pendiente">Pendiente</option>
              <option value="en_preparacion">En Preparación</option>
              <option value="listo">Listo</option>
              <option value="entregado">Entregado</option>
              <option value="cancelado">Cancelado</option>
            </select>
            <select
              class="admin-select"
              v-model="filters.sede"
              @change="aplicarFiltros"
            >
              <option value="">Todas las sedes</option>
              <option value="Tasty Central">Tasty Central</option>
              <option value="Tasty Express">Tasty Express</option>
              <option value="Tasty Comedor">Tasty Comedor</option>
            </select>
            <input
              type="text"
              class="admin-input"
              placeholder="Buscar por ID o cliente..."
              v-model="filters.busqueda"
              @input="aplicarFiltros"
            />
          </div>

          <div class="pedidos-list">
            <div v-if="pedidosFiltrados.length === 0 && !loading" class="empty-state">
              No hay pedidos registrados.
            </div>
            
            <div
              v-for="pedido in pedidosFiltradosOrdenados"
              :key="pedido.id"
              :class="['pedido-card', `pedido-${pedido.estado}`]"
            >
              <div class="pedido-header">
                <div>
                  <h3>Pedido #{{ pedido.id }}</h3>
                  <p class="pedido-fecha">{{ formatearFecha(pedido.fecha) }}</p>
                </div>
                <select
                  class="estado-select"
                  :value="pedido.estado"
                  @change="handleActualizarEstado(pedido.id, ($event.target as HTMLSelectElement).value)"
                  :disabled="actualizandoEstados[pedido.id]"
                >
                  <option value="pendiente">Pendiente</option>
                  <option value="en_preparacion">En Preparación</option>
                  <option value="listo">Listo</option>
                  <option value="entregado">Entregado</option>
                  <option value="cancelado">Cancelado</option>
                </select>
              </div>
              <div class="pedido-body">
                <div class="pedido-info">
                  <p><strong>Sede:</strong> {{ pedido.sede }}</p>
                  <p><strong>Cliente:</strong> {{ pedido.cliente || 'N/A' }}</p>
                  <p><strong>Total:</strong> ${{ pedido.total.toFixed(2) }}</p>
                  <p><strong>Estado:</strong> {{ formatearEstado(pedido.estado) }}</p>
                </div>
                <div class="pedido-items">
                  <h4>Items:</h4>
                  <ul>
                    <li v-for="(item, index) in pedido.items" :key="index">
                      {{ item.cantidad }}x {{ item.nombre }} - ${{ (item.precio * item.cantidad).toFixed(2) }}
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { obtenerPedidos, actualizarEstadoPedido } from '../services/pedidoService';
import type { Pedido } from '../types';
import { postToParent } from '../config/messaging';
import '../styles/tasty.css';

// No necesita emits ahora

// Estado del componente
const pedidos = ref<Pedido[]>([]);
const loading = ref(false);
const actualizandoEstados = ref<Record<number, boolean>>({});
const filters = ref({
  estado: '',
  sede: '',
  busqueda: ''
});

let intervaloActualizacion: number | null = null;

// Pedidos filtrados
const pedidosFiltrados = computed(() => {
  return pedidos.value.filter(pedido => {
    const matchEstado = !filters.value.estado || pedido.estado === filters.value.estado;
    const matchSede = !filters.value.sede || pedido.sede === filters.value.sede;
    const matchBusqueda = !filters.value.busqueda ||
      pedido.id.toString().includes(filters.value.busqueda) ||
      pedido.cliente.toLowerCase().includes(filters.value.busqueda.toLowerCase());
    return matchEstado && matchSede && matchBusqueda;
  });
});

// Pedidos ordenados por fecha (más recientes primero)
const pedidosFiltradosOrdenados = computed(() => {
  return [...pedidosFiltrados.value].sort((a, b) => {
    return new Date(b.fecha).getTime() - new Date(a.fecha).getTime();
  });
});

// Cargar pedidos
const cargarPedidos = async () => {
  loading.value = true;
  try {
    const datos = await obtenerPedidos();
    pedidos.value = datos;
  } catch (error) {
    console.error('Error al cargar pedidos:', error);
    alert('Error al cargar los pedidos. Por favor recarga la página.');
  } finally {
    loading.value = false;
  }
};

// Aplicar filtros (reactivo automáticamente a través de computed)
const aplicarFiltros = () => {
  // Los filtros se aplican automáticamente a través del computed
};

// Manejar actualización de estado
const handleActualizarEstado = async (id: number, estado: string) => {
  if (!confirm(`¿Estás seguro de cambiar el estado del pedido #${id} a "${estado}"?`)) {
    // Recargar para restaurar el valor anterior
    await cargarPedidos();
    return;
  }

  actualizandoEstados.value[id] = true;
  try {
    const success = await actualizarEstadoPedido(id, estado as Pedido['estado']);
    if (success) {
      await cargarPedidos();
    } else {
      alert('Error al actualizar el estado del pedido.');
      await cargarPedidos(); // Recargar para restaurar
    }
  } catch (error) {
    console.error('Error:', error);
    alert('Error al actualizar el estado del pedido.');
    await cargarPedidos(); // Recargar para restaurar
  } finally {
    actualizandoEstados.value[id] = false;
  }
};

// Formatear fecha
const formatearFecha = (fecha: string) => {
  return new Date(fecha).toLocaleString('es-ES');
};

// Formatear estado
const formatearEstado = (estado: Pedido['estado']) => {
  const estados: Record<string, string> = {
    'pendiente': 'Pendiente',
    'en_preparacion': 'En Preparación',
    'listo': 'Listo',
    'entregado': 'Entregado',
    'cancelado': 'Cancelado'
  };
  return estados[estado] || estado;
};

// Verificar autenticación de admin.
// Si estamos en iframe, el shell Angular ya restringe /admin/pedidos a admins → no pedir sesión ni mostrar mensaje.
const verificarAdminLogueado = (): boolean => {
  if (window.self !== window.top) {
    return true;
  }
  try {
    const adminStr = sessionStorage.getItem('tasty_admin_sesion');
    if (adminStr) {
      const admin = JSON.parse(adminStr) as { isAdmin?: boolean; email?: string };
      return admin.isAdmin === true && admin.email === 'admin@tastyuleam.com';
    }
    return sessionStorage.getItem('adminLoggedIn') === 'true';
  } catch {
    return false;
  }
};

// Cerrar sesión (limpiar también clave de Angular)
const handleCerrarSesion = () => {
  if (confirm('¿Estás seguro de que deseas cerrar sesión?')) {
    sessionStorage.removeItem('tasty_admin_sesion');
    sessionStorage.removeItem('adminLoggedIn');
    sessionStorage.removeItem('adminEmail');
    window.location.hash = '/';
    if (window.parent && window.parent !== window) {
      postToParent({ type: 'navigate', route: '/home' });
    }
  }
};

// Lifecycle hooks
onMounted(async () => {
  if (!verificarAdminLogueado()) {
    alert('Debes iniciar sesión como administrador para acceder a esta sección.');
    if (window.parent && window.parent !== window) {
      postToParent({ type: 'navigate', route: '/acceso' });
    } else {
      window.location.hash = '/login';
    }
    return;
  }

  await cargarPedidos();

  // Configurar actualización automática cada 2 segundos
  intervaloActualizacion = window.setInterval(async () => {
    await cargarPedidos();
  }, 2000);
});

onUnmounted(() => {
  if (intervaloActualizacion !== null) {
    clearInterval(intervaloActualizacion);
  }
});
</script>
