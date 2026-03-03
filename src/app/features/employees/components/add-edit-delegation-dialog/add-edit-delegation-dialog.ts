import { Delegation } from './../../pages/delegation/delegation';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  effect,
  inject,
  input,
  model,
  OnInit,
  output,
  signal,
} from '@angular/core';
import { BaseDialogComponent } from 'src/app/shared/components/base-components/base-dialog/base-dialog.component';
import { TranslatePipe } from '../../../../shared/pipes/translate.pipe';
import { AddDelegationFormService } from '../../services/add-delegation-from/add-delegation-from-service';
import { DelegationStore } from 'src/app/shared/stores/system-employees/delegation.store';
import { I18nService } from 'src/app/shared/services/i18n';
import { ToasterService } from 'src/app/shared/services/toaster/toaster.service';
import {
  ActiveEmployee,
  IAddDelegationRequest,
  IDelegationRecord,
  IEditDelegationRequest,
} from 'src/app/shared/interfaces/delegation.interface';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { SelectModule } from 'primeng/select';
import { DatePicker } from 'primeng/datepicker';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { EDelegationStatus, ERoles } from 'src/app/shared/enums';
import { TooltipModule } from 'primeng/tooltip';
import { BaseErrorMessages } from 'src/app/shared/components/base-components/base-error-messages/base-error-messages';

@Component({
  selector: 'app-add-edit-delegation-dialog',
  imports: [
    BaseDialogComponent,
    TranslatePipe,
    SelectModule,
    DatePicker,
    ReactiveFormsModule,
    FormsModule,
    TooltipModule,
    BaseErrorMessages,
  ],
  templateUrl: './add-edit-delegation-dialog.html',
  styleUrl: './add-edit-delegation-dialog.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AddEditDelegationDialog implements OnInit {
  /** Start of today (midnight) - ensures dates at 00:00:00 pass minDate validation */
  today = new Date(new Date().setHours(0, 0, 0, 0));
  onSuccess = output<void>();
  destroyRef = inject(DestroyRef);
  jobIdErrorMessage = signal<string | null>(null);
  SelectedItem = model<IDelegationRecord | null>();

  dialogVisible = model<boolean>(false);
  isEditMode = input<boolean>(false);
  formService = inject(AddDelegationFormService);
  delegationStore = inject(DelegationStore);
  isProcessing = this.delegationStore.isProcessing;
  isLoadingDetails = this.delegationStore.isLoadingDetails;
  toasterService = inject(ToasterService);

  i18nService = inject(I18nService);

  employees = this.delegationStore.activeEmployees;

  constructor() {
    effect(() => {
      if (!this.dialogVisible()) {
        this.resetForm();
      }
    });
  }

  ngOnInit() {
    this.loadEmployees();
  }

  private loadEmployees() {
    this.delegationStore
      .getActiveEmployees()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((res) => {
        if (this.isEditMode()) {
          this.LoadDelegationDetails();
        }
      });
  }
  onConfirm() {
    if (this.isEditMode()) {
      this.submitEditedDelegation();
    } else {
      this.submitNewDelegation();
    }
  }
  resetForm() {
    this.formService.ResetFormFields();
  }

  getControl(controlName: string): FormControl {
    return this.formService.form.get(controlName) as FormControl;
  }

  LoadDelegationDetails() {
    const delegation = this.SelectedItem();
    if (delegation) {
      this.formService.setFormInEditMode(delegation);
    }
  }

  delegatorIdSignal = toSignal(this.formService.delegatorId.valueChanges, {
    initialValue: this.formService.delegatorId.value,
  });

  delegateeIdSignal = toSignal(this.formService.delegateeId.valueChanges, {
    initialValue: this.formService.delegateeId.value,
  });

  getDelegatorsWithoutAdmin = computed(() => {
    const employees = this.employees() ?? [];
    const selectedDelegateeId = this.delegateeIdSignal();

    return employees.filter((emp) => emp.role !== ERoles.ADMIN && emp.id !== selectedDelegateeId);
  });

  getDelegatees = computed(() => {
    const employees = this.employees() ?? [];
    const selectedDelegatorId = this.delegatorIdSignal();

    return employees.filter((emp) => emp.id !== selectedDelegatorId);
  });

  private submitEditedDelegation() {
    const form = this.formService.form;
    const req: IEditDelegationRequest = {
      delegationId: form.controls.id.value!,
      from: form.controls.from.value ? new Date(form.controls.from.value).toLocaleDateString('en-us') : '',
      to: form.controls.to.value ? new Date(form.controls.to.value).toLocaleDateString('en-us') : '',
    };

    this.delegationStore
      .editDelegation(req)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.toasterService.success(
            this.i18nService.translate('delegation.messages.updatedSuccess'),
          );
          this.onSuccess.emit();
          this.dialogVisible.set(false);
          this.formService.ResetFormFields();
        },
        error: (error: any) => { },
      });
  }

  private submitNewDelegation() {
    const form = this.formService.form;
    const req: IAddDelegationRequest = {
      delegatorId: form.controls.delegatorId.value!,
      delegateeId: form.controls.delegateeId.value!,
      from: form.controls.from.value ? new Date(form.controls.from.value).toLocaleDateString('en-us') : '',
      to: form.controls.to.value ? new Date(form.controls.to.value).toLocaleDateString('en-us') : '',
    };
    this.delegationStore
      .addDelegation(req)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.toasterService.success(
            this.i18nService.translate('delegation.messages.addedSuccess'),
          );
          this.onSuccess.emit();
          this.dialogVisible.set(false);
          this.formService.ResetFormFields();
        },
        error: (error: any) => { },
      });
  }
}
