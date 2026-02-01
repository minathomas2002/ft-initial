import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { SummarySectionBaseClass } from 'src/app/shared/classes/plans/base-classes/summary-section-base.class';
import { PlanSummaryFlied } from 'src/app/shared/components/plans/plan-summary-flied/plan-summary-flied';
import { EMaterialsFormControls } from 'src/app/shared/enums';
import { IPlanSummaryField } from 'src/app/shared/interfaces/plans.interface';
import { Attachment } from 'src/app/shared/interfaces/plans.interface';

type AttachmentItem = Attachment & { name?: string; type?: string; size?: number; objectURL?: string; url?: string };
import { AttachmentService } from 'src/app/shared/services/attachment/attachment.service';
import { TranslatePipe } from 'src/app/shared/pipes';
import { ImageErrorDirective } from 'src/app/shared/directives/image-error.directive';

@Component({
  selector: 'app-attachments-summary-section',
  imports: [PlanSummaryFlied, TranslatePipe, ImageErrorDirective],
  templateUrl: './attachments-summary-section.html',
  styleUrl: './attachments-summary-section.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AttachmentsSummarySection extends SummarySectionBaseClass {
  readonly translateKey = input<string>('plans.summary.attachments');

  private readonly attachmentService = inject(AttachmentService);

  attachments = computed(() => {
    this.doRefresh();
    const attachmentsControl = this.sectionFormGroup().get(EMaterialsFormControls.attachments);
    let value: unknown = null;
    if (attachmentsControl instanceof FormGroup) {
      value = attachmentsControl.get(EMaterialsFormControls.value)?.value;
    } else {
      value = attachmentsControl?.value;
    }
    if (Array.isArray(value)) return value as AttachmentItem[];
    return value ? [value as AttachmentItem] : [];
  });

  hasAttachments = computed(() => this.attachments().length > 0);

  hasAttachmentsError = computed(() => {
    this.doRefresh();
    const attachmentsControl = this.sectionFormGroup().get(EMaterialsFormControls.attachments);
    if (!attachmentsControl) return false;
    if (attachmentsControl.invalid && (attachmentsControl.dirty || attachmentsControl.touched)) return true;
    if (attachmentsControl instanceof FormGroup) {
      const valueControl = attachmentsControl.get(EMaterialsFormControls.value);
      return !!(valueControl && valueControl.invalid && (valueControl.dirty || valueControl.touched));
    }
    return false;
  });

  attachmentsSummaryField = computed<IPlanSummaryField>(() => {
    this.doRefresh();
    const hasComment = this.isFieldHasComment(EMaterialsFormControls.attachments, null);
    const fileNames = this.attachments().map((f) => f.fileName || f.name || '').filter(Boolean).join(', ');
    return {
      label: this.i18nService.translate(this.translateKey()),
      beforeValue: '',
      currantValue: fileNames || '-',
      hasError: this.hasAttachmentsError(),
      hasComment,
      isResolved: false,
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
