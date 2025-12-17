import { ChangeDetectionStrategy, Component, computed, inject, signal, DestroyRef } from '@angular/core';
import { ProductPlanFormService } from 'src/app/shared/services/plan/materials-form-service/product-plan-form-service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-value-chain-summary',
  imports: [],
  templateUrl: './value-chain-summary.component.html',
  styleUrl: './value-chain-summary.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ValueChainSummaryComponent {
  private readonly productPlanFormService = inject(ProductPlanFormService);
  private readonly destroyRef = inject(DestroyRef);

  formGroup = this.productPlanFormService.step3_valueChain;

  // Signal to trigger recalculation when form values change
  private formChangeTrigger = signal(0);

  // Computed signals for summary percentages (Year 1-7)
  // Read formChangeTrigger to make them reactive to form changes
  year1TotalLocalization = computed(() => {
    this.formChangeTrigger(); // Make reactive to form changes
    return this.productPlanFormService.calculateYearTotalLocalization(1);
  });
  year2TotalLocalization = computed(() => {
    this.formChangeTrigger(); // Make reactive to form changes
    return this.productPlanFormService.calculateYearTotalLocalization(2);
  });
  year3TotalLocalization = computed(() => {
    this.formChangeTrigger(); // Make reactive to form changes
    return this.productPlanFormService.calculateYearTotalLocalization(3);
  });
  year4TotalLocalization = computed(() => {
    this.formChangeTrigger(); // Make reactive to form changes
    return this.productPlanFormService.calculateYearTotalLocalization(4);
  });
  year5TotalLocalization = computed(() => {
    this.formChangeTrigger(); // Make reactive to form changes
    return this.productPlanFormService.calculateYearTotalLocalization(5);
  });
  year6TotalLocalization = computed(() => {
    this.formChangeTrigger(); // Make reactive to form changes
    return this.productPlanFormService.calculateYearTotalLocalization(6);
  });
  year7TotalLocalization = computed(() => {
    this.formChangeTrigger(); // Make reactive to form changes
    return this.productPlanFormService.calculateYearTotalLocalization(7);
  });

  constructor() {
    // Subscribe to form value changes to trigger summary recalculation
    this.formGroup.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        // Update trigger signal to make computed signals reactive
        this.formChangeTrigger.update(v => v + 1);
      });
  }
}
