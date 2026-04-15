import { ChangeDetectionStrategy, Component, computed, effect, inject, input, model, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SelectModule } from 'primeng/select';
import { BaseDialogComponent } from 'src/app/shared/components/base-components/base-dialog/base-dialog.component';
import { SRMApprovalStatus } from 'src/app/shared/enums';
import { TranslatePipe } from 'src/app/shared/pipes';
import { I18nService } from 'src/app/shared/services/i18n';

@Component({
  selector: 'app-srm-approval-dialog',
  standalone: true,
  imports: [BaseDialogComponent, SelectModule, FormsModule, TranslatePipe],
  templateUrl: './srm-approval-dialog.html',
  styleUrl: './srm-approval-dialog.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SrmApprovalDialog {
  visible = model<boolean>(false);
  isLoading = input<boolean>(false);
  currentStatus = input<SRMApprovalStatus | null>(null);

  onSubmit = output<SRMApprovalStatus>();
  onCancel = output<void>();

  private readonly i18nService = inject(I18nService);

  selectedSrmApprovalStatus = signal<SRMApprovalStatus | null>(null);

  readonly hasStatusChanged = computed(() => {
    const selectedStatus = this.selectedSrmApprovalStatus();
    const currentStatus = this.currentStatus();

    if (selectedStatus === null) return false;
    return selectedStatus !== currentStatus;
  });

  readonly srmApprovalStatusOptions = computed(() => {
    this.i18nService.currentLanguage();
    return [
      {
        label: this.i18nService.translate('plans.srmApproval.statuses.registrationApproval'),
        value: SRMApprovalStatus.RegistrationApproval,
      },
      {
        label: this.i18nService.translate('plans.srmApproval.statuses.qualificationApproval'),
        value: SRMApprovalStatus.QualificationApproval,
      },
      {
        label: this.i18nService.translate('plans.srmApproval.statuses.finalApproval'),
        value: SRMApprovalStatus.FinalApproval,
      },
    ];
  });

  constructor() {
    effect(() => {
      const isVisible = this.visible();
      const currentStatus = this.currentStatus();

      if (!isVisible) return;
      this.selectedSrmApprovalStatus.set(currentStatus);
    });
  }

  onConfirm() {
    const selectedStatus = this.selectedSrmApprovalStatus();
    if (!selectedStatus) return;

    this.onSubmit.emit(selectedStatus);
    this.selectedSrmApprovalStatus.set(null);
  }

  handleCancel() {
    this.selectedSrmApprovalStatus.set(null);
    this.onCancel.emit();
  }

  handleClose() {
    this.selectedSrmApprovalStatus.set(null);
  }
}
