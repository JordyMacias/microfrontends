import { Component } from '@angular/core';
import { MicrofrontendContainer } from '../../components/microfrontend-container/microfrontend-container';

@Component({
  selector: 'app-vue-gestion-pedido',
  standalone: true,
  imports: [MicrofrontendContainer],
  template: `<app-microfrontend-container app="vue" route="/#/gestion-pedido" />`,
})
export class VueGestionPedidoComponent {}
