# Tasty Uleam - Microfrontends

Este documento explica **cómo se unieron los tres frameworks** (Angular, React y Vue), **qué método de integración se usó**, **por qué se eligió ese método** y **cómo funciona el sistema de rutas** para que todo actúe como una sola aplicación.

---

## 1. ¿Cómo se unieron los frameworks?

La aplicación usa una arquitectura **Shell (cáscara)** con **microfrontends**:

| Framework | Puerto | Rol |
|-----------|--------|-----|
| **Angular** | 4200 | **Shell / contenedor** — layout, navegación, barra superior, autenticación |
| **React** | 5173 | **Sedes, menú, admin (menú y sedes)** — vistas de inicio, sede, panel de administración |
| **Vue** | 5174 | **Pedidos** — formulario de pedido y gestión de pedidos |

- **Angular** es la aplicación principal que el usuario abre (por ejemplo `http://localhost:4200`).
- **React** y **Vue** son aplicaciones independientes que se ejecutan en sus propios puertos (5173 y 5174).
- Cuando el usuario navega a una ruta que corresponde a React o Vue, el Shell de Angular **carga esa aplicación dentro de un iframe** en la zona de contenido (`<router-outlet />`).

Así, “se unen” en el sentido de que hay **una sola URL** (la de Angular) y **una sola barra de navegación**, pero el contenido de cada ruta puede ser una app React o Vue cargada en un iframe.

---

## 2. ¿Qué método se usó para unirlos?

Se usó el método **Shell + iframes** (contenedor con iframes):

1. **Angular Shell**
   - Una sola aplicación Angular que define:
     - Header, menú, login/logout.
     - Rutas principales (por ejemplo `/home`, `/sedes`, `/sedes/:sedeId`, `/admin/menu`, `/admin/pedidos`, `/pedido`, etc.).
   - En cada ruta que no es solo Angular, Angular renderiza un **componente contenedor** que muestra un **iframe**.

2. **Componente contenedor (`MicrofrontendContainer`)**
   - Recibe dos datos: qué app cargar (`react` o `vue`) y qué **ruta interna** de esa app mostrar (por ejemplo `/`, `/sede/tasty-central`, `/admin/panel`, `/#/pedido`).
   - Construye la URL del iframe así:  
     `baseUrl del microfrontend` + `ruta`.  
     Ejemplo: `http://localhost:5173` + `/sede/tasty-central` → `http://localhost:5173/sede/tasty-central`.
   - El iframe se muestra en el área de contenido del Shell. Así, React y Vue “viven” dentro del iframe, cada uno con su propia URL y su propio router.

3. **Configuración de URLs**
   - En `framework_angular/src/environments/microfrontends.ts` se definen las URLs base de React y Vue (por ejemplo `http://localhost:5173` y `http://localhost:5174`). El contenedor usa estas bases para armar la URL del iframe.

En resumen: **el método es “Shell (Angular) + iframes que cargan React y Vue por URL”.**

---

## 3. ¿Por qué se eligió este método y por qué no otros?

### Por qué se eligió **Shell + iframes**

- **Simplicidad**: No hace falta Module Federation, Webpack especial ni configuraciones complejas. Cada proyecto (Angular, React, Vue) se puede desarrollar y construir por separado con sus propias herramientas (Angular CLI, Vite, etc.).
- **Aislamiento**: Cada framework corre en su propio documento (el iframe). No hay mezcla de estilos ni de JavaScript entre Angular, React y Vue; es fácil evitar conflictos de CSS o de librerías.
- **Independencia**: Los equipos pueden actualizar React o Vue sin tocar el Shell, y el Shell puede cambiar sin reescribir React/Vue. Cada app puede tener su propio ciclo de despliegue.
- **Compatibilidad**: Funciona con cualquier versión de Angular, React y Vue, sin depender de soporte específico para “microfrontends” en el ecosistema.
- **Tiempo de desarrollo**: Para un proyecto académico o con plazos cortos, montar iframes y un contenedor es rápido frente a configurar Module Federation o single-spa.

### Por qué **no** se usaron otros métodos (resumido)

- **Module Federation (Webpack 5)**  
  Permite cargar módulos de otras aplicaciones en tiempo de ejecución en la misma página (sin iframe).  
  **No se eligió** porque exige configurar Webpack en los tres proyectos, versiones compatibles y un buen entendimiento de la API; además, en proyectos con Vite (React/Vue) la integración con Angular (que suele usar Webpack) se vuelve más compleja. Para este proyecto, el iframe dio el resultado deseado con menos complejidad.

- **single-spa**  
  Es un framework que orquesta varias aplicaciones (Angular, React, Vue) en la misma página, manejando ciclo de vida y rutas.  
  **No se eligió** porque implica adaptar cada app al contrato de single-spa (bootstrap, mount, unmount) y un router compartido. De nuevo, para el alcance del proyecto, el Shell con iframes fue más directo.

- **Cargar bundles en el Shell (sin iframe)**  
  El Shell podría cargar scripts de React/Vue e insertarlos en el DOM.  
  **No se eligió** porque hay que resolver conflictos de estilos, de versiones de React (si hay más de una), y de ámbito global. El iframe evita todo eso con un límite claro de contexto.

- **Links externos (abrir React/Vue en otra pestaña)**  
  No sería “una sola aplicación”; sería tres aplicaciones separadas con enlaces entre sí.  
  **No se eligió** porque el objetivo era una experiencia unificada: una barra de navegación y una URL base (Angular) con contenido de React y Vue integrado en la misma pantalla.

En síntesis: se eligió **Shell + iframes** por **facilidad, aislamiento y tiempo de implementación**, y no otros métodos porque implicaban más configuración o más acoplamiento del que se necesitaba para este proyecto.

---

## 4. Cómo se hizo la unión de rutas

El usuario solo ve las rutas del **Shell (Angular)**. La “unión” de rutas consiste en que **cada ruta del Shell decide qué mostrar**: un componente propio de Angular o un iframe que apunta a una URL de React o Vue.

### 4.1 Rutas definidas en el Shell (Angular)

En `framework_angular/src/app/app.routes.ts` se define algo equivalente a:

- Rutas bajo el layout del Shell (componente `Shell`):
  - `/home` → componente Angular (Home).
  - `/acceso` → componente Angular (login).
  - `/menu` → componente Angular (Menu).
  - **`/sedes`** → componente que muestra el **iframe de React** con ruta `/` (página de inicio de React).
  - **`/sedes/:sedeId`** → componente que lee `sedeId` y muestra el **iframe de React** con ruta `/sede/:sedeId`.
  - **`/admin/menu`** → iframe de React con ruta `/admin/panel`.
  - **`/admin/pedidos`** → iframe de Vue con ruta `/#/gestion-pedido`.
  - **`/admin/sedes`** → iframe de React con ruta `/admin/panel#sedes`.
  - **`/pedido`** → iframe de Vue con ruta `/#/pedido`.

Cualquier otra ruta (`**`) se redirige a `/home`.

### 4.2 Cómo se “mapean” las rutas del Shell a React y Vue

- Para **React**:  
  La base es `http://localhost:5173`.  
  - `/sedes` → iframe a `http://localhost:5173/`.  
  - `/sedes/tasty-central` → iframe a `http://localhost:5173/sede/tasty-central`.  
  - `/admin/menu` → iframe a `http://localhost:5173/admin/panel`.  
  - `/admin/sedes` → iframe a `http://localhost:5173/admin/panel#sedes`.  

  El componente de la ruta `/sedes/:sedeId` obtiene `sedeId` del `ActivatedRoute` de Angular y construye la cadena `sedeRoute = '/sede/' + sedeId`; el contenedor recibe esa `route` y arma la URL del iframe.

- Para **Vue**:  
  La base es `http://localhost:5174`. Vue usa hash routing (`#/...`).  
  - `/pedido` → iframe a `http://localhost:5174/#/pedido`.  
  - `/admin/pedidos` → iframe a `http://localhost:5174/#/gestion-pedido`.

Así, **la unión de rutas** es: “Angular tiene una sola tabla de rutas; para ciertas rutas, en lugar de un componente Angular se usa un contenedor que muestra un iframe con la URL correspondiente de React o Vue”.

### 4.3 Dónde se arma la URL del iframe

En el componente **MicrofrontendContainer** (`framework_angular/src/app/components/microfrontend-container/microfrontend-container.ts`):

- Recibe `app` (`'react' | 'vue'`) y `route` (ruta interna del microfrontend).
- Lee la base del microfrontend desde `MICROFRONTEND_CONFIG[app].baseUrl`.
- Concatena: `url = baseUrl + route` (con cuidado al `/` inicial).
- Esa URL se pasa al `src` del iframe (sanitizada con `DomSanitizer`).

Los componentes de página (por ejemplo `ReactInicioComponent`, `ReactSedeComponent`, `VuePedidoComponent`) solo renderizan:

```html
<app-microfrontend-container app="react" route="/" />
<app-microfrontend-container [app]="'react'" [route]="sedeRoute" />
<app-microfrontend-container app="vue" route="/#/pedido" />
```

etc. Así se “unen” la ruta del Shell y la ruta interna de cada microfrontend.

### 4.4 Comunicación Shell ↔ iframe (opcional)

El contenedor, cuando el iframe termina de cargar, puede enviar mensajes al iframe con `postMessage` (por ejemplo para indicar la sección de admin: menú, pedidos, reservas, sedes). React/Vue pueden escuchar esos mensajes y ajustar su estado. Esto no cambia el esquema de rutas, pero permite que el Shell y los microfrontends se coordinen cuando hace falta.

---

## 5. Resumen

| Pregunta | Respuesta breve |
|----------|-----------------|
| **¿Cómo se unieron los frameworks?** | Angular es el Shell; React y Vue se cargan dentro de iframes en rutas concretas del Shell. |
| **¿Qué método se usó?** | Shell (Angular) + iframes que cargan React y Vue por URL. |
| **¿Por qué este método?** | Simplicidad, aislamiento entre frameworks, poca configuración y adecuado para el alcance del proyecto. |
| **¿Por qué no otros?** | Module Federation y single-spa son más complejos; iframes evitan conflictos de estilos y versiones sin tocar el build de cada app. |
| **¿Cómo se unieron las rutas?** | El Shell define todas las rutas; para cada ruta de React/Vue, un componente renderiza un contenedor que muestra un iframe con la URL base del microfrontend + la ruta interna; así una sola barra de navegación (Angular) controla qué se muestra (Angular, React o Vue). |

Para ejecutar el proyecto y ver esta integración en marcha, consulta el apartado “Cómo ejecutar” en `README_MICROFRONTENDS.md` o los README de cada framework dentro de sus carpetas.
