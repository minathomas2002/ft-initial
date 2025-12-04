import { Component, signal, inject, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ToastModule } from 'primeng/toast';
import { I18nService } from './shared/services/i18n/i18n.service';
import { TrimOnBlurDirective } from './shared/directives/trim-on-blur.directive';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, ToastModule, TrimOnBlurDirective],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App implements OnInit {
  private readonly i18nService = inject(I18nService);
  protected readonly title = signal('benaa');

  ngOnInit(): void {
    this.i18nService.initialize();
  }
}
