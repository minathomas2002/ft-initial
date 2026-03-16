import { ChangeDetectionStrategy, Component, signal, inject, OnInit, effect } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ToastModule } from 'primeng/toast';
import { I18nService } from './shared/services/i18n/i18n.service';
import { NgClass } from '@angular/common';
import { DelegationCanceledDialogComponent } from './shared/components/utility-components/delegation-canceled-dialog/delegation-canceled-dialog.component';
import { PrimengLocaleSyncService } from './core/services/primeng-locale-sync.service';
import { PrimeNG } from 'primeng/config';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, ToastModule, NgClass, DelegationCanceledDialogComponent],
  templateUrl: './app.html',
  styleUrl: './app.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class App implements OnInit {
  private readonly i18nService = inject(I18nService);
  protected readonly title = signal('benaa');
  private primeNGConfig = inject(PrimeNG);
  constructor() {
    inject(PrimengLocaleSyncService); // Activate PrimeNG locale sync with app language
    effect(() => {
      this.primeNGConfig.setTranslation({
        dateFormat: this.i18nService.currentLanguage() === 'ar' ? 'dd MM yy' : 'dd M yy',
      })
    })
  }

  ngOnInit(): void {
    this.i18nService.initialize();
  }
}
