import { ChangeDetectionStrategy, Component, computed, input, signal } from '@angular/core';
import { Signature } from 'src/app/shared/interfaces/plans.interface';
import { TranslatePipe } from 'src/app/shared/pipes';
import { SummarySectionHeader } from 'src/app/shared/components/plans/summary-section-header/summary-section-header';
import { SummaryField } from 'src/app/shared/components/plans/summary-field/summary-field';

@Component({
  selector: 'app-summary-section-signature',
  imports: [SummarySectionHeader, SummaryField, TranslatePipe],
  templateUrl: './summary-section-signature.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SummarySectionSignature {
  private readonly lrm = '\u200E';

  signature = input.required<Signature | null>();
  approvalDepartmentSignature = input<string | null>();
  isExpanded = signal(true);

  contactInfo = computed(() => this.signature()?.contactInfo ?? null);
  contactNumberLtr = computed(() => {
    const contactNumber = this.contactInfo()?.contactNumber ?? '';
    return contactNumber ? `${this.lrm}${contactNumber}` : '';
  });
  signatureValue = computed(() => this.signature()?.signatureValue ?? null);
  approvalDepartmentSignatureValue = computed(() => this.approvalDepartmentSignature() ?? null);

  toggleExpanded(): void {
    this.isExpanded.update(value => !value);
  }
}
