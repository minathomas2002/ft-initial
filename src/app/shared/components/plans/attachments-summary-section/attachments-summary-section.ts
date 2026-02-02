import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { SummarySectionBaseClass } from 'src/app/shared/classes/plans/base-classes/summary-section-base.class';
import { PlanSummaryFlied } from 'src/app/shared/components/plans/plan-summary-flied/plan-summary-flied';
import { EMaterialsFormControls } from 'src/app/shared/enums';
import { IPlanSummaryField } from 'src/app/shared/interfaces/plans.interface';
import { Attachment } from 'src/app/shared/interfaces/plans.interface';

type AttachmentItem = Attachment & { name?: string; type?: string; size?: number; objectURL?: string; url?: string };
import { AttachmentService } from 'src/app/shared/services/attachment/attachment.service';
import { ImageErrorDirective } from 'src/app/shared/directives/image-error.directive';

@Component({
  selector: 'app-attachments-summary-section',
  imports: [PlanSummaryFlied, ImageErrorDirective],
  templateUrl: './attachments-summary-section.html',
  styleUrl: './attachments-summary-section.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AttachmentsSummarySection extends SummarySectionBaseClass {
  private readonly attachmentService = inject(AttachmentService);

  attachments = computed(() => {
    this.doRefresh();
    const value = this.getValueFormControl(EMaterialsFormControls.attachments).value;
    if (Array.isArray(value)) return value as AttachmentItem[];
    return value ? [value as AttachmentItem] : [];
  });

  hasAttachments = computed(() => this.attachments().length > 0);

  attachmentsSummaryField = computed<IPlanSummaryField>(() => {
    this.doRefresh();
    return {
      label: '',
      beforeValue: '',
      currantValue: '',
      hasError: this.isFieldHasError(this.getValueFormControl(EMaterialsFormControls.attachments)),
      hasComment: this.isFieldHasComment(EMaterialsFormControls.attachments),
      isResolved: this.isResolvedField(EMaterialsFormControls.attachments),
      showDifference: false,
    };
  });

  getFileIcon(file: AttachmentItem): string | null {
    if (!file) return null;
    const name = file.fileName || file.name || '';
    if (name.toLowerCase().endsWith('.zip') || file.type === 'application/zip' || file.type === 'application/x-zip-compressed') {
      return 'assets/images/zip.png';
    }
    if (name.toLowerCase().endsWith('.pdf') || file.type === 'application/pdf') {
      return 'assets/images/pdf.png';
    }
    return null;
  }

  downloadFile(file: AttachmentItem): void {
    const fileId = file.ibmIdentifier;
    if (!fileId) return;
    this.attachmentService.downloadAndSaveAttachment(fileId, file.fileName).subscribe({
      next: () => { },
      error: (err) => console.error('Error downloading file.', err),
    });
  }
}
