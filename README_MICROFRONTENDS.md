# Tasty Uleam - Arquitectura Microfrontends

## Estructura

| Framework | Puerto | Rol | Componentes |
|-----------|--------|-----|-------------|
| **Angular** | 4200 | Shell / Kernel / Contenedor | Layout, navegación, routing |
| **React** | 5173 | Menú, Sedes, Admin | Header, SedeMenu, GestionMenu, AdminPanel, SedeHero, SedePedido |
| **Vue** | 5174 | Pedidos | pedido.vue, gestionPedido.vue |

## Cómo ejecutar

### Opción 1: Todo junto (recomendado)

```bash
# Instalar dependencias de todos los proyectos
npm run install:all

# Ejecutar los 3 microfrontends simultáneamente
npm start
```

### Opción 2: Por separado (en 3 terminales)

**Terminal 1 - Angular (Shell):**
```bash
cd framework_angular
npm start
```

**Terminal 2 - React:**
```bash
cd framework_react
npm run dev
```

**Terminal 3 - Vue:**
```bash
cd framework_vue
npm run dev
```

### Orden de inicio

1. **Primero** React (5173) y Vue (5174)
2. **Después** Angular (4200)

Angular carga React y Vue en iframes, por lo que React y Vue deben estar corriendo antes de navegar a esas rutas.

## Rutas en el Shell (Angular)

| Ruta | Microfrontend | Descripción |
|------|---------------|-------------|
| `/home` | Angular | Página de inicio |
| `/sedes` | React | Inicio con sedes (Tasty Central, Express, Comedor) |
| `/sedes/:sedeId` | React | Vista de sede con menú, y pedido |
| `/admin/menu` | React | Panel admin - Gestión de menú |
| `/admin/pedidos` | Vue | Panel admin - Gestión de pedidos |
| `/pedido` | Vue | Mis pedidos / Crear pedido |

## Comunicación entre microfrontends

### Carrito compartido (localStorage)

- **Clave:** `carritoItems`
- **Formato:** `PedidoItem[]` = `{ id, nombre, precio, cantidad }[]`
- **Flujo:** 
  1. Usuario agrega items en React (SedePedido)
  2. Se guarda en localStorage
  3. Usuario navega a Vue (Pedido)
  4. Vue lee `carritoItems` y muestra el formulario de pedido

### Eventos CustomEvent

- `carrito-updated`: Emitido cuando el carrito cambia (para sincronización en tiempo real si se usa en la misma ventana)

## Configuración de URLs

Las URLs de los microfrontends se configuran en:
`framework_angular/src/environments/microfrontends.ts`

Para producción, actualiza las URLs base según tu despliegue.
