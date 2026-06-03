import { Component } from '@angular/core';
import { MicrofrontendContainer } from '../../components/microfrontend-container/microfrontend-container';

@Component({
  selector: 'app-react-admin-sedes',
  standalone: true,
  imports: [MicrofrontendContainer],
  template: `<app-microfrontend-container app="react" route="/admin/panel#sedes" />`,
})
export class ReactAdminSedesComponent {}
