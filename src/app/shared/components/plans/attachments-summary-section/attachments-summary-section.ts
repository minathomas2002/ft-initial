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

  /** Original attachments from plan response (service or product) for before/after comparison. */
  private beforeAttachments = computed<AttachmentItem[]>(() => {
    const servicePlan = this.planStore.servicePlanData()?.servicePlan;
    if (servicePlan?.attachments?.length) {
      return servicePlan.attachments as AttachmentItem[];
    }
    const productPlan = this.planStore.productPlanData()?.productPlan;
    const saudization = productPlan?.saudization;
    if (saudization?.attachments?.length) {
      return saudization.attachments as AttachmentItem[];
    }
    return [];
  });

  /** Comparable string for attachment list (sorted identifiers) for difference check. */
  private attachmentSignature(items: AttachmentItem[]): string {
    if (!items?.length) return '';
    const sorted = [...items]
      .map((a) => a.ibmIdentifier || a.id || '')
      .filter(Boolean)
      .sort();
    return sorted.join('\n');
  }

  /** True in resubmit mode when current attachments differ from original. */
  shouldShowDifferenceForAttachments = computed(() => {
    const current = this.attachmentSignature(this.attachments());
    const before = this.attachmentSignature(this.beforeAttachments());
    return this.shouldShowDifference(current, before);
  });

  attachmentsSummaryField = computed<IPlanSummaryField>(() => {
    this.doRefresh();
    return {
      label: '',
      beforeValue: '',
      currantValue: '',
      hasError: this.isFieldHasError(this.getValueFormControl(EMaterialsFormControls.attachments)),
      hasComment: this.shouldShowCommentIcon(EMaterialsFormControls.attachments),
      isResolved: this.isResolved(),
      showDifference: this.shouldShowDifferenceForAttachments(),
    };
  });

  isResolved = computed(() => this.isResolvedField(EMaterialsFormControls.attachments));

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
