import { Routes } from '@angular/router';
import { Home } from './pages/home/home';
import { Acceso } from './components/acceso/acceso';
import { Menu } from './components/menu/menu';

export const routes: Routes = [
  { path: '', redirectTo: '/home', pathMatch: 'full' },
  { path: 'home', component: Home },
  { path: 'acceso', component: Acceso },
  { path: 'menu', component: Menu }
];
