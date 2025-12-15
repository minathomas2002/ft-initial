import { ChangeDetectionStrategy, Component, inject, model, signal } from "@angular/core";
import { BaseWizardDialog } from "../../base-components/base-wizard-dialog/base-wizard-dialog";
import { Step01OverviewCompanyInformationForm } from "../overviewCompanyInformation/step-01-overviewCompanyInformationForm";
import { Step02ProductPlantOverviewForm } from "../productPlantOverview/step-02-productPlantOverviewForm";
import { ValueChainForm } from "../valueChain/valueChainForm";
import { SaudizationForm } from "../saudization/saudizationForm";
import { ButtonModule } from "primeng/button";
import { BaseTagComponent } from "../../base-components/base-tag/base-tag.component";
import { StepContentDirective } from "src/app/shared/directives";
import { ProductPlanFormService } from "src/app/shared/services/plan/materials-form-service/product-plan-form-service";
import { IWizardStepState } from "src/app/shared/interfaces/wizard-state.interface";

@Component({
  selector: 'app-product-localization-plan-wizard',
  imports: [
    BaseWizardDialog,
    Step01OverviewCompanyInformationForm,
    Step02ProductPlantOverviewForm,
    ValueChainForm,
    SaudizationForm,
    ButtonModule,
    BaseTagComponent,
    StepContentDirective
  ],
  templateUrl: './product-localization-plan-wizard.html',
  styleUrl: './product-localization-plan-wizard.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductLocalizationPlanWizard {
  productPlanFormService = inject(ProductPlanFormService);
  visibility = model(false);
  activeStep = signal<number>(1);
  steps = signal<IWizardStepState[]>([
    {
      title: 'Overview & Company Information',
      description: 'Enter basic plan details and company information',
      isActive: true,
      formState: this.productPlanFormService.overviewCompanyInformation
    },
    {
      title: 'Product & Plant Overview',
      description: 'Enter product details and plant information',
      isActive: false,
      formState: this.productPlanFormService.step2_productPlantOverview
    },
    {
      title: 'Value Chain',
      description: 'Define value chain components and localization',
      isActive: false,
      formState: this.productPlanFormService.step3_valueChain
    },
    {
      title: 'Saudization',
      description: 'Enter saudization projections and attachments',
      isActive: false,
      formState: this.productPlanFormService.step4_saudization
    }
  ]);
  wizardTitle = signal('Product Localization Plan'); // TODO: Translate
  isLoading = signal(false);
  isProcessing = signal(false);

  previousStep(): void {
  }
  nextStep(): void { }

  saveAsDraft(): void { }
}
