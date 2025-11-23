import { FileuploadComponent } from './../../../../shared/components/utility-components/fileupload/fileupload.component';
import { ChangeDetectionStrategy, Component, inject, signal, viewChild } from '@angular/core';
import { Field } from '@angular/forms/signals';
import { BaseLabelComponent } from 'src/app/shared/components/base-components/base-label/base-label.component';
import { SelectModule } from 'primeng/select';
import { OpportunityFormService } from '../../services/opportunity-form/opportunity-form-service';
import { AdminOpportunitiesStore } from 'src/app/shared/stores/admin-opportunities/admin-opportunities.store';
import { TextareaModule } from 'primeng/textarea';
import { InputTextModule } from 'primeng/inputtext';
import { DatePickerModule } from 'primeng/datepicker';
import { MessageModule } from 'primeng/message';
import { FormInputErrorMessages } from 'src/app/shared/components/utility-components/form-input-error-messages/form-input-error-messages';
import { PrimeInvalidDirective } from 'src/app/shared/directives/prime-invalid.directive';

@Component({
  selector: 'app-opportunity-information-form',
  imports: [
    InputTextModule,
    BaseLabelComponent,
    Field, SelectModule,
    TextareaModule,
    DatePickerModule,
    FileuploadComponent,
    MessageModule,
    FormInputErrorMessages,
    PrimeInvalidDirective
  ],
  templateUrl: './opportunity-information-form.html',
  styleUrl: './opportunity-information-form.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OpportunityInformationForm {
  opportunityFormService = inject(OpportunityFormService);
  adminOpportunitiesStore = inject(AdminOpportunitiesStore);
  opportunityTypes = this.adminOpportunitiesStore.opportunityTypes;
  opportunityInformationForm = this.opportunityFormService.opportunityInformationForm

  files = signal<File[]>([]);
  acceptedFileTypes = ".jpg,.png,.pdf,.docx,video/*";
  placeholder = "jpg, png, pdf, docx and video, max file size (10 MB)";

  invalidSelectedFile = signal(false);

  maxFileSize = 10485760 /* 10 MB */;
  fileuploadComponent = viewChild<FileuploadComponent>("fileupload");

  clearChildUpload() {
    this.fileuploadComponent()?.clearFiles(); // Calls method in child, which calls .clear()
  }
}
