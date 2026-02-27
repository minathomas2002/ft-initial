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
} from 'src/app/shared/interfaces/delegation.interface';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { SelectModule } from 'primeng/select';
import { DatePicker } from 'primeng/datepicker';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { map, of } from 'rxjs';

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

  dialogVisible = model<boolean>(false);
  isEditMode = input<boolean>(false);
  formService = inject(AddDelegationFormService);
  delegationStore = inject(DelegationStore);
  isProcessing = this.delegationStore.isProcessing;
  isLoadingDetails = this.delegationStore.isLoadingDetails;
  toasterService = inject(ToasterService);

  activeEmployee = signal(null);
  i18nService = inject(I18nService);

  employees = this.delegationStore.activeEmployees;

  disabledEndDate = toSignal(
    (this.formService.form.get('startDate')?.valueChanges ?? of(new Date())).pipe(
      map((value) => (value ? new Date(value) : new Date()))
    ),
    { initialValue: new Date() as Date, requireSync: false }
  );

  disabledstartDate = toSignal(
    (this.formService.form.get('endDate')?.valueChanges ?? of(new Date())).pipe(
      map((value) => {
        const date = value ? new Date(value) : new Date();
        const today = new Date();
        if (date.toDateString() === today.toDateString())
          return null;
        return date;
      })
    ),
    { initialValue: null as Date | null, requireSync: false }
  );

  disabledStartDatesArray = computed(() => {
    const date = this.disabledstartDate();
    return date ? [date] : [];
  });

  ngOnInit() {
    this.loadEmployees();
  }
  private loadEmployees() {
    this.delegationStore.getActiveEmployees().pipe(takeUntilDestroyed(this.destroyRef)).subscribe();
  }
  onConfirm() {
    this.submitNewDelegation();
  }
  resetForm() {
    this.formService.ResetFormFields();
  }

  getControl(controlName: string): FormControl {
    return this.formService.form.get(controlName) as FormControl;
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
          this.toasterService.success(this.i18nService.translate('delegation.add.successMessage'));
          this.onSuccess.emit();
          this.dialogVisible.set(false);
        },
        error: (error: any) => {
        },
      });
  }
}
