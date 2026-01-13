import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { Signature } from 'src/app/shared/interfaces/plans.interface';
import { TranslatePipe } from 'src/app/shared/pipes';
import { SummaryField } from '../../shared/summary-field/summary-field';
import { SummarySectionHeader } from '../../shared/summary-section-header/summary-section-header';

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
