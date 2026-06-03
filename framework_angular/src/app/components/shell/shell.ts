import { Component, signal, OnInit, OnDestroy } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, RouterOutlet],
  templateUrl: './shell.html',
  styleUrl: './shell.css',
})
export class Shell implements OnInit, OnDestroy {
  protected readonly title = signal('Tasty Uleam');
  protected readonly isNavOpen = signal(false);
  protected readonly estaLogueado = signal(false);
  protected readonly nombreUsuario = signal('');
  protected readonly esAdmin = signal(false);

  private authSubscription?: Subscription;
  private readonly onAuthChanged = () => this.actualizarEstadoAuth();

  constructor(private readonly authService: AuthService) {}

  ngOnInit() {
    this.actualizarEstadoAuth();
    this.authSubscription = this.authService.usuario$.subscribe(() => {
      this.actualizarEstadoAuth();
    });
    globalThis.addEventListener('auth-changed', this.onAuthChanged);
  }

  ngOnDestroy() {
    this.authSubscription?.unsubscribe();
    globalThis.removeEventListener('auth-changed', this.onAuthChanged);
  }

  private actualizarEstadoAuth() {
    this.estaLogueado.set(this.authService.estaLogueado());
    this.nombreUsuario.set(this.authService.obtenerNombreUsuario());
    this.esAdmin.set(this.authService.esAdmin());
  }

  protected toggleNav() {
    this.isNavOpen.update((v) => !v);
  }

  protected cerrarSesion() {
    if (confirm('¿Estás seguro que deseas cerrar sesión?')) {
      if (this.authService.esAdmin()) {
        this.authService.cerrarSesionAdmin();
      }
      this.authService.cerrarSesion();
      globalThis.location.href = '/home';
    }
  }
}
