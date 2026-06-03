import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink, Router } from '@angular/router';
import { AuthService, Usuario } from '../../services/auth.service';

const STORAGE_KEY_USUARIOS = 'tasty_usuarios';
const STORAGE_KEY_SESION = 'tasty_sesion';

@Component({
  selector: 'app-acceso',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './acceso.html',
  styleUrl: './acceso.css',
})
export class Acceso {
  currentTab: 'login' | 'register' | 'recover' = 'login';
  loading = false;
  error = '';

  loginData = {
    email: '',
    password: '',
    remember: false
  };

  registerData = {
    name: '',
    apellido: '',
    email: '',
    telefono: '',
    password: '',
    confirmPassword: '',
    acceptTerms: false
  };

  recoverData = {
    email: ''
  };

  constructor(
    private readonly router: Router,
    private readonly authService: AuthService
  ) {}

  limpiarError() {
    this.error = '';
  }

  onLogin() {
    if (!this.loginData.email || !this.loginData.password) {
      this.error = 'Por favor completa todos los campos';
      return;
    }

    this.loading = true;
    this.error = '';

    try {
      // Verificar si es admin primero
      if (this.authService.loginAdmin(this.loginData.email, this.loginData.password)) {
        // Es admin, redirigir al panel de admin
        globalThis.dispatchEvent(new CustomEvent('auth-changed'));
        this.router.navigate(['/admin/menu']);
        return;
      }

      // Si no es admin, buscar usuario normal
      const usuarios = this.obtenerUsuarios();
      const usuario = usuarios.find(
        u => u.email.toLowerCase() === this.loginData.email.toLowerCase()
      );

      if (!usuario || usuario.password !== this.loginData.password) {
        this.error = 'Correo electrónico o contraseña incorrectos';
        this.loading = false;
        return;
      }

      if (!usuario.activo) {
        this.error = 'Tu cuenta ha sido desactivada';
        this.loading = false;
        return;
      }

      // Guardar sesión (compatible con Vue)
      const usuarioSesion: Usuario = {
        ...usuario,
        password: '', // No guardar contraseña en sesión
      };
      sessionStorage.setItem(STORAGE_KEY_SESION, JSON.stringify(usuarioSesion));
      localStorage.setItem('tasty_usuario_actual', JSON.stringify(usuarioSesion));

      // Notificar cambio de autenticación
      globalThis.dispatchEvent(new CustomEvent('auth-changed'));
      this.authService.cargarUsuarioActual();

      // Redirigir
      this.router.navigate(['/home']);
    } catch (error: any) {
      this.error = error.message || 'Error al iniciar sesión';
    } finally {
      this.loading = false;
    }
  }

  onRegister(event?: Event) {
    // Prevenir submit por defecto si viene del formulario
    if (event) {
      event.preventDefault();
    }

    // Limpiar error al iniciar
    this.error = '';

    console.log('Intentando registrar usuario...', this.registerData);

    // Validaciones
    if (!this.registerData.name?.trim()) {
      this.error = 'El nombre es requerido';
      console.error('Error: Nombre vacío');
      return;
    }

    if (!this.registerData.email?.trim()) {
      this.error = 'El correo electrónico es requerido';
      console.error('Error: Email vacío');
      return;
    }

    if (!this.registerData.password?.trim()) {
      this.error = 'La contraseña es requerida';
      console.error('Error: Contraseña vacía');
      return;
    }

    if (this.registerData.password !== this.registerData.confirmPassword) {
      this.error = 'Las contraseñas no coinciden';
      console.error('Error: Contraseñas no coinciden');
      return;
    }

    console.log('Valor de acceptTerms antes de validar:', this.registerData.acceptTerms);
    console.log('Tipo de acceptTerms:', typeof this.registerData.acceptTerms);
    console.log('Datos completos del registro:', JSON.stringify(this.registerData));
    
    // Validar términos y condiciones
    if (!this.registerData.acceptTerms) {
      this.error = 'Debes aceptar los términos y condiciones';
      console.error('Error: Términos no aceptados. Valor:', this.registerData.acceptTerms);
      return;
    }
    
    console.log('✅ Términos aceptados correctamente');

    if (this.registerData.password.length < 6) {
      this.error = 'La contraseña debe tener al menos 6 caracteres';
      console.error('Error: Contraseña muy corta');
      return;
    }

    this.loading = true;
    this.error = '';

    try {
      const usuarios = this.obtenerUsuarios();
      console.log('Usuarios existentes:', usuarios.length);

      const emailExistente = usuarios.find(
        u => u.email.toLowerCase() === this.registerData.email.toLowerCase().trim()
      );

      if (emailExistente) {
        this.error = 'Este correo electrónico ya está registrado';
        this.loading = false;
        console.error('Error: Email ya existe');
        return;
      }

      // Separar nombre y apellido
      const nombreCompleto = this.registerData.name.trim().split(' ');
      const nombre = nombreCompleto[0] || this.registerData.name.trim();
      const apellido = nombreCompleto.slice(1).join(' ') || this.registerData.apellido.trim() || '';

      const nuevoUsuario: Usuario = {
        id: Date.now().toString(36) + Math.random().toString(36).slice(2),
        nombre: nombre.trim(),
        apellido: apellido.trim(),
        email: this.registerData.email.toLowerCase().trim(),
        telefono: (this.registerData.telefono || '').trim(),
        password: this.registerData.password,
        newsletter: false,
        fechaRegistro: new Date().toISOString(),
        activo: true,
      };

      console.log('Nuevo usuario creado:', nuevoUsuario);

      usuarios.push(nuevoUsuario);
      const usuariosJson = JSON.stringify(usuarios);
      localStorage.setItem(STORAGE_KEY_USUARIOS, usuariosJson);
      console.log('Usuarios guardados en localStorage:', usuarios.length);

      // Verificar que se guardó correctamente
      const usuariosVerificados = this.obtenerUsuarios();
      console.log('Usuarios verificados después de guardar:', usuariosVerificados.length);

      // Guardar sesión automáticamente
      const usuarioSesion: Usuario = {
        ...nuevoUsuario,
        password: '', // No guardar contraseña en sesión
      };
      sessionStorage.setItem(STORAGE_KEY_SESION, JSON.stringify(usuarioSesion));
      localStorage.setItem('tasty_usuario_actual', JSON.stringify(usuarioSesion));

      console.log('Sesión guardada');

      // Notificar cambio de autenticación
      globalThis.dispatchEvent(new CustomEvent('auth-changed'));
      this.authService.cargarUsuarioActual();

      console.log('Registro completado exitosamente');
      alert('Registro exitoso. Bienvenido!');
      this.router.navigate(['/home']);
    } catch (error: any) {
      console.error('Error al registrar usuario:', error);
      this.error = error.message || 'Error al registrar usuario. Por favor intenta de nuevo.';
      alert('Error: ' + (error.message || 'Error al registrar usuario'));
    } finally {
      this.loading = false;
    }
  }

  onRecover() {
    this.error = '';
    alert('Se ha enviado un enlace de recuperación a tu correo electrónico.');
    this.currentTab = 'login';
  }

  private obtenerUsuarios(): Usuario[] {
    try {
      const usuariosStr = localStorage.getItem(STORAGE_KEY_USUARIOS);
      if (!usuariosStr) {
        return [];
      }
      return JSON.parse(usuariosStr) as Usuario[];
    } catch (error) {
      console.error('Error al obtener usuarios:', error);
      return [];
    }
  }
}
