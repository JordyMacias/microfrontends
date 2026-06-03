import type { Usuario } from '../types';
import { ADMIN_EMAIL, ADMIN_PASSWORD } from '../config/auth';

const STORAGE_KEY_USUARIOS = 'tasty_usuarios';
const STORAGE_KEY_SESION = 'tasty_sesion';
const STORAGE_KEY_ADMIN = 'tasty_admin_sesion';

// Obtener usuarios desde localStorage
const obtenerUsuariosDesdeStorage = (): Usuario[] => {
  try {
    const usuariosStr = localStorage.getItem(STORAGE_KEY_USUARIOS);
    if (!usuariosStr) {
      return [];
    }
    return JSON.parse(usuariosStr) as Usuario[];
  } catch (error) {
    console.error('Error al obtener usuarios desde localStorage:', error);
    return [];
  }
};

// Guardar usuarios en localStorage
const guardarUsuariosEnStorage = (usuarios: Usuario[]): void => {
  try {
    localStorage.setItem(STORAGE_KEY_USUARIOS, JSON.stringify(usuarios));
  } catch (error) {
    console.error('Error al guardar usuarios en localStorage:', error);
  }
};

// Guardar sesión de usuario
export const guardarSesion = async (usuario: Usuario): Promise<void> => {
  try {
    sessionStorage.setItem(STORAGE_KEY_SESION, JSON.stringify(usuario));
    // También guardar en localStorage para persistencia opcional
    localStorage.setItem('tasty_usuario_actual', JSON.stringify(usuario));
  } catch (error) {
    console.error('Error al guardar sesión:', error);
  }
};

// Obtener sesión actual
export const obtenerSesionActual = (): Usuario | null => {
  try {
    const sesionStr = sessionStorage.getItem(STORAGE_KEY_SESION);
    if (sesionStr) {
      return JSON.parse(sesionStr) as Usuario;
    }
    // Intentar desde localStorage como fallback
    const usuarioStr = localStorage.getItem('tasty_usuario_actual');
    if (usuarioStr) {
      return JSON.parse(usuarioStr) as Usuario;
    }
    return null;
  } catch (error) {
    console.error('Error al obtener sesión:', error);
    return null;
  }
};

// Cerrar sesión
export const cerrarSesion = async (): Promise<void> => {
  try {
    sessionStorage.removeItem(STORAGE_KEY_SESION);
    localStorage.removeItem('tasty_usuario_actual');
  } catch (error) {
    console.error('Error al cerrar sesión:', error);
  }
};

// Obtener todos los usuarios
export const obtenerUsuarios = async (): Promise<Usuario[]> => {
  return obtenerUsuariosDesdeStorage();
};

// Buscar usuario por email
const buscarUsuarioPorEmail = (email: string): Usuario | null => {
  const usuarios = obtenerUsuariosDesdeStorage();
  return usuarios.find(u => u.email.toLowerCase() === email.toLowerCase()) || null;
};

// Generar ID único (criptográficamente seguro, regla Sonar S2245)
const generarIdUnico = (): string => crypto.randomUUID();

// Interface para datos de registro
interface RegistroDatos {
  nombre: string;
  apellido: string;
  email: string;
  telefono: string;
  password: string;
  confirmPassword: string;
  fechaNacimiento?: string;
  terminos: boolean;
  newsletter: boolean;
}

// Registrar nuevo usuario
export const registrarUsuario = async (datos: RegistroDatos): Promise<{ success: boolean; error?: string }> => {
  if (!datos.terminos) {
    return { success: false, error: 'Debes aceptar los términos y condiciones para continuar.' };
  }

  if (datos.password !== datos.confirmPassword) {
    return { success: false, error: 'Las contraseñas no coinciden.' };
  }

  if (datos.password.length < 6) {
    return { success: false, error: 'La contraseña debe tener al menos 6 caracteres.' };
  }

  try {
    // Verificar si el email ya está registrado
    const usuarioExistente = buscarUsuarioPorEmail(datos.email);
    if (usuarioExistente) {
      return { success: false, error: 'Este correo electrónico ya está registrado. Por favor inicia sesión.' };
    }

    // Crear nuevo usuario
    const nuevoUsuario: Usuario = {
      id: generarIdUnico(),
      nombre: datos.nombre,
      apellido: datos.apellido,
      email: datos.email.toLowerCase(),
      telefono: datos.telefono,
      password: datos.password, // En producción, esto debería estar hasheado
      fechaNacimiento: datos.fechaNacimiento || undefined,
      newsletter: datos.newsletter,
      fechaRegistro: new Date().toISOString(),
      activo: true,
    };

    // Guardar usuario
    const usuarios = obtenerUsuariosDesdeStorage();
    usuarios.push(nuevoUsuario);
    guardarUsuariosEnStorage(usuarios);

    // Guardar sesión automáticamente
    await guardarSesion(nuevoUsuario);

    console.log('Usuario registrado exitosamente:', nuevoUsuario.email);
    return { success: true };
  } catch (error: any) {
    console.error('Error al registrar usuario:', error);
    return { success: false, error: error.message || 'Error al registrar el usuario.' };
  }
};

// Iniciar sesión
export const iniciarSesion = async (email: string, password: string): Promise<{ success: boolean; error?: string; usuario?: Usuario }> => {
  try {
    const usuario = buscarUsuarioPorEmail(email);

    if (!usuario) {
      return { success: false, error: 'Correo electrónico o contraseña incorrectos.' };
    }

    // Verificar contraseña
    if (usuario.password !== password) {
      return { success: false, error: 'Correo electrónico o contraseña incorrectos.' };
    }

    // Verificar si la cuenta está activa
    if (!usuario.activo) {
      return { success: false, error: 'Tu cuenta ha sido desactivada. Contacta al administrador.' };
    }

    // Crear objeto de usuario sin contraseña para la sesión
    const usuarioSesion: Usuario = {
      ...usuario,
      password: '', // No guardar contraseña en la sesión
    };

    // Guardar sesión
    await guardarSesion(usuarioSesion);

    console.log('Login exitoso:', usuarioSesion.email);
    return { success: true, usuario: usuarioSesion };
  } catch (error: any) {
    console.error('Error al iniciar sesión:', error);
    return { success: false, error: error.message || 'Error al iniciar sesión.' };
  }
};

// Login de administrador
export const loginAdmin = (email: string, password: string): boolean => {
  if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
    try {
      const adminData = {
        email: ADMIN_EMAIL,
        isAdmin: true,
        fechaLogin: new Date().toISOString()
      };
      sessionStorage.setItem(STORAGE_KEY_ADMIN, JSON.stringify(adminData));
      return true;
    } catch (error) {
      console.error('Error al guardar sesión de admin:', error);
      return false;
    }
  }
  return false;
};

// Verificar si hay un administrador logueado
export const verificarAdminLogueado = (): boolean => {
  try {
    const adminStr = sessionStorage.getItem(STORAGE_KEY_ADMIN);
    if (adminStr) {
      const admin = JSON.parse(adminStr);
      return admin.isAdmin === true && admin.email === ADMIN_EMAIL;
    }
    return false;
  } catch (error) {
    return false;
  }
};

// Cerrar sesión de administrador
export const cerrarSesionAdmin = (): void => {
  sessionStorage.removeItem(STORAGE_KEY_ADMIN);
};

// Obtener usuario actual
export const obtenerUsuarioActual = (): Usuario | null => {
  return obtenerSesionActual();
};

// Inicializar con usuario de ejemplo (opcional)
export const inicializarUsuariosEjemplo = (): void => {
  const usuarios = obtenerUsuariosDesdeStorage();
  if (usuarios.length > 0) {
    return; // Ya hay usuarios
  }

  // Crear usuario de ejemplo
  const usuarioEjemplo: Usuario = {
    id: 'user_ejemplo_1',
    nombre: 'Juan',
    apellido: 'Pérez',
    email: 'usuario@ejemplo.com',
    telefono: '0999999999',
    password: '123456', // En producción debería estar hasheado
    newsletter: false,
    fechaRegistro: new Date().toISOString(),
    activo: true,
  };

  guardarUsuariosEnStorage([usuarioEjemplo]);
  console.log('Usuario de ejemplo inicializado');
};
