import { Delegation } from './../../pages/delegation/delegation';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
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
import { map, of } from 'rxjs';
import { ERoles } from 'src/app/shared/enums';

@Component({
  selector: 'app-add-edit-delegation-dialog',
  imports: [
    BaseDialogComponent,
    TranslatePipe,
    SelectModule,
    DatePicker,
    ReactiveFormsModule,
    FormsModule,
  ],
  templateUrl: './add-edit-delegation-dialog.html',
  styleUrl: './add-edit-delegation-dialog.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AddEditDelegationDialog implements OnInit {
  today = new Date();
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

  disabledEndDate = toSignal(
    (this.formService.form.get('startDate')?.valueChanges ?? of(new Date())).pipe(
      map((value) => (value ? new Date(value) : new Date())),
    ),
    { initialValue: new Date() as Date, requireSync: false },
  );

  disabledstartDate = toSignal(
    (this.formService.form.get('endDate')?.valueChanges ?? of(new Date())).pipe(
      map((value) => {
        const date = value ? new Date(value) : new Date();
        const today = new Date();
        if (date.toDateString() === today.toDateString()) return null;
        return date;
      }),
    ),
    { initialValue: null as Date | null, requireSync: false },
  );

  disabledStartDatesArray = computed(() => {
    const date = this.disabledstartDate();
    return date ? [date] : [];
  });

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
      this.formService.form.patchValue({
        id: delegation.delgationId,
        delegatorId: delegation.delegatorId,
        delegateeId: delegation.delegateeId,
        from: new Date(delegation.startDate),
        to: new Date(delegation.endDate),
      });
      this.formService.form.updateValueAndValidity();
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
      from: form.controls.from.value ? new Date(form.controls.from.value).toISOString() : '',
      to: form.controls.to.value ? new Date(form.controls.to.value).toISOString() : '',
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
        error: (error: any) => {},
      });
  }

  private submitNewDelegation() {
    const form = this.formService.form;
    const req: IAddDelegationRequest = {
      delegatorId: form.controls.delegatorId.value!,
      delegateeId: form.controls.delegateeId.value!,
      from: form.controls.from.value ? new Date(form.controls.from.value).toISOString() : '',
      to: form.controls.to.value ? new Date(form.controls.to.value).toISOString() : '',
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
        error: (error: any) => {},
      });
  }
}
