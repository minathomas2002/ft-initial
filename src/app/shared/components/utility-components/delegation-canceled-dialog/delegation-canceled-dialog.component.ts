import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { BaseDialogComponent } from '../../base-components/base-dialog/base-dialog.component';
import { DelegationCanceledService } from '../../../services/delegation-canceled/delegation-canceled.service';
import { I18nService } from '../../../services/i18n/i18n.service';

@Component({
  selector: 'app-delegation-canceled-dialog',
  standalone: true,
  imports: [BaseDialogComponent],
  templateUrl: './delegation-canceled-dialog.component.html',
  styleUrl: './delegation-canceled-dialog.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DelegationCanceledDialogComponent {
  protected readonly delegationCanceledService = inject(DelegationCanceledService);
  protected readonly i18nService = inject(I18nService);

  protected get title(): string {
    return this.i18nService.translate('delegation.canceled.title');
  }

  protected get description(): string {
    const delegatorName = this.delegationCanceledService.delegatorDisplayName;
    return this.i18nService.translate('delegation.canceled.description', {
      delegatorName: delegatorName || '—',
    });
  }

  protected onConfirm(): void {
    this.delegationCanceledService.onConfirm();
  }
}
