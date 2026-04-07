import { CommonModule } from '@angular/common';
import { Component, computed, contentChildren, inject, input, model, output, viewChild, effect, signal, ChangeDetectionStrategy, ElementRef } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { Dialog, DialogPassThrough } from 'primeng/dialog';
import { StepperModule } from 'primeng/stepper';
import { StepContentDirective } from '../../../directives/step-content.directive';
import { ScrollPanelModule, ScrollPanel } from 'primeng/scrollpanel';
import { WizardStepStateComponent } from '../../../components/utility-components/wizard-step-state/wizard-step-state.component';
import { IWizardStepState } from 'src/app/shared/interfaces/wizard-state.interface';
import { ImageErrorDirective } from '../../../directives/image-error.directive';
import { BaseWizardActions, IBaseWizardAction } from '../base-wizard-actions/base-wizard-actions';
import { AuthStore } from 'src/app/shared/stores/auth/auth.store';
import { RequiredFieldsMessage } from '../../plans/required-fields-message/required-fields-message';



@Component({
  selector: 'app-base-wizard-dialog',
  imports: [
    Dialog,
    StepperModule,
    ButtonModule,
    CommonModule,
    ScrollPanelModule,
    WizardStepStateComponent,
    ImageErrorDirective,
    BaseWizardActions,
    RequiredFieldsMessage
  ],
  templateUrl: './base-wizard-dialog.html',
  styleUrl: './base-wizard-dialog.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BaseWizardDialog {
  activeStep = model<number>(1);
  showRequiredFieldsMessage = input<boolean>(false)
  visible = model<boolean>(false);
  isFinalStep = computed(() => this.activeStep() === this.steps().length);
  isFirstStep = computed(() => this.activeStep() === 1);
  onClose = output<void>();
  onShow = output<void>();
  wizardTitle = input<string>('Create Opportunity');
  authStore = inject(AuthStore);
  isImpersonating = computed(() => this.authStore.isImpersonating());
  dialogStyleClass = computed(() =>
    this.isImpersonating()
      ? 'w-full !max-h-full !p-0 !h-[calc(100%-45px)] !mt-[45px]'
      : 'w-full !max-h-full h-full !p-0'
  );
  // Centralized actions
  actions = input<IBaseWizardAction[]>([]);

  /**
   * Handles the close button click.
   * Emits onClose event to let parent components handle the close logic.
   * Parent can show confirmation dialog and decide whether to actually close.
   */
  handleCloseClick(): void {
    this.onClose.emit();
  }

  pt: DialogPassThrough = {
    header: {
      class: '!ps-0 !pt-0 !pb-0',
    },
    content: {
      class: '!ps-0 !pe-[1px] h-full !pb-0',
    }
  }
  steps = input.required<IWizardStepState[]>();

  stepContents = contentChildren<StepContentDirective>(StepContentDirective);

  // Reference to the ScrollPanel component (optional since it may not exist)
  scrollPanel = viewChild<ScrollPanel>('scrollPanel');

  // Reference to the scrollable content div (fallback when ScrollPanel is not used)
  scrollableContent = viewChild<ElementRef<HTMLDivElement>>('scrollableContent');

  constructor() {

    // Reset scroll position when activeStep changes
    effect(() => {
      // Access activeStep to make effect reactive
      const step = this.activeStep();
      if (!step) {
        return;
      }
      // Use setTimeout to ensure DOM is updated before scrolling
      // This runs after the current change detection cycle
      setTimeout(() => {
        this.resetScrollPosition();
      }, 0);
    });
  }

  /**
   * Resets the scroll position of the ScrollPanel or scrollable content area to the top
   */
  private resetScrollPosition(): void {
    try {
      const panel = this.scrollPanel();

      // If ScrollPanel component exists, use it
      if (panel) {
        // Approach 1: Access ScrollPanel's contentViewChild
        const contentElement = (panel as any).contentViewChild?.nativeElement;
        if (contentElement) {
          // Find the scrollable content div (has class 'p-scrollpanel-content')
          const scrollableContent = contentElement.querySelector('.p-scrollpanel-content');
          if (scrollableContent) {
            scrollableContent.scrollTop = 0;
            return;
          }
          // Fallback: try scrolling the content element itself
          if (contentElement.scrollTop !== undefined) {
            contentElement.scrollTop = 0;
            return;
          }
        }

        // Approach 2: Query the DOM directly for ScrollPanel content
        const panelElement = (panel as any).el?.nativeElement;
        if (panelElement) {
          const scrollableContent = panelElement.querySelector('.p-scrollpanel-content');
          if (scrollableContent) {
            scrollableContent.scrollTop = 0;
            return;
          }
        }
      }

      // Fallback: Use the scrollable content div reference (when ScrollPanel is not used)
      const scrollableArea = this.scrollableContent();
      if (scrollableArea?.nativeElement) {
        scrollableArea.nativeElement.scrollTop = 0;
        return;
      }
    } catch (error) {
      console.warn('Failed to reset scroll position:', error);
    }
  }
}
