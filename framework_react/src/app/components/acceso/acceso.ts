import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink, Router } from '@angular/router';

@Component({
  selector: 'app-acceso',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './acceso.html',
  styleUrl: './acceso.css',
})
export class Acceso {
  currentTab: 'login' | 'register' | 'recover' = 'login';

  loginData = {
    email: '',
    password: '',
    remember: false
  };

  registerData = {
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    acceptTerms: false
  };

  recoverData = {
    email: ''
  };

  constructor(private readonly router: Router) {}

  onLogin() {
    console.log('Login:', this.loginData);
    // Aquí iría la lógica de autenticación
    // Por ahora redirigir al menú
    this.router.navigate(['/menu']);
  }

  onRegister() {
    if (this.registerData.password !== this.registerData.confirmPassword) {
      alert('Las contraseñas no coinciden');
      return;
    }
    console.log('Register:', this.registerData);
    // Aquí iría la lógica de registro
    // Por ahora cambiar a login
    this.currentTab = 'login';
    alert('Registro exitoso. Por favor inicia sesión.');
  }

  onRecover() {
    console.log('Recover:', this.recoverData);
    // Aquí iría la lógica de recuperación
    alert('Se ha enviado un enlace de recuperación a tu correo electrónico.');
    this.currentTab = 'login';
  }
}
