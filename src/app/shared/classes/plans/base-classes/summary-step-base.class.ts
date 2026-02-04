import { ChangeDetectionStrategy, Component, computed, inject, input, output } from "@angular/core";
import { FormGroup } from "@angular/forms";
import { ECommentType, EMaterialsFormControls } from "src/app/shared/enums";
import { IFieldInformation, IPageComment } from "src/app/shared/interfaces/plans.interface";
import { I18nService } from "src/app/shared/services/i18n";
import { PlanStore } from "src/app/shared/stores/plan/plan.store";

@Component({
  selector: 'app-summary-step-base',
  template: '',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export abstract class SummaryStepBaseClass {
  protected readonly planStore = inject(PlanStore);
  protected readonly i18nService = inject(I18nService);

  /* abstract properties */
  protected abstract readonly pageTitleForTL: string
  protected abstract readonly formGroup: FormGroup;

  /* Signals */
  stepComments = computed<IPageComment | undefined>(() => this.planStore.planComments()?.comments
    .find(comment => comment.pageTitleForTL === this.pageTitleForTL));

  commentForPage = computed(() => {
    const stepComment = this.stepComments();
    // Use the per-comment creatorRole if available, otherwise fallback to global
    const commentRole = stepComment?.creatorRole ?? this.planStore.planComments()?.creatorRole;
    const persona = this.planStore.getCommentPersonaByRole()(commentRole);
    return {
      title: persona || 'No Persona Found',
      text: stepComment?.comment
    }
  });

  isViewMode = computed(() => this.planStore.wizardMode() === 'view');

  /* Outputs */
  onEdit = output<void>();

  /* Methods */
  protected getSectionSummaryFields(section: string): IFieldInformation[] {
    return this.stepComments()?.fields.filter(field => field.section === section) ?? [];
  }
}
