import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { I18nService } from '../../../../../shared/services/i18n/i18n.service';

@Component({
  selector: 'app-layout-footer',
  imports: [],
  templateUrl: './layout-footer.component.html',
  styleUrl: './layout-footer.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LayoutFooterComponent {
  private readonly i18nService = inject(I18nService);
  protected readonly footerMessage = computed(() =>
    this.i18nService.translate('footer.message', { year: String(new Date().getFullYear()) })
  );
  protected readonly footerTerms = computed(() => this.i18nService.translate('footer.terms'));
  protected readonly footerPrivacy = computed(() => this.i18nService.translate('footer.privacy'));
  protected readonly footerCookie = computed(() => this.i18nService.translate('footer.cookie'));
}
