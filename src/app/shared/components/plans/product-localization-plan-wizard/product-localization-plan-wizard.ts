import { ChangeDetectionStrategy, Component, computed, inject, model, OnDestroy, signal } from "@angular/core";
import { BaseWizardDialog } from "../../base-components/base-wizard-dialog/base-wizard-dialog";
import { Step01OverviewCompanyInformationForm } from "../step-01-overviewCompanyInformation/step-01-overviewCompanyInformationForm";
import { Step02ProductPlantOverviewForm } from "../step-02-productPlantOverview/step-02-productPlantOverviewForm";
import { Step03ValueChainForm } from "../step-03-valueChain/step-03-valueChainForm";
import { Step04SaudizationForm } from "../step-04-saudization/step-04-saudizationForm";
import { ButtonModule } from "primeng/button";
import { BaseTagComponent } from "../../base-components/base-tag/base-tag.component";
import { StepContentDirective } from "src/app/shared/directives";
import { ProductPlanFormService } from "src/app/shared/services/plan/materials-form-service/product-plan-form-service";
import { IWizardStepState } from "src/app/shared/interfaces/wizard-state.interface";
import { PlanStore } from "src/app/shared/stores/plan/plan.store";
import { mapProductLocalizationPlanFormToRequest, convertRequestToFormData } from "src/app/shared/utils/product-localization-plan.mapper";
import { DestroyRef } from "@angular/core";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { ToasterService } from "src/app/shared/services/toaster/toaster.service";

@Component({
  selector: 'app-product-localization-plan-wizard',
  imports: [
    BaseWizardDialog,
    Step01OverviewCompanyInformationForm,
    Step02ProductPlantOverviewForm,
    Step03ValueChainForm,
    Step04SaudizationForm,
    ButtonModule,
    BaseTagComponent,
    StepContentDirective
  ],
  templateUrl: './product-localization-plan-wizard.html',
  styleUrl: './product-localization-plan-wizard.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductLocalizationPlanWizard implements OnDestroy {
  productPlanFormService = inject(ProductPlanFormService);
  toasterService = inject(ToasterService);
  planStore = inject(PlanStore);
  destroyRef = inject(DestroyRef);
  visibility = model(false);
  activeStep = signal<number>(1);
  steps = computed<IWizardStepState[]>(() => [
    {
      title: 'Overview & Company Information',
      description: 'Enter basic plan details and company information',
      isActive: this.activeStep() === 1,
      formState: this.productPlanFormService.overviewCompanyInformation
    },
    {
      title: 'Product & Plant Overview',
      description: 'Enter product details and plant information',
      isActive: this.activeStep() === 2,
      formState: this.productPlanFormService.step2_productPlantOverview
    },
    {
      title: 'Value Chain',
      description: 'Define value chain components and localization',
      isActive: this.activeStep() === 3,
      formState: this.productPlanFormService.step3_valueChain
    },
    {
      title: 'Saudization',
      description: 'Enter saudization projections and attachments',
      isActive: this.activeStep() === 4,
      formState: this.productPlanFormService.step4_saudization
    }
  ]);
  wizardTitle = signal('Product Localization Plan'); // TODO: Translate
  isLoading = signal(false);
  isProcessing = signal(false);

  previousStep(): void {
    this.activeStep.set(this.activeStep() - 1);
  }
  nextStep(): void {
    this.activeStep.set(this.activeStep() + 1);
  }

  saveAsDraft(): void {
    // Map form values to request structure
    const request = mapProductLocalizationPlanFormToRequest(this.productPlanFormService);

    // Convert request to FormData
    const formData = convertRequestToFormData(request);

    // Call store method to save as draft
    this.planStore.saveAsDraftProductLocalizationPlan(formData)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.toasterService.success('Product localization plan saved as draft successfully');
        },
        error: (error) => {
          this.isProcessing.set(false);
          // TODO: Show error message
          console.error('Error saving draft:', error);
        }
      });
  }


  ngOnDestroy(): void {
    // TODO: Reset the whole from
  }
}
