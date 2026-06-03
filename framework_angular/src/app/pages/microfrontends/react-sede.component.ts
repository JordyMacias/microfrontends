import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MicrofrontendContainer } from '../../components/microfrontend-container/microfrontend-container';

@Component({
  selector: 'app-react-sede',
  standalone: true,
  imports: [MicrofrontendContainer],
  template: `<app-microfrontend-container [app]="'react'" [route]="sedeRoute" />`,
})
export class ReactSedeComponent implements OnInit {
  sedeRoute = '';

  constructor(private readonly route: ActivatedRoute) {}

  ngOnInit() {
    this.route.params.subscribe((params) => {
      const sedeId = params['sedeId'];
      this.sedeRoute = sedeId ? `/sede/${sedeId}` : '/';
    });
  }
}
