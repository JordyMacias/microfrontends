import { Component } from '@angular/core';
import { MicrofrontendContainer } from '../../components/microfrontend-container/microfrontend-container';

@Component({
  selector: 'app-react-admin',
  standalone: true,
  imports: [MicrofrontendContainer],
  template: `<app-microfrontend-container app="react" route="/admin/panel" />`,
})
export class ReactAdminComponent {}
