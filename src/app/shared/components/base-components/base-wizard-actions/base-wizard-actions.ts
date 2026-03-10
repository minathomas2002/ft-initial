import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { ButtonModule, ButtonSeverity } from 'primeng/button';
import { I18nService } from 'src/app/shared/services/i18n/i18n.service';

export interface IBaseWizardAction {
  id: string;
  label: string;
  icon?: string;
  severity?: ButtonSeverity;
  text?: boolean;
  position: 'left' | 'right';
  disabled?: boolean;
  loading?: boolean;
  styleClass?: string;
  onClick?: () => void;
}

@Component({
  selector: 'app-base-wizard-actions',
  imports: [CommonModule, ButtonModule],
  templateUrl: './base-wizard-actions.html',
  styleUrl: './base-wizard-actions.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BaseWizardActions {
  private readonly i18nService = inject(I18nService);

  actions = input.required<IBaseWizardAction[]>();

  private readonly isRtl = computed(() => this.i18nService.currentLanguage() === 'ar');

  leftActions = computed(() =>
    this.actions().filter(action => action.position === 'left'
    )
  );

  rightActions = computed(() =>
    this.actions().filter(action => action.position === 'right'
    )
  );

  /** Next: right in LTR, left in RTL. Previous: left in LTR, right in RTL. Others (timeline, etc.): left in LTR, right in RTL. */
  getIconPos(action: IBaseWizardAction): 'left' | 'right' {
    if (!action.icon) return 'left';
    const rtl = this.isRtl();
    if (action.id === 'next') return rtl ? 'left' : 'right';
    if (action.id === 'previous') return rtl ? 'right' : 'left';
    return rtl ? 'right' : 'left';
  }

  handleActionClick(action: IBaseWizardAction): void {
    if (action.onClick && !action.disabled && !action.loading) {
      action.onClick();
    }
  }
}
