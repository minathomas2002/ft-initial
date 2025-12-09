import { Component, inject, model } from '@angular/core';
import { SlaForm } from '../../../services/sla-form';
import { BaseDialogComponent } from "src/app/shared/components/base-components/base-dialog/base-dialog.component";
import { TranslatePipe } from "../../../../../shared/pipes/translate.pipe";
import { BaseLabelComponent } from "src/app/shared/components/base-components/base-label/base-label.component";
import { BaseErrorComponent } from "src/app/shared/components/base-components/base-error/base-error.component";
import { ReactiveFormsModule } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';

@Component({
  selector: 'app-admin-sla-dialog',
  imports: [BaseDialogComponent, TranslatePipe, BaseLabelComponent, BaseErrorComponent,ReactiveFormsModule,InputTextModule],
  templateUrl: './admin-sla-dialog.html',
  styleUrl: './admin-sla-dialog.scss',
})
export class AdminSlaDialog {

  dialogVisible = model<boolean>(false);
  formService = inject(SlaForm);


  ngOnInit(){
    this.loadSlaSetting();
  }
  loadSlaSetting(){
    // load data and patch it into form
  }
  resetForm() {
    this.formService.ResetFormFields();
  }

  onConfirm(){
    this.dialogVisible.set(false);
  }
}
