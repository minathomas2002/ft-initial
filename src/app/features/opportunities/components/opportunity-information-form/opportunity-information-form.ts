import { FileuploadComponent } from './../../../../shared/components/utility-components/fileupload/fileupload.component';
import { ChangeDetectionStrategy, Component, inject, OnInit, signal, viewChild, computed, effect } from '@angular/core';
import { ReactiveFormsModule, FormControl } from '@angular/forms';
import { BaseLabelComponent } from 'src/app/shared/components/base-components/base-label/base-label.component';
import { SelectModule } from 'primeng/select';
import { OpportunityFormService } from '../../services/opportunity-form/opportunity-form-service';
import { AdminOpportunitiesStore } from 'src/app/shared/stores/admin-opportunities/admin-opportunities.store';
import { OpportunitiesStore } from 'src/app/shared/stores/opportunities/opportunities.store';
import { TextareaModule } from 'primeng/textarea';
import { InputTextModule } from 'primeng/inputtext';
import { DatePickerModule } from 'primeng/datepicker';
import { MessageModule } from 'primeng/message';
import { FormsModule } from '@angular/forms';
import { TranslatePipe } from 'src/app/shared/pipes/translate.pipe';
import { I18nService } from 'src/app/shared/services/i18n/i18n.service';
import { SkeletonModule } from 'primeng/skeleton';

@Component({
  selector: 'app-opportunity-information-form',
  imports: [
    InputTextModule,
    BaseLabelComponent,
    SelectModule,
    TextareaModule,
    DatePickerModule,
    FileuploadComponent,
    MessageModule,
    FormsModule,
    ReactiveFormsModule,
    TranslatePipe,
    SkeletonModule
  ],
  templateUrl: './opportunity-information-form.html',
  styleUrl: './opportunity-information-form.scss',
})
export class OpportunityInformationForm implements OnInit {
  opportunityFormService = inject(OpportunityFormService);
  adminOpportunitiesStore = inject(AdminOpportunitiesStore);
  opportunitiesStore = inject(OpportunitiesStore);
  i18nService = inject(I18nService);
  opportunityTypes = this.adminOpportunitiesStore.opportunityTypes;
  opportunityCategories = this.adminOpportunitiesStore.opportunityCategories;
  opportunityInformationForm = this.opportunityFormService.opportunityInformationForm;
  isLoading = this.opportunitiesStore.loading;

  files = signal<File[]>([]);
  acceptedFileTypes = ".jpg,.png,.pdf,.docx,video/*";
  placeholder = computed(() => this.i18nService.translate('opportunity.form.fileUploadPlaceholder'));

  invalidSelectedFile = signal(false);
  fileuploadComponent = viewChild<FileuploadComponent>("fileupload");

  // Today's date for minDate validation in datepicker
  today = new Date();

  ngOnInit() {
    // Initialize files signal from form service when component is created
    // This ensures files are displayed when revisiting the step
    this.syncFilesFromFormService();
    this.opportunityFormService.formUpdated.subscribe(() => {
      this.syncFilesFromFormService();
    });
  }

  private syncFilesFromFormService() {
    const imageValue = this.opportunityInformationForm.get('image')?.value;
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
    // Update the form field value with the files
    // This will automatically trigger validation and update the fieldTree
    const imageValue = files.length > 0 ? files[0] : null;
    this.opportunityFormService.updateImageField(imageValue);
    // Mark the field as touched so validation errors appear when user interacts with it
    this.opportunityInformationForm.get('image')?.markAsTouched();
  }

  onDateRangeChange(event: any) {
    this.opportunityFormService.handleDateRangeChange(event);
  }

  // Helper methods to get FormControls with proper typing
  getControl(controlName: string): FormControl {
    return this.opportunityInformationForm.get(controlName) as FormControl;
  }
}
