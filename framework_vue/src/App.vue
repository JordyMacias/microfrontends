<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import Pedido from './components/pedido.vue';
import GestionPedido from './components/gestionPedido.vue';

const currentRoute = ref<string>('');

const updateRoute = () => {
  const hash = window.location.hash.slice(1) || '/pedido';
  currentRoute.value = hash;
  console.log('Ruta actual (pedidos):', currentRoute.value);
};

const currentComponent = computed(() => {
  const route = currentRoute.value.split('?')[0]; // Obtener ruta sin parámetros
  switch (route) {
    case '/':
    case '':
    case '/pedido':
      return Pedido;
    case '/gestion-pedido':
      return GestionPedido;
    default:
      return Pedido;
  }
});

onMounted(() => {
  updateRoute();
  window.addEventListener('hashchange', updateRoute);
  window.addEventListener('popstate', updateRoute);
});

onUnmounted(() => {
  window.removeEventListener('hashchange', updateRoute);
  window.removeEventListener('popstate', updateRoute);
});
</script>

<template>
  <div id="app">
    <component :is="currentComponent" />
  </div>
</template>
