import { ERoles } from "src/app/shared/enums";
import { EInternalUserPlanStatus, EInvestorPlanStatus } from "src/app/shared/interfaces";
import { TRANSLATION_KEYS, WizardButtonDefinition, WizardButtonKey } from "src/app/shared/services/wizard/wizard-action.model";

export const WIZARD_BUTTONS: Record<WizardButtonKey, WizardButtonDefinition> = {
  SAVE_AS_DRAFT: {

    shouldShow: (context) =>
      !!context.config.handlers.onSaveAsDraft &&
      !context.config.visibility?.hideSaveAsDraft?.(),

    build: (context, i18n) => {
      const key =
        context.config.context === 'opportunity-wizard'
          ? TRANSLATION_KEYS.opportunity.saveAsDraft
          : TRANSLATION_KEYS.plans.saveAsDraft;

      return {
        id: 'save-as-draft',
        label: i18n.translate(key),
        icon: 'icon-save',
        severity: 'secondary',
        text: true,
        disabled: context.isSavingAsDraft || context.isProcessing,
        loading: context.isSavingAsDraft,
        onClick: context.config.handlers.onSaveAsDraft,
        position: 'left'
      };
    }
  },

  TIMELINE: {

    shouldShow: (context) =>
      context.isPlanWizard &&
      !!context.config.handlers.onOpenTimeline &&
      (context.config.visibility?.canOpenTimeline?.() ?? false),

    build: (context, i18n) => ({
      id: 'timeline',
      label: i18n.translate(TRANSLATION_KEYS.plans.timeline),
      icon: 'icon-list',
      severity: 'secondary',
      text: true,
      onClick: context.config.handlers.onOpenTimeline,
      position: 'left'
    })
  },

  SEND_BACK: {

    shouldShow: (context) =>
      context.mode === 'Review' &&
      context.isFinalStep &&
      !!context.config.handlers.onSendBack &&
      !context.config.permissions?.canAcknowledgeRejection?.() &&
      !context.isPlanRejectedFromManager &&
      context.status !== EInternalUserPlanStatus.DEPT_APPROVED,

    build: (context, i18n) => {
      const label =
        context.config.metadata?.persona?.includes(ERoles.EMPLOYEE)
          ? i18n.translate(TRANSLATION_KEYS.plans.sendBackToInvestor)
          : context.config.metadata?.persona?.includes(ERoles.DEPARTMENT_MANAGER)
          ? i18n.translate(TRANSLATION_KEYS.plans.sendBackToDv):
           i18n.translate(TRANSLATION_KEYS.plans.sendBackToEmployee);

      return {
        id: 'send-back',
        label,
        disabled: !context.config.permissions?.hasComments?.(),
        text: true,
        severity: 'secondary',
        onClick: context.config.handlers.onSendBack,
        position: 'left',
        styleClass: 'underline-action'
      };
    }
  },

  ADD_COMMENTS: {

    shouldShow: (context) => {
      const currentStepState = context.config.state.currentStepState;
      const planComments = context.config.state.planComments;
      const shouldHideInResubmit =
        !!planComments?.() &&
        !!currentStepState?.()?.length &&
        planComments()!.comments.some(
          comment =>
            comment.pageTitleForTL === currentStepState()![0].title
        );

      return ((context.mode === 'Review' || context.mode === 'resubmit') &&
      context.activeStep < context.totalSteps &&
      !!context.config.handlers.onAddComment &&
      !context.config.permissions?.canAcknowledgeRejection?.() &&
      !context.isPlanRejectedFromManager &&
      context.config.metadata?.status?.() !== EInternalUserPlanStatus.DEPT_APPROVED) &&
        (context.mode === 'resubmit' ? shouldHideInResubmit : true)
    },

    build: (context, i18n) => ({
      id: 'add-comments',
      label: i18n.translate(TRANSLATION_KEYS.plans.addComments),
      icon: 'icon-message-circle',
      severity: 'secondary',
      text: true,
      disabled: context.config.visibility?.isAddCommentButtonDisabled?.() ?? false,
      onClick: context.config.handlers.onAddComment,
      position: 'left'
    })
  },

  PREVIOUS: {

    shouldShow: (context) =>
      !context.isFirstStep &&
      !!context.config.handlers.onPrevious,

    build: (context, i18n) => {
      const key =
        context.config.context === 'opportunity-wizard'
          ? TRANSLATION_KEYS.opportunity.back
          : TRANSLATION_KEYS.plans.back;

      const icon =
        context.currentLanguage === 'ar'
          ? 'icon-arrow-right'
          : 'icon-arrow-left';

      return {
        id: 'previous',
        label: i18n.translate(key),
        icon,
        severity: 'secondary',
        disabled: context.isLoading,
        onClick: context.config.handlers.onPrevious,
        position: 'right'
      };
    }
  },

  NEXT: {

    shouldShow: (context) =>
      !context.isFinalStep &&
      !!context.config.handlers.onNext,

    build: (context, i18n) => {
      const key =
        context.config.context === 'opportunity-wizard'
          ? TRANSLATION_KEYS.opportunity.next
          : TRANSLATION_KEYS.plans.next;

      const icon =
        context.currentLanguage === 'ar'
          ? 'icon-arrow-left'
          : 'icon-arrow-right';

      return {
        id: 'next',
        label: i18n.translate(key),
        icon,
        disabled: context.isLoading,
        loading: context.isLoading,
        onClick: context.config.handlers.onNext,
        position: 'right'
      };
    }
  },

  ACKNOWLEDGE: {

    shouldShow: (context) =>
      context.isFinalStep &&
      context.mode === 'Review' &&
      (context.config.permissions?.canAcknowledgeRejection?.() ?? false),

    build: (context, i18n) => ({
      id: 'acknowledge',
      label: i18n.translate(TRANSLATION_KEYS.plans.acknowledge),
      severity: 'danger',
      onClick: context.config.handlers.onAcknowledge,
      position: 'right'
    })
  },

  PUBLISH: {

    shouldShow: (context) =>
      context.isFinalStep &&
      context.config.context === 'opportunity-wizard' &&
      !!context.config.handlers.onPublish,

    build: (context, i18n) => ({
      id: 'publish',
      label: i18n.translate(TRANSLATION_KEYS.opportunity.publish),
      disabled: context.isProcessing,
      loading: context.isProcessing || context.isLoading,
      onClick: context.config.handlers.onPublish,
      position: 'right'
    })
  },

  REJECT: {

    shouldShow: (context) => {
      const isDeptApproved =
        context.status === EInternalUserPlanStatus.DEPT_APPROVED;

      return (
        context.isFinalStep &&
        context.mode === 'Review' &&
        !context.config.visibility?.isInvestorViewMode?.() &&
        !context.config.permissions?.canAcknowledgeRejection?.() &&
        !isDeptApproved &&
        context.status !== EInternalUserPlanStatus.ReturnedByDV
      );
    },


    build: (context) => {
      const isPlanRejectedFromManager = [EInternalUserPlanStatus.DV_REJECTED, EInternalUserPlanStatus.DV_REJECTION_ACKNOWLEDGED];

      return {
        id: 'reject',
        label: isPlanRejectedFromManager.includes(context.status as EInternalUserPlanStatus) ? 'Submit Rejection' : 'Reject',
        severity: 'danger',
        disabled: !(context.config.permissions?.canApproveOrReject?.() ?? true),
        onClick: context.config.handlers.onReject,
        position: 'right'
      }
    }
  },

  APPROVE_AND_FORWARD: {

    shouldShow: (context) =>
      context.isFinalStep &&
      context.mode === 'Review' &&
      !context.config.visibility?.isInvestorViewMode?.() &&
      !context.config.permissions?.canAcknowledgeRejection?.() &&
      !context.isPlanRejectedFromManager &&
      context.status !== EInternalUserPlanStatus.ReturnedByDV,

    build: (context, i18n) => {
      const isDeptApproved =
        context.status === EInternalUserPlanStatus.DEPT_APPROVED;

      const label = isDeptApproved
        ? 'Submit Approval'
        : i18n.translate(TRANSLATION_KEYS.plans.approveAndForward);

      return {
        id: 'approve-and-forward',
        label,
        disabled: !(context.config.permissions?.canApproveOrReject?.() ?? true),
        onClick: context.config.handlers.onApproveAndForward,
        position: 'right'
      };
    }
  },

  RESUBMIT: {

    shouldShow: (context) =>
      context.isFinalStep &&
      context.mode === 'resubmit' &&
      !!context.config.handlers.onResubmit,

    build: (context, i18n) => ({
      id: 'resubmit',
      label: i18n.translate(TRANSLATION_KEYS.plans.resubmit),
      disabled: !(context.config.permissions?.allowUserToResubmit?.() ?? true),
      onClick: context.config.handlers.onResubmit,
      position: 'right'
    })
  },

  SUBMIT: {

    shouldShow: (context) =>
      context.isFinalStep &&
      context.isPlanWizard &&
      !!context.config.handlers.onSubmit &&
      (!context.mode ||
        context.mode === 'create' ||
        context.mode === 'edit'),

    build: (context, i18n) => ({
      id: 'submit',
      label: i18n.translate(TRANSLATION_KEYS.plans.submit),
      onClick: context.config.handlers.onSubmit,
      position: 'right'
    })
  }
};
