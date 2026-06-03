import { Component } from '@angular/core';
import { MicrofrontendContainer } from '../../components/microfrontend-container/microfrontend-container';

@Component({
  selector: 'app-react-inicio',
  standalone: true,
  imports: [MicrofrontendContainer],
  template: `<app-microfrontend-container app="react" route="/" />`,
})
export class ReactInicioComponent {}
