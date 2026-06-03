import { Routes } from '@angular/router';
import { Shell } from './components/shell/shell';
import { Home } from './pages/home/home';
import { Acceso } from './components/acceso/acceso';
import { Menu } from './components/menu/menu';
import { ReactInicioComponent } from './pages/microfrontends/react-inicio.component';
import { ReactSedeComponent } from './pages/microfrontends/react-sede.component';
import { ReactAdminComponent } from './pages/microfrontends/react-admin.component';
import { ReactAdminSedesComponent } from './pages/microfrontends/react-admin-sedes.component';
import { VuePedidoComponent } from './pages/microfrontends/vue-pedido.component';
import { VueGestionPedidoComponent } from './pages/microfrontends/vue-gestion-pedido.component';

export const routes: Routes = [
  {
    path: '',
    component: Shell,
    children: [
      { path: '', redirectTo: 'home', pathMatch: 'full' },
      { path: 'home', component: Home },
      { path: 'acceso', component: Acceso },
      { path: 'menu', component: Menu },
      { path: 'sedes', component: ReactInicioComponent },
      { path: 'sedes/:sedeId', component: ReactSedeComponent },
      { path: 'admin/menu', component: ReactAdminComponent },
      { path: 'admin/pedidos', component: VueGestionPedidoComponent },
      { path: 'admin/sedes', component: ReactAdminSedesComponent },
      { path: 'pedido', component: VuePedidoComponent },
    ],
  },
  { path: '**', redirectTo: '/home' },
];
