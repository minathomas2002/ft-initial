import { ChangeDetectionStrategy, Component, DestroyRef, inject, input, model, output, signal } from '@angular/core';
import { BaseDialogComponent } from "src/app/shared/components/base-components/base-dialog/base-dialog.component";
import { TranslatePipe } from "../../../../shared/pipes/translate.pipe";
import { AddDelegationFormService } from '../../services/add-delegation-from/add-delegation-from-service';

@Component({
  selector: 'app-add-edit-delegation-dialog',
  imports: [BaseDialogComponent, TranslatePipe],
  templateUrl: './add-edit-delegation-dialog.html',
  styleUrl: './add-edit-delegation-dialog.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AddEditDelegationDialog {
  onSuccess = output<void>();
  destroyRef = inject(DestroyRef);
  jobIdErrorMessage = signal<string | null>(null);

  dialogVisible = model<boolean>(false);
  isEditMode = input<boolean>(false);

  formService = inject(AddDelegationFormService);

  onConfirm() {
    // check if create or edit
    if (this.isEditMode()){
      this.onSuccess.emit()
      this.dialogVisible.set(false);
    }
    else{
      this.onSuccess.emit()
      this.dialogVisible.set(false);
    }
  }

  resetForm() {}
  isProcessing(){}
}
