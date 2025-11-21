import { CommonModule } from '@angular/common';
import { Component, computed, contentChildren, ContentChildren, input, model, output, QueryList, signal } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { Dialog, DialogPassThrough } from 'primeng/dialog';
import { StepperModule } from 'primeng/stepper';
import { StepContentDirective } from '../../../directives/step-content.directive';
import { ScrollPanelModule } from 'primeng/scrollpanel';


@Component({
  selector: 'app-base-wizard-dialog',
  imports: [Dialog, StepperModule, ButtonModule, CommonModule, ScrollPanelModule],
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
  pt: DialogPassThrough = {
    header: {
      class: '!ps-0 !pt-0 !pb-0',
    },
    content: {
      class: '!ps-0 h-full !pb-0',
    }
  }
  activeStep = signal<number>(1);
  steps = input.required<{
    title: string;
    description: string;
    isValid: boolean;
  }[]>();

  stepContents = contentChildren<StepContentDirective>(StepContentDirective);
  previousStep = () => {
    this.activeStep.set(this.activeStep() - 1);
  }
  nextStep = () => {
    this.activeStep.set(this.activeStep() + 1);
  }
}
