import { ChangeDetectionStrategy, Component, computed, inject, input, output } from "@angular/core";
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

  /**
   * When provided by the wizard (selectedInputs.length for this step), used as the step comment count
   * so summary reflects current selection instead of plan store (store is not updated when user fixes inputs).
   */
  readonly stepCommentCountFromWizard = input<number | undefined>(undefined);

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

  // /** Fallback count from plan store when wizard does not pass stepCommentCountFromWizard. */
  // private stepCommentCountFromStore = computed(() => {
  //   const comments = this.planStore.planComments()?.comments ?? [];
  //   const forPage = comments.filter(c => c.pageTitleForTL === this.pageTitleForTL);
  //   return forPage.reduce((sum, c) => sum + (c.fields?.length ?? 0), 0);
  // });

  // /** Comment count: from wizard (selected inputs length) when provided, else from store. */
  // stepCommentCount = computed(() => this.stepCommentCountFromWizard() ?? this.stepCommentCountFromStore());

  // /** True when this step has at least one commented/selected field. */
  // stepHasComments = computed(() => this.stepCommentCount() > 0);

  // /** In resubmit mode, true when no selected/commented fields left (all fixed). */
  // allStepFieldsFixed = computed(() =>
  //   this.planStore.wizardMode() === 'resubmit' && this.stepCommentCount() === 0
  // );

  // /** Show comment box only when step has comments, has text, and not all fields fixed in resubmit. */
  // shouldShowCommentBox = computed(() =>
  //   this.stepHasComments() &&
  //   !!this.commentForPage().text &&
  //   !this.allStepFieldsFixed()
  // );

  /** True in resubmit mode when the current user (employee) added comments on this page – hide comment icons. */
  isEmployeeCommentPage = computed(() =>
    this.planStore.wizardMode() === 'resubmit' &&
    this.planStore.currentUserPageComments().includes(this.pageTitleForTL as EPlanPageTitle)
  );

  isViewMode = computed(() => this.planStore.wizardMode() === 'view');

  /* Outputs */
  onEdit = output<void>();

  /* Methods */
  protected getSectionSummaryFields(section: string): IFieldInformation[] {
    return this.stepComments()?.fields.filter(field => field.section === section) ?? [];
  }
}
