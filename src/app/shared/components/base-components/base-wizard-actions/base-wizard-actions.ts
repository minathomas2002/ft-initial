import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { ButtonModule, ButtonSeverity } from 'primeng/button';

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
  actions = input.required<IBaseWizardAction[]>();

  leftActions = computed(() =>
    this.actions().filter(action => action.position === 'left'
    )
  );

  rightActions = computed(() =>
    this.actions().filter(action => action.position === 'right'
    )
  );

  handleActionClick(action: IBaseWizardAction): void {
    if (action.onClick && !action.disabled && !action.loading) {
      action.onClick();
    }
  }
}
