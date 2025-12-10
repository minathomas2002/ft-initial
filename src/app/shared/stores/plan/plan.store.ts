import { inject } from "@angular/core";
import { OpportunitiesApiService } from "../../api/opportunities/opportunities-api-service";
import { EOpportunityType } from "../../enums";
import { patchState, signalStore, withMethods, withState } from '@ngrx/signals';
import { ISelectItem } from "../../interfaces";
import { finalize, take } from "rxjs";

const initialState: {
  newPlanOpportunityType: EOpportunityType | null,
  isPresetSelected: boolean,
  newPlanTitle: string,
  availableOpportunities: ISelectItem[] | null,
  isLoadingAvailableOpportunities: boolean,
} = {
  newPlanOpportunityType: null,
  isPresetSelected: false,
  newPlanTitle: '',
  availableOpportunities: [],
  isLoadingAvailableOpportunities: false,
}

export const PlanStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withMethods((store) => {
    return {
      setNewPlanOpportunityType(opportunityType: EOpportunityType): void {
        patchState(store, { newPlanOpportunityType: opportunityType });
      },
      resetNewPlanOpportunityType(): void {
        patchState(store, { newPlanOpportunityType: null });
      },
      setIsPresetSelected(isPresetSelected: boolean): void {
        patchState(store, { isPresetSelected });
      },
      resetIsPresetSelected(): void {
        patchState(store, { isPresetSelected: false });
      },
      setNewPlanTitle(newPlanTitle: string): void {
        patchState(store, { newPlanTitle });
      },
      resetNewPlanTitle(): void {
        patchState(store, { newPlanTitle: '' });
      }
    }
  }),
  withMethods((store) => {
    const opportunitiesApiService = inject(OpportunitiesApiService);
    return {
      getActiveOpportunityLookUps(): void {
        if (!store.newPlanOpportunityType()) return;
        patchState(store, { isLoadingAvailableOpportunities: true });
        opportunitiesApiService.getActiveOpportunityLookUps(store.newPlanOpportunityType()!)
          .pipe(
            finalize(() => patchState(store, { isLoadingAvailableOpportunities: false })),
            take(1)
          )
          .subscribe((response) => {
            patchState(store, { availableOpportunities: response.body });
          });
      }
    }
  }),
  withMethods((store) => {
    return {
      savePlanBasicData(opportunityType: EOpportunityType, title: string): void {
        store.setNewPlanOpportunityType(opportunityType);
        store.setNewPlanTitle(title);
      }
    }
  })
)