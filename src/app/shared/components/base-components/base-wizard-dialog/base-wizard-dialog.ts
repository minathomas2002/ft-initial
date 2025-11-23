import { CommonModule } from '@angular/common';
import { Component, computed, contentChildren, input, model, output } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { Dialog, DialogPassThrough } from 'primeng/dialog';
import { StepperModule } from 'primeng/stepper';
import { StepContentDirective } from '../../../directives/step-content.directive';
import { ScrollPanelModule } from 'primeng/scrollpanel';
import { WizardStepStateComponent } from '../../../components/utility-components/wizard-step-state/wizard-step-state.component';



@Component({
  selector: 'app-base-wizard-dialog',
  imports: [Dialog, StepperModule, ButtonModule, CommonModule, ScrollPanelModule, WizardStepStateComponent],
  templateUrl: './base-wizard-dialog.html',
  styleUrl: './base-wizard-dialog.scss',
})
export class BaseWizardDialog {
  visible = model<boolean>(false);
  finalStepLabel = input<string>('Submit');
  isFinalStep = computed(() => this.activeStep() === this.steps().length);
  isFirstStep = computed(() => this.activeStep() === 1);
  isNextStepDisabled = input<boolean>(false);
  onClose = output<void>();
  onShow = output<void>();
  onNextStep = output<void>();
  onPreviousStep = output<void>();
  onSaveAsDraft = output<void>();
  wizardTitle = input<string>('Create Opportunity');
  pt: DialogPassThrough = {
    header: {
      class: '!ps-0 !pt-0 !pb-0',
    },
    content: {
      class: '!ps-0 h-full !pb-0',
    }
  }
  activeStep = model.required<number>();
  steps = input.required<{
    title: string;
    description: string;
    isValid: boolean;
    hasStarted?: boolean;
    hasErrors?: boolean;
  }[]>();

  stepContents = contentChildren<StepContentDirective>(StepContentDirective);
  previousStep = () => {
    this.onPreviousStep.emit();
  }
  nextStep = () => {
    this.onNextStep.emit();
  }
  saveAsDraft = () => {
    this.onSaveAsDraft.emit();
  }
}
