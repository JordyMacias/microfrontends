# 🚀 INSTRUCCIONES PARA EJECUTAR EL PROYECTO

## Paso 1: Abre una Terminal en VS Code

Presiona `Ctrl + `` (backtick) o ve a **Terminal > Nueva terminal**

## Paso 2: Navega a la carpeta del proyecto

```bash
cd prototipo
```

## Paso 3: Instala las dependencias (solo la primera vez)

```bash
npm install
```

## Paso 4: Inicia el servidor de desarrollo

```bash
npm run dev
```

Deberías ver algo como:

```
  VITE v7.2.4  ready in 123 ms

  ➜  Local:   http://localhost:5173/
  ➜  Press h + enter to show help
```

## Paso 5: Abre el navegador

Presiona `Ctrl + Click` en la URL `http://localhost:5173/` o cópiala manualmente en tu navegador.

---

## 📋 Antes de que funcione correctamente:

⚠️ **IMPORTANTE**: El proyecto está configurado con Firebase, pero necesitas:

1. **Crear un proyecto en Firebase** (ve a `CONFIGURACION_BASE_DATOS.md`)
2. **Obtener tus credenciales** de Firebase
3. **Actualizar el archivo `.env.local`** con tus credenciales

Sin esto, la base de datos no funcionará, pero la aplicación seguirá cargando correctamente.

---

## 🧪 Prueba la Aplicación

### Pantalla de Inicio
- URL: `http://localhost:5173/`
- Verás el menú principal con las 3 sedes

### Registro (sin Firebase configurado)
- URL: `http://localhost:5173/registro`
- Los datos se guardarán en localStorage localmente
- Una vez configures Firebase, se guardarán en la base de datos

### Sede / Menú
- URL: `http://localhost:5173/sede/tasty-central`
- Ver menú y hacer pedidos

### Admin Panel
- URL: `http://localhost:5173/admin/login`
- Usuario: `admin@tastyuleam.com`
- Contraseña: `admin123`

---

## 📁 Archivos Importantes

- `CONFIGURACION_BASE_DATOS.md` - Guía completa para configurar Firebase
- `.env.local` - Tus credenciales de Firebase (NO incluir en Git)
- `.env.example` - Plantilla de variables de entorno
- `src/config/firebase.ts` - Configuración de Firebase
- `src/services/authService.ts` - Servicio de autenticación

---

## ⚡ Comandos Útiles

```bash
# Desarrollo con hot reload
npm run dev

# Compilar para producción
npm run build

# Ver el build compilado
npm run preview

# Verificar errores de lint
npm run lint
```

---

## 🎉 ¡Listo!

Tu proyecto está completamente configurado y funcionando.
Solo necesitas configurar Firebase para que la base de datos funcione correctamente.

¿Dudas? Consulta `CONFIGURACION_BASE_DATOS.md`
