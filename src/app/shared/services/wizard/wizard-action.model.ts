import { Signal } from '@angular/core';
import { IBaseWizardAction } from 'src/app/shared/components/base-components/base-wizard-actions/base-wizard-actions';
import { ERoles } from 'src/app/shared/enums';
import { EInvestorPlanStatus, EInternalUserPlanStatus } from 'src/app/shared/interfaces';
import { I18nService } from 'src/app/shared/services/i18n';

export type WizardActionContext =
  | 'opportunity-wizard'
  | 'product-plan'
  | 'service-plan';

export type WizardMode = 'create' | 'edit' | 'view' | 'Review' | 'resubmit';

export interface IWizardActionConfig {
  context: WizardActionContext;
  state: {
    mode: Signal<WizardMode>;
    activeStep: Signal<number>;
    totalSteps: Signal<number>;
    isLoading?: Signal<boolean>;
    isProcessing?: Signal<boolean>;
    isSavingAsDraft?: Signal<boolean>;
  };
  visibility?: {
    hideSaveAsDraft?: Signal<boolean>;
    canOpenTimeline?: Signal<boolean>;
    isAddCommentButtonDisabled?: Signal<boolean>;
    isInvestorViewMode?: Signal<boolean>;
  };
  permissions?: {
    canAcknowledgeRejection?: Signal<boolean>;
    canApproveOrReject?: Signal<boolean>;
    allowUserToResubmit?: Signal<boolean>;
    hasComments?: Signal<boolean>;
  };
  metadata?: {
    persona?: ERoles[];
    status?: Signal<EInvestorPlanStatus | EInternalUserPlanStatus | null>;
  };
  handlers: {
    onPrevious?: () => void;
    onNext?: () => void;
    onSaveAsDraft?: () => void;
    onPublish?: () => void;
    onSubmit?: () => void;
    onApproveAndForward?: () => void;
    onReject?: () => void;
    onSendBack?: () => void;
    onAddComment?: () => void;
    onOpenTimeline?: () => void;
    onResubmit?: () => void;
    onAcknowledge?: () => void;
  };
}

export interface ActionContext {
  config: IWizardActionConfig;
  mode: WizardMode;
  activeStep: number;
  totalSteps: number;
  isFirstStep: boolean;
  isFinalStep: boolean;
  isLoading: boolean;
  isProcessing: boolean;
  isSavingAsDraft: boolean;
  isPlanWizard: boolean;
  isPlanRejectedFromManager: boolean;
  status: EInvestorPlanStatus | EInternalUserPlanStatus | null;
  currentLanguage: string;
}

export const INTERNAL_REJECTION_STATUSES = [
  EInternalUserPlanStatus.DV_REJECTION_ACKNOWLEDGED,
  EInternalUserPlanStatus.DV_REJECTED,
  EInternalUserPlanStatus.DEPT_REJECTED
];

export const INVESTOR_REJECTION_STATUSES = [
  EInvestorPlanStatus.REJECTED,
];

export const TRANSLATION_KEYS = {
  opportunity: {
    saveAsDraft: 'opportunity.wizard.saveAsDraft',
    back: 'opportunity.wizard.back',
    next: 'opportunity.wizard.next',
    publish: 'opportunity.wizard.publish',
  },
  plans: {
    saveAsDraft: 'plans.wizard.saveAsDraft',
    back: 'plans.wizard.back',
    next: 'plans.wizard.next',
    submit: 'plans.wizard.submit',
    timeline: 'plans.wizard.timeline',
    sendBackToInvestor: 'plans.wizard.sendBackToInvestor',
    addComments: 'plans.wizard.addComments',
    acknowledge: 'plans.wizard.acknowledge',
    reject: 'plans.wizard.reject',
    approveAndForward: 'plans.wizard.approveAndForward',
    resubmit: 'plans.wizard.resubmit',
  }
} as const;

export type WizardButtonKey =
  | 'SAVE_AS_DRAFT'
  | 'TIMELINE'
  | 'SEND_BACK'
  | 'ADD_COMMENTS'
  | 'PREVIOUS'
  | 'NEXT'
  | 'ACKNOWLEDGE'
  | 'PUBLISH'
  | 'REJECT'
  | 'APPROVE_AND_FORWARD'
  | 'RESUBMIT'
  | 'SUBMIT';

export interface WizardButtonDefinition {
  shouldShow: (ctx: ActionContext) => boolean;
  build: (ctx: ActionContext, i18n: I18nService) => IBaseWizardAction;
}

