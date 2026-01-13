import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { SummaryField } from 'src/app/shared/components/plans/summary-field/summary-field';
import { SummarySectionHeader } from 'src/app/shared/components/plans/summary-section-header/summary-section-header';
import { Signature } from 'src/app/shared/interfaces/plans.interface';
import { TranslatePipe } from 'src/app/shared/pipes';

@Component({
  selector: 'app-summary-section-signature',
  imports: [SummarySectionHeader, SummaryField, TranslatePipe],
  templateUrl: './summary-section-signature.html',
  styleUrl: './summary-section-signature.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SummarySectionSignature {
  signature = input.required<Signature | null>();

  contactInfo = computed(() => this.signature()?.contactInfo ?? null);
  signatureValue = computed(() => this.signature()?.signatureValue ?? null);
}
