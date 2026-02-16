import { inject, Signal, computed } from "@angular/core";
import { IBaseWizardAction } from "src/app/shared/components/base-components/base-wizard-actions/base-wizard-actions";
import { ERoles } from "src/app/shared/enums";
import { EInternalUserPlanStatus, EInvestorPlanStatus } from "src/app/shared/interfaces";
import { I18nService } from "src/app/shared/services/i18n";
import { RoleService } from "src/app/shared/services/role/role-service";
import { IWizardActionConfig, ActionContext, INVESTOR_REJECTION_STATUSES, INTERNAL_REJECTION_STATUSES } from "src/app/shared/services/wizard/wizard-action.model";
import { WIZARD_BUTTONS } from "src/app/shared/services/wizard/wizard-actions-config";

export class WizardActionFactory {
  private readonly i18nService = inject(I18nService);
  private readonly roleService = inject(RoleService)

  generateActions(config: IWizardActionConfig): Signal<IBaseWizardAction[]> {
    return computed(() => {
      const context = this.createActionContext(config);

      return Object.values(WIZARD_BUTTONS)
        .filter(button => button.shouldShow(context))
        .map(button => button.build(context, this.i18nService));
    });
  }

  private createActionContext(config: IWizardActionConfig): ActionContext {
    const activeStep = config.state.activeStep();
    const totalSteps = config.state.totalSteps();
    const status = config.metadata?.status?.() ?? null;

    return {
      config,
      mode: config.state.mode(),
      activeStep,
      totalSteps,
      isFirstStep: activeStep === 1,
      isFinalStep: activeStep === totalSteps,
      isLoading: config.state.isLoading?.() ?? false,
      isProcessing: config.state.isProcessing?.() ?? false,
      isSavingAsDraft: config.state.isSavingAsDraft?.() ?? false,
      isPlanWizard:
        config.context === 'product-plan' ||
        config.context === 'service-plan',
      isPlanRejectedFromManager:
      this.roleService.hasAnyRoleSignal([ERoles.INVESTOR])()
           ? INVESTOR_REJECTION_STATUSES.includes(status as EInvestorPlanStatus)
           : INTERNAL_REJECTION_STATUSES.includes(status as EInternalUserPlanStatus),
      status,
      currentLanguage: this.i18nService.currentLanguage(),
    };
  }
}

