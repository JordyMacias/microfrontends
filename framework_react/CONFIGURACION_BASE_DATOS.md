# Tasty Uleam - Guía de Configuración de Base de Datos (Supabase)

## ✅ Estado Actual
El proyecto está completamente funcional con:
- React 19 + TypeScript
- Vite como bundler
- React Router para navegación
- **Supabase configurado** (Auth + PostgreSQL)

## 🔧 Configuración de Supabase

### Paso 1: Crear un Proyecto en Supabase

1. Ve a [Supabase](https://supabase.com/)
2. Click en "Sign In"
3. Crea una cuenta o usa GitHub
4. Click en "New Project"
5. Nombre: `tasty-uleam`
6. Selecciona tu región más cercana
7. Crea una contraseña segura para la base de datos
8. Click en "Create new project" (espera 1-2 minutos mientras se inicializa)

### Paso 2: Configurar Tablas en Supabase

Una vez que tu proyecto esté listo:

1. Ve a **SQL Editor** en el panel de Supabase
2. Crea una nueva query
3. Copia y ejecuta el siguiente SQL:

```sql
-- Crear tabla usuarios
CREATE TABLE public.usuarios (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nombre VARCHAR(255) NOT NULL,
  apellido VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  telefono VARCHAR(20),
  fecha_nacimiento DATE,
  newsletter BOOLEAN DEFAULT false,
  fecha_registro TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  activo BOOLEAN DEFAULT true,
  FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Crear tabla menu_items
CREATE TABLE public.menu_items (
  id SERIAL PRIMARY KEY,
  nombre VARCHAR(255) NOT NULL,
  descripcion TEXT,
  precio DECIMAL(10, 2) NOT NULL,
  categoria VARCHAR(100),
  sede VARCHAR(100),
  disponible BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Crear tabla pedidos
CREATE TABLE public.pedidos (
  id SERIAL PRIMARY KEY,
  usuario_id UUID REFERENCES public.usuarios(id) ON DELETE CASCADE,
  items JSONB NOT NULL,
  total DECIMAL(10, 2) NOT NULL,
  estado VARCHAR(50) DEFAULT 'pendiente',
  sede VARCHAR(100),
  fecha_pedido TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Crear tabla reservas
CREATE TABLE public.reservas (
  id SERIAL PRIMARY KEY,
  usuario_id UUID REFERENCES public.usuarios(id) ON DELETE CASCADE,
  nombre VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  telefono VARCHAR(20),
  fecha DATE NOT NULL,
  hora TIME NOT NULL,
  personas INTEGER NOT NULL,
  sede VARCHAR(100),
  estado VARCHAR(50) DEFAULT 'pendiente',
  fecha_reserva TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Crear políticas de seguridad (RLS)
ALTER TABLE public.usuarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.menu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pedidos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reservas ENABLE ROW LEVEL SECURITY;

-- Políticas permisivas para desarrollo
CREATE POLICY "Allow authenticated users" ON public.usuarios FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Allow public read" ON public.menu_items FOR SELECT USING (true);
CREATE POLICY "Allow authenticated write" ON public.menu_items FOR INSERT USING (auth.role() = 'authenticated');
```

### Paso 3: Configurar Autenticación

1. Ve a **Authentication > Providers** en Supabase
2. Verifica que **Email** esté habilitado
3. Ve a **Authentication > Policies** (si es necesario)

### Paso 4: Obtener Credenciales

1. Ve a **Settings > API** en Supabase
2. En la sección **Project API keys**, copia:
   - **Project URL** → `VITE_SUPABASE_URL`
   - **anon public** → `VITE_SUPABASE_ANON_KEY`

### Paso 5: Actualizar .env.local

Abre el archivo `.env.local` en la raíz del proyecto:

```env
VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
VITE_SUPABASE_ANON_KEY=tu-anon-key-aqui
```

## 📦 Dependencias Instaladas

```json
{
  "dependencies": {
    "react": "^19.2.0",
    "react-dom": "^19.2.0",
    "react-router-dom": "^7.12.0",
    "@supabase/supabase-js": "^2.x.x"
  }
}
```

## 🚀 Comandos Disponibles

```bash
# Desarrollo
npm run dev

# Compilar para producción
npm run build

# Ver preview de build
npm run preview

# Linting
npm run lint
```

## 🗄️ Estructura de Tablas Supabase

### Tabla: `usuarios`
```sql
id UUID (PRIMARY KEY - vinculada a auth.users)
nombre VARCHAR
apellido VARCHAR
email VARCHAR (UNIQUE)
telefono VARCHAR
fecha_nacimiento DATE
newsletter BOOLEAN
fecha_registro TIMESTAMP
activo BOOLEAN
```

### Tabla: `menu_items`
```sql
id SERIAL (PRIMARY KEY)
nombre VARCHAR
descripcion TEXT
precio DECIMAL
categoria VARCHAR
sede VARCHAR
disponible BOOLEAN
created_at TIMESTAMP
```

### Tabla: `pedidos`
```sql
id SERIAL (PRIMARY KEY)
usuario_id UUID (FK)
items JSONB
total DECIMAL
estado VARCHAR ('pendiente'|'confirmado'|'entregado')
sede VARCHAR
fecha_pedido TIMESTAMP
```

### Tabla: `reservas`
```sql
id SERIAL (PRIMARY KEY)
usuario_id UUID (FK)
nombre VARCHAR
email VARCHAR
telefono VARCHAR
fecha DATE
hora TIME
personas INTEGER
sede VARCHAR
estado VARCHAR ('pendiente'|'confirmada'|'cancelada')
fecha_reserva TIMESTAMP
```

## 🔐 Políticas de Seguridad (Row Level Security)

Para **desarrollo** (inseguro pero útil para pruebas):
```sql
CREATE POLICY "Allow all for authenticated" ON public.usuarios FOR ALL USING (auth.role() = 'authenticated');
```

Para **producción** (más seguro):
```sql
CREATE POLICY "Users can view own data" ON public.usuarios FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own data" ON public.usuarios FOR UPDATE USING (auth.uid() = id);
```

## 🛠️ Troubleshooting

### El proyecto no compila
- Verifica que `@supabase/supabase-js` esté instalado: `npm install @supabase/supabase-js`
- Ejecuta `npm install` para actualizar todas las dependencias

### Los usuarios no se guardan en Supabase
- Verifica que las variables de entorno en `.env.local` sean correctas
- Abre la consola (F12) para ver errores de Supabase
- Verifica que la tabla `usuarios` exista en Supabase
- Verifica que las políticas RLS permitan escrituras (para desarrollo, usa `allow all`)

### Error "Auth error"
- Verifica que Email/Password esté habilitado en Authentication > Providers
- Confirma que las credenciales de Supabase sean válidas en `.env.local`

### "Table 'usuarios' not found"
- Copia el SQL del Paso 2 y ejecútalo en SQL Editor de Supabase
- Verifica que la tabla se creó correctamente en la pestaña de tablas

## ✨ Funcionalidades Implementadas

- ✅ Registro de usuarios con Supabase Auth
- ✅ Inicio de sesión
- ✅ Gestión de sesión
- ✅ Protección de rutas (Admin)
- ✅ Almacenamiento de datos en PostgreSQL (Supabase)
- ✅ Gestión de menús por sede
- ✅ Sistema de pedidos
- ✅ Sistema de reservas
- ✅ Panel de administrador

## 📱 Pantallas Disponibles

- **/** - Inicio
- **/registro** - Registro de usuarios
- **/login** - Inicio de sesión
- **/sede/:sedeId** - Detalle de sede con menú y reservas
- **/admin/login** - Login del administrador
- **/admin/panel** - Panel de administración (protegido)

## 🎯 Próximos Pasos

1. ✅ Crea un proyecto en Supabase
2. ✅ Ejecuta el SQL de configuración de tablas
3. ✅ Obtén tus credenciales
4. ✅ Actualiza `.env.local`
5. 🎉 ¡Ejecuta `npm run dev` y disfruta!

## 📚 Recursos Útiles

- [Documentación de Supabase](https://supabase.com/docs)
- [Supabase JavaScript Client](https://supabase.com/docs/reference/javascript/introduction)
- [SQL Editor en Supabase](https://supabase.com/docs/guides/database/overview)

¡Tu aplicación está lista para funcionar! 🚀
