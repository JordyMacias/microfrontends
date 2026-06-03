import { Injectable, signal } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Usuario {
  id: string | number;
  nombre: string;
  apellido: string;
  email: string;
  telefono: string;
  password?: string;
  fechaNacimiento?: string;
  newsletter: boolean;
  fechaRegistro: string;
  activo: boolean;
}

const STORAGE_KEY_SESION = 'tasty_sesion';
const STORAGE_KEY_USUARIOS = 'tasty_usuarios';
const STORAGE_KEY_ADMIN = 'tasty_admin_sesion';

const ADMIN_EMAIL = environment.adminEmail;
const ADMIN_PASSWORD = environment.adminPassword;

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly usuarioActual = signal<Usuario | null>(null);
  private readonly usuarioSubject = new BehaviorSubject<Usuario | null>(null);
  public usuario$ = this.usuarioSubject.asObservable();

  constructor() {
    this.cargarUsuarioActual();
    globalThis.addEventListener('storage', () => {
      this.cargarUsuarioActual();
    });
    globalThis.addEventListener('auth-changed', () => {
      this.cargarUsuarioActual();
    });
  }

  cargarUsuarioActual(): void {
    try {
      const sesionStr = sessionStorage.getItem(STORAGE_KEY_SESION);
      if (sesionStr) {
        const usuario = JSON.parse(sesionStr) as Usuario;
        this.usuarioActual.set(usuario);
        this.usuarioSubject.next(usuario);
        return;
      }
      const usuarioStr = localStorage.getItem('tasty_usuario_actual');
      if (usuarioStr) {
        const usuario = JSON.parse(usuarioStr) as Usuario;
        this.usuarioActual.set(usuario);
        this.usuarioSubject.next(usuario);
        return;
      }
      this.usuarioActual.set(null);
      this.usuarioSubject.next(null);
    } catch (error) {
      console.error('Error al cargar usuario:', error);
      this.usuarioActual.set(null);
      this.usuarioSubject.next(null);
    }
  }

  obtenerUsuarioActual(): Usuario | null {
    return this.usuarioActual();
  }

  estaLogueado(): boolean {
    return this.usuarioActual() !== null;
  }

  cerrarSesion(): void {
    try {
      sessionStorage.removeItem(STORAGE_KEY_SESION);
      localStorage.removeItem('tasty_usuario_actual');
      this.usuarioActual.set(null);
      this.usuarioSubject.next(null);
      globalThis.dispatchEvent(new CustomEvent('auth-changed'));
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  }

  obtenerNombreUsuario(): string {
    const usuario = this.usuarioActual();
    if (usuario) {
      return `${usuario.nombre} ${usuario.apellido}`;
    }
    return '';
  }

  loginAdmin(email: string, password: string): boolean {
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
  }

  esAdmin(): boolean {
    try {
      const adminStr = sessionStorage.getItem(STORAGE_KEY_ADMIN);
      if (!adminStr) {
        return false;
      }
      const admin = JSON.parse(adminStr) as { isAdmin?: boolean; email?: string };
      return admin.isAdmin === true && admin.email === ADMIN_EMAIL;
    } catch (error) {
      console.error('Error al verificar sesión de admin:', error);
      return false;
    }
  }

  cerrarSesionAdmin(): void {
    sessionStorage.removeItem(STORAGE_KEY_ADMIN);
  }
}
