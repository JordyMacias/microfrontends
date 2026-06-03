<template>
  <div class="content">
    <div class="container">
      <!-- Header principal eliminado; ahora lo maneja Angular como shell -->
      <!-- Tabs para cambiar entre crear pedido y ver pedidos -->
      <div class="pedido-tabs" style="margin-bottom: 30px; display: flex; gap: 15px; border-bottom: 2px solid rgba(255,255,255,0.1);">
        <button 
          :class="['tab-btn', { active: activeTab === 'crear' }]"
          @click="activeTab = 'crear'"
          style="background: transparent; border: none; color: var(--card); padding: 15px 20px; font-size: 16px; font-weight: 600; cursor: pointer; border-bottom: 3px solid transparent; transition: all 0.2s;"
          :style="{ borderBottomColor: activeTab === 'crear' ? 'var(--primary)' : 'transparent', color: activeTab === 'crear' ? 'var(--primary)' : 'var(--card)' }"
        >
          Crear Pedido
        </button>
        <button 
          :class="['tab-btn', { active: activeTab === 'listar' }]"
          @click="activeTab = 'listar'"
          style="background: transparent; border: none; color: var(--card); padding: 15px 20px; font-size: 16px; font-weight: 600; cursor: pointer; border-bottom: 3px solid transparent; transition: all 0.2s;"
          :style="{ borderBottomColor: activeTab === 'listar' ? 'var(--primary)' : 'transparent', color: activeTab === 'listar' ? 'var(--primary)' : 'var(--card)' }"
        >
          Mis Pedidos ({{ misPedidos.length }})
        </button>
      </div>

      <!-- Tab: Crear Pedido -->
      <div v-if="activeTab === 'crear'" class="pedido-create">
        <div class="login-card registro-card" style="max-width: 600px; margin: 0 auto;">
          <div class="login-brand">
            <div class="logo" style="color: var(--primary);">Tasty Uleam</div>
            <p class="muted">Realizar pedido — Completa la información</p>
          </div>

          <form @submit.prevent="handleSubmit" class="login-form registro-form">
            <div class="form-group">
              <label for="facultad">Selecciona tu facultad *</label>
              <select
                id="facultad"
                v-model="formData.facultad"
                required
              >
                <option value="">Selecciona tu facultad</option>
                <option value="FACULTAD CIENCIAS DE LA SALUD">FACULTAD CIENCIAS DE LA SALUD</option>
                <option value="FACULTAD CIENCIAS ADMINISTRATIVAS, CONTABLES Y COMERCIO">FACULTAD CIENCIAS ADMINISTRATIVAS, CONTABLES Y COMERCIO</option>
                <option value="FACULTAD DE EDUCACIÓN TURISMO ARTES Y HUMANIDADES">FACULTAD DE EDUCACIÓN TURISMO ARTES Y HUMANIDADES</option>
                <option value="FACULTAD INGENIERÍA, INDUSTRIA Y CONSTRUCCIÓN">FACULTAD INGENIERÍA, INDUSTRIA Y CONSTRUCCIÓN</option>
                <option value="FACULTAD CIENCIAS DE LA VIDA Y TECNOLOGÍAS">FACULTAD CIENCIAS DE LA VIDA Y TECNOLOGÍAS</option>
                <option value="FACULTAD CIENCIAS SOCIALES DERECHO Y BIENESTAR">FACULTAD CIENCIAS SOCIALES DERECHO Y BIENESTAR</option>
              </select>
            </div>

            <div class="form-group">
              <label for="sede">Sede *</label>
              <select
                id="sede"
                v-model="formData.sede"
                required
              >
                <option value="">Selecciona una sede</option>
                <option value="Tasty Central">Tasty Central</option>
                <option value="Tasty Express">Tasty Express</option>
                <option value="Tasty Comedor">Tasty Comedor</option>
              </select>
            </div>

            <div v-if="!usuarioLogueado" class="form-group">
              <label for="cliente">Nombre del cliente *</label>
              <input
                id="cliente"
                v-model="formData.cliente"
                type="text"
                placeholder="Tu nombre completo"
                required
              />
            </div>
            <div v-else class="form-group">
              <label for="cliente-logueado">Cliente</label>
              <input
                id="cliente-logueado"
                :value="nombreUsuario"
                type="text"
                disabled
                style="background-color: rgba(255,255,255,0.1); cursor: not-allowed;"
              />
              <small style="color: var(--muted); font-size: 12px;">Este pedido se registrará a tu nombre: {{ nombreUsuario }}</small>
            </div>

            <div class="form-group">
              <label for="cedula">Cédula de Identidad *</label>
              <input
                id="cedula"
                v-model="formData.cedula"
                type="text"
                placeholder="Ingresa tu cédula (10 dígitos)"
                maxlength="10"
                pattern="[0-9]{10}"
                required
                @input="validarCedula"
              />
              <small v-if="formData.cedula && formData.cedula.length !== 10" style="color: #ef4444; font-size: 12px; display: block; margin-top: 5px;">
                La cédula debe tener exactamente 10 dígitos
              </small>
              <small v-else style="color: var(--muted); font-size: 12px; display: block; margin-top: 5px;">
                Ingresa solo números (10 dígitos)
              </small>
            </div>

            <div v-if="items.length > 0" class="pedido-items-section" style="margin-top: 20px;">
              <div style="background: rgba(179, 107, 33, 0.1); padding: 12px; border-radius: 8px; margin-bottom: 15px; border-left: 4px solid var(--primary);">
                <p style="margin: 0; color: var(--primary); font-weight: 600; font-size: 14px;">
                  ✅ Tienes {{ items.length }} item(s) en tu pedido desde el menú
                </p>
                <p style="margin: 5px 0 0 0; color: var(--muted); font-size: 12px;">
                  Total: ${{ total.toFixed(2) }}
                </p>
              </div>
              <h4 style="font-family: 'Poppins', sans-serif; font-size: 18px; margin-bottom: 15px; color: #0b0b0b;">Items del pedido:</h4>
              <div class="items-list" style="margin-bottom: 20px;">
                <div
                  v-for="(item, index) in items"
                  :key="index"
                  class="carrito-item"
                  style="background: rgba(179, 107, 33, 0.05); padding: 15px; border-radius: 8px; margin-bottom: 12px; border: 1px solid rgba(179, 107, 33, 0.2); display: flex; justify-content: space-between; align-items: center; gap: 15px;"
                >
                  <div class="carrito-item-info" style="flex: 1;">
                    <h4 style="font-size: 15px; margin-bottom: 5px; color: #0b0b0b;">{{ item.nombre }}</h4>
                    <p style="font-size: 13px; color: var(--muted);">Cantidad: {{ item.cantidad }} | Precio unitario: ${{ item.precio.toFixed(2) }}</p>
                    <p style="font-size: 14px; color: var(--primary); font-weight: 700; margin-top: 8px;">
                      Subtotal: ${{ (item.precio * item.cantidad).toFixed(2) }}
                    </p>
                  </div>
                  <button
                    @click="eliminarItemCarrito(index)"
                    class="btn-eliminar-item"
                    style="padding: 8px 15px; border-radius: 6px; border: 1px solid #dc3545; background: rgba(220,53,69,0.1); color: #dc3545; font-weight: 600; cursor: pointer; transition: all 0.2s; font-size: 14px; white-space: nowrap;"
                    title="Eliminar item del carrito"
                  >
                    ❌ Quitar
                  </button>
                </div>
              </div>
              <div class="carrito-total" style="border-top: 2px solid rgba(179, 107, 33, 0.2); padding-top: 15px;">
                <p style="font-size: 22px; font-weight: 700; color: var(--primary); text-align: center; margin-bottom: 15px;">
                  Total: ${{ total.toFixed(2) }}
                </p>
              </div>
            </div>

            <div v-else class="carrito-vacio" style="text-align: center; color: var(--muted); padding: 40px 0;">
              <p>No hay items en el pedido. Agrega items al carrito primero.</p>
              <p style="margin-top: 10px; font-size: 12px;">
                💡 Ve a "Sedes / Menú" para agregar items al carrito, luego vuelve aquí.
              </p>
            </div>

            <button
              type="submit"
              class="btn-primary login-submit"
              :disabled="loading || items.length === 0"
              :style="{ opacity: (loading || items.length === 0) ? 0.6 : 1, cursor: (loading || items.length === 0) ? 'not-allowed' : 'pointer' }"
            >
              {{ loading ? 'Procesando...' : 'Realizar Pedido' }}
            </button>
          </form>

          <div v-if="error" style="margin-top: 15px; padding: 12px; background: rgba(220, 53, 69, 0.1); border: 1px solid rgba(220, 53, 69, 0.3); border-radius: 8px; color: #dc3545; text-align: center;">
            {{ error }}
          </div>
        </div>
      </div>

      <!-- Tab: Listar Pedidos -->
      <div v-if="activeTab === 'listar'" class="pedido-list">
        <div class="section-header" style="margin-bottom: 30px;">
          <h2 class="section-title">Mis Pedidos</h2>
          <button class="btn-primary" @click="cargarMisPedidos" :disabled="loadingPedidos">
            {{ loadingPedidos ? 'Cargando...' : 'Actualizar' }}
          </button>
        </div>

        <div v-if="loadingPedidos" style="text-align: center; padding: 40px; color: var(--muted);">
          Cargando pedidos...
        </div>

        <div v-else-if="misPedidos.length === 0" class="empty-state">
          <p>No tienes pedidos registrados. ¡Crea tu primer pedido!</p>
          <div style="margin-top: 20px;">
            <button class="btn-primary" @click="goToMenu" style="padding: 12px 24px; font-size: 16px;">
              🍽️ Ir al Menú
            </button>
          </div>
        </div>

        <div v-else class="pedidos-list">
          <div
            v-for="pedido in misPedidosOrdenados"
            :key="pedido.id"
            :class="['pedido-card', `pedido-${pedido.estado}`]"
          >
            <div class="pedido-header">
              <div>
                <h3>Pedido #{{ pedido.id }}</h3>
                <p class="pedido-fecha">{{ formatearFecha(pedido.fecha) }}</p>
              </div>
              <div class="estado-badge" :class="`badge-${pedido.estado}`">
                {{ formatearEstado(pedido.estado) }}
              </div>
            </div>
            <div class="pedido-body">
              <div class="pedido-info">
                <p v-if="pedido.facultad"><strong>Facultad:</strong> {{ pedido.facultad }}</p>
                <p><strong>Sede:</strong> {{ pedido.sede }}</p>
                <p><strong>Cliente:</strong> {{ pedido.cliente || nombreUsuario || 'N/A' }}</p>
                <p><strong>Total:</strong> ${{ pedido.total.toFixed(2) }}</p>
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
            
            <!-- Botones de acción para pedido -->
            <div class="pedido-actions" style="margin-top: 20px; padding-top: 20px; border-top: 1px solid rgba(255,255,255,0.1); display: flex; justify-content: flex-end; gap: 10px; flex-wrap: wrap;">
              <!-- Botón para cancelar pedido (solo si no está cancelado ni entregado) -->
              <button
                v-if="pedido.estado !== 'cancelado' && pedido.estado !== 'entregado'"
                @click="cancelarPedido(pedido.id)"
                class="btn-cancel"
                style="padding: 10px 20px; border-radius: 8px; border: 1px solid #ef4444; background: rgba(239,68,68,0.1); color: #ef4444; font-weight: 600; cursor: pointer; transition: all 0.2s;"
                :disabled="loadingCancelacion === pedido.id"
              >
                {{ loadingCancelacion === pedido.id ? 'Cancelando...' : '❌ Cancelar Pedido' }}
              </button>
            </div>
            
            <!-- Mensaje si el pedido ya está cancelado -->
            <div v-if="pedido.estado === 'cancelado'" class="pedido-cancelado" style="margin-top: 15px; padding: 15px; background: rgba(239,68,68,0.1); border: 1px solid rgba(239,68,68,0.3); border-radius: 8px; color: #ef4444; text-align: center;">
              Este pedido ha sido cancelado.
            </div>
          </div>
        </div>
        
        <!-- Botón para ir al menú -->
        <div style="margin-top: 30px; text-align: center;">
          <button class="btn-primary" @click="goToMenu" style="padding: 15px 30px; font-size: 16px;">
            🍽️ Ir al Menú
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { crearPedido, obtenerPedidos, actualizarEstadoPedido } from '../services/pedidoService';
import { obtenerUsuarioActual } from '../services/authService';
import type { PedidoItem, Pedido } from '../types';
import { isEmbeddedInShell, isShellOrigin, postToParent } from '../config/messaging';
import '../styles/tasty.css';

// Props - si se reciben items desde fuera
const props = defineProps<{
  items?: PedidoItem[];
}>();

// Estado del componente
const activeTab = ref<'crear' | 'listar'>('listar');
const formData = ref({
  facultad: '',
  sede: '',
  cliente: '',
  cedula: ''
});

const items = ref<PedidoItem[]>(props.items || []);
const loading = ref(false);
const error = ref('');
const misPedidos = ref<Pedido[]>([]);
const loadingPedidos = ref(false);
const loadingCancelacion = ref<number | null>(null);
const usuarioLogueado = ref(false);
const nombreUsuario = ref('');

// Calcular total
const total = computed(() => {
  return items.value.reduce((sum, item) => sum + (item.precio * item.cantidad), 0);
});

// Pedidos ordenados por fecha (más recientes primero)
const misPedidosOrdenados = computed(() => {
  return [...misPedidos.value].sort((a, b) => {
    return new Date(b.fecha).getTime() - new Date(a.fecha).getTime();
  });
});

// Obtener ID del usuario actual
const obtenerUsuarioId = (): string | null => {
  try {
    // Usar la misma función que se usa para verificar el usuario logueado
    const usuario = obtenerUsuarioActual();
    if (usuario && usuario.id) {
      const userId = String(usuario.id);
      console.log('👤 Usuario ID obtenido:', userId, 'Usuario:', usuario.nombre, usuario.apellido);
      return userId; // Convertir a string si es número
    }
    console.log('ℹ️ No hay usuario logueado o no tiene ID');
    return null;
  } catch (e) {
    console.error('❌ Error al obtener usuario:', e);
    return null;
  }
};

// Cargar pedidos del usuario
const cargarMisPedidos = async () => {
  loadingPedidos.value = true;
  try {
    const todosLosPedidos = await obtenerPedidos();
    const usuarioId = obtenerUsuarioId();
    
    console.log('📋 Cargando pedidos:');
    console.log('  - Total de pedidos en storage:', todosLosPedidos.length);
    console.log('  - Usuario ID actual:', usuarioId);
    console.log('  - Usuario logueado:', usuarioLogueado.value);
    
    if (usuarioId) {
      // Filtrar SOLO los pedidos del usuario actual
      // Comparar como string para evitar problemas de tipo
      const usuarioIdStr = String(usuarioId);
      console.log('🔍 Filtrando pedidos para usuario ID:', usuarioIdStr);
      
      const pedidosFiltrados = todosLosPedidos.filter(p => {
        // Manejar diferentes formatos de usuario_id
        let pedidoUserId: string | null = null;
        if (p.usuario_id !== null && p.usuario_id !== undefined) {
          pedidoUserId = String(p.usuario_id);
        }
        
        const match = pedidoUserId === usuarioIdStr;
        
        if (match) {
          console.log('  ✅ Pedido encontrado para usuario:', {
            id: p.id,
            usuario_id: p.usuario_id,
            cliente: p.cliente,
            fecha: p.fecha
          });
        } else if (pedidoUserId) {
          console.log('  ❌ Pedido NO coincide:', {
            id: p.id,
            pedido_usuario_id: pedidoUserId,
            usuario_actual_id: usuarioIdStr,
            cliente: p.cliente
          });
        }
        
        return match;
      });
      
      misPedidos.value = pedidosFiltrados;
      console.log(`✅ Usuario logueado (ID: ${usuarioIdStr}), mostrando ${misPedidos.value.length} pedidos propios`);
      
      // Si hay pedidos pero no aparecen, mostrar debug detallado
      if (todosLosPedidos.length > 0 && misPedidos.value.length === 0) {
        console.warn('⚠️ Hay pedidos en storage pero ninguno coincide con el usuario actual');
        console.warn('⚠️ Usuario ID buscado:', usuarioIdStr);
        console.warn('⚠️ Pedidos en storage:', todosLosPedidos.map(p => ({
          id: p.id,
          usuario_id: p.usuario_id,
          usuario_id_tipo: typeof p.usuario_id,
          usuario_id_string: p.usuario_id ? String(p.usuario_id) : 'null',
          cliente: p.cliente,
          coincide: p.usuario_id ? String(p.usuario_id) === usuarioIdStr : false
        })));
      }
    } else {
      // Si no está logueado, no mostrar ningún pedido
      console.log('ℹ️ Usuario no logueado, no se muestran pedidos');
      misPedidos.value = [];
    }
  } catch (error) {
    console.error('❌ Error al cargar pedidos:', error);
    alert('Error al cargar los pedidos. Por favor recarga la página.');
    misPedidos.value = [];
  } finally {
    loadingPedidos.value = false;
  }
};

// Cargar items desde localStorage si no se proporcionan como props
onMounted(async () => {
  try {
    // Verificar si hay usuario logueado (compatible con Angular)
    verificarUsuarioLogueado();
    
    // Inicializar usuarios de ejemplo si no hay ninguno
    const { inicializarUsuariosEjemplo } = await import('../services/authService');
    inicializarUsuariosEjemplo();
    
    // Inicializar pedidos de ejemplo si no hay ninguno
    const { inicializarPedidosEjemplo } = await import('../services/pedidoService');
    inicializarPedidosEjemplo();
    
    // Solo cargar pedidos si el usuario está logueado (sin mostrar alert molesto)
    if (usuarioLogueado.value) {
      await cargarMisPedidos();
    } else {
      // Si no está logueado, simplemente no cargar pedidos (el usuario puede ver el formulario de crear pedido)
      console.log('Usuario no logueado - se puede crear pedido como invitado');
    }
  } catch (error) {
    console.error('Error al inicializar pedido:', error);
  }

  // Si se reciben items como props, úsalos directamente
  if (props.items && props.items.length > 0) {
    items.value = props.items;
    activeTab.value = 'crear';
  }

  // React (5173) y Vue (5174) NO comparten localStorage.
  // Pedimos el carrito al Angular (parent) vía postMessage.
  const handleMessage = (event: MessageEvent) => {
    if (!isShellOrigin(event.origin)) return;

    const data = event.data as { type?: string; items?: unknown[]; sede?: string };
    if (!data || typeof data !== 'object') return;
    if (data.type !== 'carrito-data') return;

    try {
      const incoming = Array.isArray(data.items) ? data.items : [];
      console.log('✅ Carrito recibido desde Angular:', incoming);

      // Convertir CarritoItem (React) -> PedidoItem (Vue)
      const converted: PedidoItem[] = incoming.map((it: any) => ({
        id: it.id,
        nombre: it.nombre,
        precio: Number(it.precio) || 0,
        cantidad: Number(it.cantidad) || 1,
      }));

      if (converted.length > 0) {
        items.value = converted;
        activeTab.value = 'crear';
      }

      if (typeof data.sede === 'string' && data.sede) {
        formData.value.sede = data.sede;
      }
    } catch (e) {
      console.error('❌ Error procesando carrito recibido:', e);
    }
  };

  globalThis.addEventListener('message', handleMessage);
  onUnmounted(() => globalThis.removeEventListener('message', handleMessage));

  // Solicitar el carrito al parent (Angular)
  if (isEmbeddedInShell()) {
    postToParent({ type: 'get-carrito' });
    // Retry corto por si Vue monta antes de que Angular guarde
    setTimeout(() => postToParent({ type: 'get-carrito' }), 300);
    setTimeout(() => postToParent({ type: 'get-carrito' }), 800);
  }

  // Escuchar cambios de autenticación desde Angular
  globalThis.addEventListener('auth-changed', () => {
    console.log('Evento auth-changed recibido - verificando usuario');
    verificarUsuarioLogueado();
    if (usuarioLogueado.value) {
      cargarMisPedidos();
    }
  });

  // Escuchar cambios en storage (para detectar login desde Angular)
  globalThis.addEventListener('storage', (e) => {
    if (e.key === 'tasty_sesion' || e.key === 'tasty_usuario_actual') {
      console.log('Cambio detectado en storage de autenticación');
      verificarUsuarioLogueado();
      if (usuarioLogueado.value) {
        cargarMisPedidos();
      }
    }
  });

  // Obtener nombre del cliente si está logueado
  const usuario = obtenerUsuarioActual();
  if (usuario) {
    formData.value.cliente = `${usuario.nombre} ${usuario.apellido}`;
  }

  // Cargar sede desde localStorage si fue guardada desde React
  const sedeGuardada = localStorage.getItem('pedidoSede');
  if (sedeGuardada) {
    formData.value.sede = sedeGuardada;
  }
});

// Manejar envío del formulario
const handleSubmit = async () => {
  // Validar campos requeridos
  if (!formData.value.facultad || !formData.value.sede || items.value.length === 0) {
    error.value = 'Por favor completa todos los campos y asegúrate de tener items en el pedido.';
    return;
  }

  // Validar cédula (debe tener exactamente 10 dígitos)
  if (!formData.value.cedula || formData.value.cedula.length !== 10) {
    error.value = 'La cédula de identidad debe tener exactamente 10 dígitos.';
    return;
  }

  // Si no está logueado, requiere nombre de cliente
  if (!usuarioLogueado.value && !formData.value.cliente) {
    error.value = 'Debes iniciar sesión o ingresar tu nombre completo para realizar un pedido.';
    return;
  }
  
  // Si está logueado pero no tiene cliente en el formulario, usar el nombre del usuario
  if (usuarioLogueado.value && !formData.value.cliente) {
    formData.value.cliente = nombreUsuario.value;
  }

  loading.value = true;
  error.value = '';

  try {
    // Validar que hay items
    if (!items.value || items.value.length === 0) {
      error.value = 'No hay items en el pedido. Por favor agrega items desde el menú.';
      loading.value = false;
      return;
    }

    console.log('Creando pedido con los siguientes datos:');
    console.log('- Items:', items.value);
    console.log('- Sede:', formData.value.sede);
    console.log('- Facultad:', formData.value.facultad);
    console.log('- Cédula:', formData.value.cedula);
    
    // Obtener usuario_id del usuario logueado
    // IMPORTANTE: Verificar el estado actual del usuario antes de obtener el ID
    verificarUsuarioLogueado();
    const usuarioId = obtenerUsuarioId();
    console.log('🔍 Estado antes de crear pedido:');
    console.log('  - Usuario logueado:', usuarioLogueado.value);
    console.log('  - Usuario ID:', usuarioId);
    console.log('  - Nombre usuario:', nombreUsuario.value);
    
    // Si está logueado, usar el nombre del usuario logueado; si no, usar el que ingresó
    const nombreCliente = usuarioLogueado.value ? nombreUsuario.value : formData.value.cliente;
    console.log('- Cliente:', nombreCliente);
    
    // Si el usuario está logueado pero no tenemos usuarioId, hay un problema
    if (usuarioLogueado.value && !usuarioId) {
      console.error('❌ ERROR: Usuario está logueado pero no se pudo obtener el ID');
      error.value = 'Error al obtener información del usuario. Por favor inicia sesión nuevamente.';
      loading.value = false;
      return;
    }
    
    // Validar que los items tienen la estructura correcta
    const itemsValidados = items.value.map(item => ({
      id: item.id,
      nombre: item.nombre,
      precio: Number(item.precio),
      cantidad: Number(item.cantidad)
    }));
    
    console.log('Items validados:', itemsValidados);
    
    const pedidoCreado = await crearPedido(
      itemsValidados,
      formData.value.sede,
      nombreCliente,
      usuarioId || undefined,
      formData.value.facultad,
      formData.value.cedula
    );

    if (pedidoCreado) {
      console.log('✅ Pedido creado exitosamente:', pedidoCreado);
      console.log('📋 Detalles del pedido guardado:');
      console.log('  - ID:', pedidoCreado.id);
      console.log('  - Usuario ID:', pedidoCreado.usuario_id);
      console.log('  - Cliente:', pedidoCreado.cliente);
      console.log('  - Items:', pedidoCreado.items.length);
      console.log('  - Total:', pedidoCreado.total);
      
      // Verificar que se guardó correctamente
      const pedidosVerificados = await obtenerPedidos();
      console.log('📦 Total de pedidos en storage:', pedidosVerificados.length);
      const pedidoEncontrado = pedidosVerificados.find(p => p.id === pedidoCreado.id);
      
      if (pedidoEncontrado) {
        console.log('✅ Pedido verificado en storage:', pedidoEncontrado);
        console.log('  - Usuario ID del pedido guardado:', pedidoEncontrado.usuario_id);
      } else {
        console.error('❌ ERROR: El pedido no se encontró en storage después de guardar');
      }
      
      // Limpiar carrito (compatible con React y Angular)
      localStorage.removeItem('carritoItems');
      items.value = [];
      globalThis.dispatchEvent(new CustomEvent('carrito-updated', { detail: [] }));
      
      // Notificar al parent (Angular) que el carrito se limpió
      if (isEmbeddedInShell()) {
        try {
          postToParent({ type: 'set-carrito', items: [], sede: '' });
        } catch (e) {
          console.error('Error notificando limpieza de carrito:', e);
        }
      }
      
      alert(`¡Pedido #${pedidoCreado.id} realizado exitosamente!`);
      
      // Recargar lista de pedidos ANTES de cambiar de tab
      console.log('🔄 Recargando lista de pedidos...');
      
      // Esperar un momento para asegurar que el storage se actualizó
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Verificar el estado del usuario antes de recargar
      verificarUsuarioLogueado();
      const usuarioIdActual = obtenerUsuarioId();
      console.log('🔍 Estado antes de recargar pedidos:');
      console.log('  - Usuario logueado:', usuarioLogueado.value);
      console.log('  - Usuario ID:', usuarioIdActual);
      console.log('  - Usuario ID del pedido guardado:', pedidoCreado.usuario_id);
      
      // Recargar la lista
      await cargarMisPedidos();
      
      // Verificar que el pedido aparece en la lista
      const pedidoEnLista = misPedidos.value.find(p => p.id === pedidoCreado.id);
      if (pedidoEnLista) {
        console.log('✅ Pedido encontrado en "Mis Pedidos":', pedidoEnLista);
        console.log('✅ Total de pedidos en "Mis Pedidos":', misPedidos.value.length);
      } else {
        console.error('❌ El pedido NO aparece en "Mis Pedidos"');
        console.error('  - Usuario ID actual:', usuarioIdActual);
        console.error('  - Usuario ID del pedido:', pedidoCreado.usuario_id);
        console.error('  - ¿Coinciden?:', usuarioIdActual === pedidoCreado.usuario_id);
        console.error('  - Pedidos en la lista:', misPedidos.value.length);
        console.error('  - Todos los pedidos en storage:', (await obtenerPedidos()).map(p => ({
          id: p.id,
          usuario_id: p.usuario_id,
          cliente: p.cliente
        })));
        
        // Si el usuario está logueado pero el pedido no aparece, intentar recargar sin filtro
        if (usuarioLogueado.value && usuarioIdActual) {
          console.log('🔄 Intentando recargar sin filtro para debug...');
          const todosLosPedidos = await obtenerPedidos();
          const pedidoSinFiltro = todosLosPedidos.find(p => p.id === pedidoCreado.id);
          if (pedidoSinFiltro) {
            console.log('✅ Pedido encontrado sin filtro:', pedidoSinFiltro);
            // Forzar agregar el pedido a la lista si coincide el usuario_id
            if (String(pedidoSinFiltro.usuario_id) === String(usuarioIdActual)) {
              console.log('✅ Coincide usuario_id, agregando manualmente a la lista');
              misPedidos.value.push(pedidoSinFiltro);
            }
          }
        }
      }
      
      // Cambiar a tab de listar para mostrar los pedidos
      activeTab.value = 'listar';
      
      // Resetear formulario (pero mantener sede si viene de React)
      const sedeAnterior = formData.value.sede;
      formData.value = {
        facultad: '',
        sede: sedeAnterior || '',
        cliente: formData.value.cliente || '',
        cedula: ''
      };
      
      // Limpiar sede guardada
      localStorage.removeItem('pedidoSede');
    } else {
      console.error('❌ Error: crearPedido retornó null');
      error.value = 'Error al crear el pedido. Por favor intenta de nuevo.';
      alert('Error al crear el pedido. Por favor revisa la consola para más detalles.');
    }
  } catch (err: any) {
    console.error('Error:', err);
    error.value = err.message || 'Error al crear el pedido. Por favor intenta de nuevo.';
  } finally {
    loading.value = false;
  }
};

// Validar cédula (solo números, máximo 10 dígitos)
const validarCedula = () => {
  // Remover cualquier carácter que no sea número
  formData.value.cedula = formData.value.cedula.replace(/\D/g, '');
  
  // Limitar a 10 dígitos
  if (formData.value.cedula.length > 10) {
    formData.value.cedula = formData.value.cedula.substring(0, 10);
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

const goToMenu = () => {
  globalThis.location.hash = '/menu';
};

// Cancelar pedido
const cancelarPedido = async (pedidoId: number) => {
  if (!confirm('¿Estás seguro que deseas cancelar este pedido? Esta acción no se puede deshacer.')) {
    return;
  }

  loadingCancelacion.value = pedidoId;
  try {
    const exito = await actualizarEstadoPedido(pedidoId, 'cancelado');
    
    if (exito) {
      alert('✅ Pedido cancelado exitosamente');
      // Recargar pedidos
      await cargarMisPedidos();
    } else {
      alert('❌ Error al cancelar el pedido. Por favor intenta de nuevo.');
    }
  } catch (error) {
    console.error('Error al cancelar pedido:', error);
    alert('❌ Error al cancelar el pedido. Por favor intenta de nuevo.');
  } finally {
    loadingCancelacion.value = null;
  }
};

// Eliminar item del carrito
const eliminarItemCarrito = (index: number) => {
  const item = items.value[index];
  if (!item) {
    console.error('Item no encontrado en el índice:', index);
    return;
  }
  
  if (!confirm(`¿Deseas quitar "${item.nombre}" del carrito?`)) {
    return;
  }
  
  // Eliminar item del array
  items.value.splice(index, 1);
  
  // Actualizar localStorage (compatible con React)
  try {
    const itemsParaGuardar = items.value.map(item => ({
      id: item.id,
      nombre: item.nombre,
      precio: item.precio,
      cantidad: item.cantidad
    }));
    localStorage.setItem('carritoItems', JSON.stringify(itemsParaGuardar));
    globalThis.dispatchEvent(new CustomEvent('carrito-updated', { detail: itemsParaGuardar }));
    alert('✅ Item eliminado del carrito');
    
    // Si no hay más items, cambiar a tab de listar
    if (items.value.length === 0) {
      activeTab.value = 'listar';
    }
  } catch (error) {
    console.error('Error al actualizar carrito:', error);
    alert('Error al actualizar el carrito');
  }
};

// Verificar si hay usuario logueado (compatible con Angular)
const verificarUsuarioLogueado = () => {
  try {
    // Verificar en sessionStorage primero (compatible con Angular)
    const sesionStr = sessionStorage.getItem('tasty_sesion');
    let usuario = null;
    
    if (sesionStr) {
      usuario = JSON.parse(sesionStr);
    } else {
      // Intentar desde localStorage como fallback
      const usuarioStr = localStorage.getItem('tasty_usuario_actual');
      if (usuarioStr) {
        usuario = JSON.parse(usuarioStr);
      }
    }
    
    usuarioLogueado.value = usuario !== null && usuario !== undefined;
    if (usuario) {
      nombreUsuario.value = `${usuario.nombre} ${usuario.apellido}`;
    } else {
      nombreUsuario.value = '';
    }
    
    console.log('Usuario logueado:', usuarioLogueado.value, usuario ? nombreUsuario.value : 'No hay usuario');
    return usuarioLogueado.value;
  } catch (error) {
    console.error('Error al verificar usuario:', error);
    usuarioLogueado.value = false;
    nombreUsuario.value = '';
    return false;
  }
};
</script>
