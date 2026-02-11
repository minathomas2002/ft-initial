import { computed, inject, Injectable, Signal } from '@angular/core';
import { IBaseWizardAction } from '../../components/base-components/base-wizard-actions/base-wizard-actions';
import { I18nService } from '../i18n/i18n.service';

export type WizardActionContext =
  | 'opportunity-wizard'
  | 'product-plan'
  | 'service-plan';

export type WizardMode = 'create' | 'edit' | 'view' | 'Review' | 'resubmit';

export interface IWizardActionConfig {
  context: WizardActionContext;
  mode: WizardMode;
  activeStep: Signal<number>;
  totalSteps: Signal<number>;
  isLoading?: Signal<boolean>;
  isProcessing?: Signal<boolean>;
  isSavingAsDraft?: Signal<boolean>;
  hideSaveAsDraft?: Signal<boolean>;

  canAcknowledgeRejection?: Signal<boolean>;
  canApproveOrReject?: Signal<boolean>;
  allowUserToResubmit?: Signal<boolean>;
  canOpenTimeline?: Signal<boolean>;
  isAddCommentButtonDisabled?: Signal<boolean>;
  isInvestorViewMode?: Signal<boolean>;

  // Action handlers
  onPrevious?: () => void;
  onNext?: () => void;
  onSaveAsDraft?: () => void;
  onPublish?: () => void;
  onSubmit?: () => void;
  onApproveAndForward?: () => void;
  onReject?: () => void;
  onSendBackToInvestor?: () => void;
  onAddComment?: () => void;
  onOpenTimeline?: () => void;
  onResubmit?: () => void;
  onAcknowledge?:()=>void;
}

@Injectable({
  providedIn: 'root'
})
export class WizardActionFactory {
  private i18nService = inject(I18nService);

  generateActions(config: IWizardActionConfig): Signal<IBaseWizardAction[]> {
    return computed(() => this.buildActions(config));
  }

  private buildActions(config: IWizardActionConfig): IBaseWizardAction[] {
    const actions: IBaseWizardAction[] = [];
    const activeStep = config.activeStep();
    const totalSteps = config.totalSteps();
    const isFirstStep = activeStep === 1;
    const isFinalStep = activeStep === totalSteps;
    const isLoading = config.isLoading?.() ?? false;
    const isProcessing = config.isProcessing?.() ?? false;
    const isSavingAsDraft = config.isSavingAsDraft?.() ?? false;

    const { context, mode } = config;
    const currentLanguage = this.i18nService.currentLanguage();
    const isPlanWizard = context === 'product-plan' || context === 'service-plan';

    const shouldShowSaveAsDraft = !!config.onSaveAsDraft && !config.hideSaveAsDraft?.();
    if (shouldShowSaveAsDraft) {
      actions.push({
        id: 'save-as-draft',
        label: this.i18nService.translate(
          context === 'opportunity-wizard'
            ? 'opportunity.wizard.saveAsDraft'
            : 'plans.wizard.saveAsDraft'
        ),
        icon: 'icon-save',
        severity: 'secondary',
        text: true,
        disabled: isSavingAsDraft || isProcessing,
        loading: isSavingAsDraft,
        onClick: config.onSaveAsDraft,
        position: 'left'
      });
    }

    const shouldShowTimeline =
      isPlanWizard &&
      !!config.onOpenTimeline &&
      (config.canOpenTimeline?.() ?? false);

    if (shouldShowTimeline) {
      actions.push({
        id: 'timeline',
        label: this.i18nService.translate('plans.wizard.timeline'),
        icon: 'icon-list',
        severity: 'secondary',
        text: true,
        onClick: config.onOpenTimeline,
        position: 'left',
      });
    }

    const shouldShowAcknowledge =
      mode === 'Review' && config.canAcknowledgeRejection?.();

    if (shouldShowAcknowledge) {
      actions.push({
        id: 'acknowledge',
        label: this.i18nService.translate('plans.wizard.acknowledge'),
        severity: 'danger',
        onClick: config.onAcknowledge,
        position: 'right'
      });
    }

    const shouldShowSendBackToInvestor = mode === 'Review' && isFinalStep && !!config.onSendBackToInvestor &&
             !config.canAcknowledgeRejection;
    if (shouldShowSendBackToInvestor) {
      actions.push({
        id: 'send-back-to-investor',
        label: this.i18nService.translate('plans.wizard.sendBackToInvestor'),
        text: true,
        severity: 'secondary',
        onClick: config.onSendBackToInvestor,
        position: 'left',
        styleClass: 'underline-action',
      });
    }

    const shouldShowAddComment =
      (mode === 'Review' || mode === 'resubmit') &&
      activeStep < totalSteps &&
      !!config.onAddComment && !config.canAcknowledgeRejection;

    if (shouldShowAddComment) {
      const isDisabled = config.isAddCommentButtonDisabled?.() ?? false;
      actions.push({
        id: 'add-comments',
        label: this.i18nService.translate('plans.wizard.addComments'),
        icon: 'icon-message-circle',
        severity: 'secondary',
        text: true,
        disabled: isDisabled,
        onClick: config.onAddComment,
        position: 'left'
      });
    }

    if (!isFirstStep && config.onPrevious) {
      actions.push({
        id: 'previous',
        label: this.i18nService.translate(
          context === 'opportunity-wizard'
            ? 'opportunity.wizard.back'
            : 'plans.wizard.back'
        ),
        icon: currentLanguage === 'ar' ? 'icon-arrow-right' : 'icon-arrow-left',
        severity: 'secondary',
        disabled: isLoading,
        onClick: config.onPrevious,
        position: 'right'
      });
    }

    if (!isFinalStep && config.onNext) {
      const nextIcon = currentLanguage === 'ar' ? 'icon-arrow-left' : 'icon-arrow-right';
      actions.push({
        id: 'next',
        label: this.i18nService.translate(
          context === 'opportunity-wizard'
            ? 'opportunity.wizard.next'
            : 'plans.wizard.next'
        ),
        icon: nextIcon,
        disabled: isLoading,
        loading: isLoading,
        onClick: config.onNext,
        position: 'right'
      });
    }

    if (isFinalStep) {

      if (context === 'opportunity-wizard' && config.onPublish) {
        actions.push({
          id: 'publish',
          label: this.i18nService.translate('opportunity.wizard.publish'),
          disabled: isProcessing,
          loading: isProcessing || isLoading,
          onClick: config.onPublish,
          position: 'right'
        });
      }

      else if (mode === 'Review' && !config.isInvestorViewMode?.() && !config.canAcknowledgeRejection) {
        const canApproveOrReject = config.canApproveOrReject?.() ?? true;

        if (config.onReject) {
          actions.push({
            id: 'reject',
            label: this.i18nService.translate('plans.wizard.reject'),
            severity: 'danger',
            disabled: !canApproveOrReject,
            onClick: config.onReject,
            position: 'right'
          });
        }

        if (config.onApproveAndForward) {
          actions.push({
            id: 'approve-and-forward',
            label: this.i18nService.translate('plans.wizard.approveAndForward'),
            disabled: !canApproveOrReject,
            onClick: config.onApproveAndForward,
            position: 'right'
          });
        }
      }

      else if (mode === 'resubmit' && config.onResubmit) {
        const allowResubmit = config.allowUserToResubmit?.() ?? true;
        actions.push({
          id: 'resubmit',
          label: this.i18nService.translate('plans.wizard.resubmit'),
          disabled: !allowResubmit,
          onClick: config.onResubmit,
          position: 'right'
        });
      }

      else if (isPlanWizard && config.onSubmit && (!mode || mode === 'create' || mode === 'edit')) {
        actions.push({
          id: 'submit',
          label: this.i18nService.translate('plans.wizard.submit'),
          onClick: config.onSubmit,
          position: 'right'
        });
      }
    }

    return actions;
  }
}
