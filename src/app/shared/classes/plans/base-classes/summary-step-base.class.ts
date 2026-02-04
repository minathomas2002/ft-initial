import { ChangeDetectionStrategy, Component, computed, inject, output } from "@angular/core";
import { FormGroup } from "@angular/forms";
import { EPlanPageTitle } from "src/app/shared/enums";
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
    let stepComment = this.stepComments();
    let persona = 'Your Comment';
    if (!this.planStore.currentUserPageComments().includes(this.pageTitleForTL as EPlanPageTitle)) {
      const commentRole = stepComment?.creatorRole ?? this.planStore.planComments()?.creatorRole;
      persona = this.planStore.getCommentPersonaByRole()(commentRole);
    }
    // Use the per-comment creatorRole if available, otherwise fallback to global
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
