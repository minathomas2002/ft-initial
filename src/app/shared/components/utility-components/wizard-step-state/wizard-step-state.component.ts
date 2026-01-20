import { Component, computed, inject, input, effect, signal, ChangeDetectionStrategy } from '@angular/core';
import { BadgeModule } from 'primeng/badge';
import { EWizardStepState } from 'src/app/shared/enums/wizard-step-state.enum';
import { IWizardStepState } from 'src/app/shared/interfaces/wizard-state.interface';
import { FormUtilityService } from 'src/app/shared/services/form-utility/form-utility.service';
import { merge, startWith, distinctUntilChanged } from 'rxjs';
import { map } from 'rxjs';
import { PlanStore } from 'src/app/shared/stores/plan/plan.store';
import { AuthStore } from 'src/app/shared/stores/auth/auth.store';
import { ERoles } from 'src/app/shared/enums/roles.enum';

@Component({
  selector: 'app-wizard-step-state',
  imports: [BadgeModule],
  templateUrl: './wizard-step-state.component.html',
  styleUrl: './wizard-step-state.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WizardStepStateComponent {
  private formUtilityService = inject(FormUtilityService);
  stepState = input.required<IWizardStepState>();
  formState = computed(() => this.stepState().formState);
  commentColor = computed(() => this.stepState().commentColor);
  planStore = inject(PlanStore);
  authStore = inject(AuthStore);
  viewMode = computed(() => this.planStore.wizardMode());

  // Check if user is investor persona
  isInvestorPersona = computed(() => {
    const userProfile = this.authStore.userProfile();
    if (!userProfile) return false;
    const hasInvestorCode = !!userProfile.investorCode;
    const hasNoEmployeeId = !userProfile.employeeID;
    const hasInvestorRole = userProfile.roleCodes?.includes(ERoles.INVESTOR) ?? false;
    return (hasInvestorCode && hasNoEmployeeId) || hasInvestorRole;
  });

  commentBadgeSeverity = computed(() => {
    // Match commentColor from product/service plans in all cases
    // 'green' maps to 'success' badge, anything else (including 'orange') maps to 'warn' badge
    return this.commentColor() === 'green' ? 'success' : 'warn';
  });
  // Signal to track form state - updated reactively
  private formStateSignal = signal<{ valid: boolean; invalid: boolean; dirty: boolean; touched: boolean; value: any }>({
    valid: false,
    invalid: false,
    dirty: false,
    touched: false,
    value: null,
  });

  constructor() {
    // Set up reactive form state tracking using effect
    effect(() => {
      if (!this.formState()) return;
      const form = this.formState()!;
      // Update initial state
      this.updateFormState(form);

      // Merge form observables - only update when actual changes occur
      const formStateObservable = merge(
        form.statusChanges.pipe(startWith(null)),
        form.valueChanges.pipe(startWith(null))
      ).pipe(
        map(() => ({
          valid: form.valid,
          invalid: form.invalid,
          dirty: form.dirty,
          touched: form.touched,
          value: form.value,
        })),
        distinctUntilChanged((prev, curr) =>
          prev.valid === curr.valid &&
          prev.invalid === curr.invalid &&
          prev.dirty === curr.dirty &&
          prev.touched === curr.touched &&
          prev.value === curr.value
        )
      );

      // Subscribe to form state changes
      const subscription = formStateObservable.subscribe(() => {
        // Update form state whenever status or values change
        this.updateFormState(form);
      });

      // Cleanup
      return () => {
        subscription.unsubscribe();
      };
    });
  }

  private updateFormState(form: any) {
    this.formStateSignal.set({
      valid: form.valid,
      invalid: form.invalid,
      dirty: form.dirty,
      touched: form.touched,
      value: form.value,
    });
  }

  errorsNumber = computed(() => {
    // Read both signals to ensure reactivity
    const state = this.formStateSignal();
    // Early return if no errors should be shown
    if (!state.invalid || (!state.dirty && !state.touched)) {
      return 0;
    }
    // Only calculate error count when necessary
    if (!this.formState()) return 0;
    const form = this.formState()!;
    return this.stepState().hasErrors ? this.formUtilityService.countFormErrors(form) : 0;
  });

  status = computed(() => {
    // Read signal to ensure reactivity
    const state = this.formStateSignal();
    if (state.valid) {
      return EWizardStepState.Completed;
    } else if (state.dirty && state.invalid) {
      return EWizardStepState.Error;
    }
    return EWizardStepState.Incomplete;
  });

  get EWizardStepState() {
    return EWizardStepState;
  }
}

