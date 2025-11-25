import { FileuploadComponent } from './../../../../shared/components/utility-components/fileupload/fileupload.component';
import { ChangeDetectionStrategy, Component, inject, OnInit, signal, viewChild } from '@angular/core';
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
import { FormsModule } from '@angular/forms';
import { SafeObjectUrl } from 'src/app/shared/interfaces';

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
    PrimeInvalidDirective,
    FormsModule
  ],
  templateUrl: './opportunity-information-form.html',
  styleUrl: './opportunity-information-form.scss',
})
export class OpportunityInformationForm implements OnInit {
  opportunityFormService = inject(OpportunityFormService);
  adminOpportunitiesStore = inject(AdminOpportunitiesStore);
  opportunityTypes = this.adminOpportunitiesStore.opportunityTypes;
  opportunityCategories = this.adminOpportunitiesStore.opportunityCategories;
  opportunityInformationForm = this.opportunityFormService.opportunityInformationForm

  files = signal<File[]>([]);
  acceptedFileTypes = ".jpg,.png,.pdf,.docx,video/*";
  placeholder = "jpg, png, pdf, docx and video, max file size (10 MB)";

  invalidSelectedFile = signal(false);
  fileuploadComponent = viewChild<FileuploadComponent>("fileupload");

  ngOnInit() {
    // Initialize files signal from form service when component is created
    // This ensures files are displayed when revisiting the step
    this.syncFilesFromFormService();
  }

  private syncFilesFromFormService() {
    const imageValue = this.opportunityInformationForm.image().value();

    if (imageValue instanceof File) {
      const currentFiles = this.files();
      // Only update if files are different or empty
      if (currentFiles.length === 0 || currentFiles[0] !== imageValue) {
        this.files.set([imageValue]);
      }
    } else if (imageValue === null && this.files().length > 0) {
      this.clearChildUpload();
      this.files.set([]);
    }
  }

  clearChildUpload() {
    this.fileuploadComponent()?.clearFiles(); // Calls method in child, which calls .clear()
  }

  onFilesChanged(files: File[]) {
    console.log(files);

    // Update the form field value with the files
    // This will automatically trigger validation and update the fieldTree
    const imageValue = files.length > 0 ? files[0] : null;
    this.opportunityFormService.updateImageField(imageValue as SafeObjectUrl | null);
    // Mark the field as touched so validation errors appear when user interacts with it
    this.opportunityInformationForm.image().markAsTouched();
  }

  onDateRangeChange(event: any) {
    this.opportunityFormService.handleDateRangeChange(event);
  }
}
