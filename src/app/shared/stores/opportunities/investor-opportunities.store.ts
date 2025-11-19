import { patchState, signalStore, withComputed, withMethods, withState } from '@ngrx/signals';
import { inject } from '@angular/core';
import { catchError, finalize, tap, throwError } from 'rxjs';
import { OpportunitiesApiService } from '../../api/opportunities/opportunities-api-service';
import {
  IOpportunitiesFilterRequest,
  IOpportunityRecord,
} from '../../interfaces/opportunities.interface';
import { AuthStore } from '../auth/auth.store';
import { IInvestorOpportunitiesFilterRequest, IInvestorOpportunity } from '../../interfaces';

const initialState: {
  loading: boolean;
  error: string | null;
  count: number;
  list: IInvestorOpportunity[];
} = {
  loading: false,
  error: null,
  count: 0,
  list: [],
};
export const InvestorOpportunitiesStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withMethods((store) => {
    const opportunitiesApiService = inject(OpportunitiesApiService);
    return {
      getInvestorOpportunities(filter: IInvestorOpportunitiesFilterRequest) {
        patchState(store, { loading: true });
        return opportunitiesApiService.getInvestorOpportunities(filter).pipe(
          tap((res) => {
            const opportunities = res.body.data || [];
            const totalCount = res.body.pagination?.totalCount ?? 0;
            patchState(store, { list: opportunities, count: totalCount });
          }),
          finalize(() => {
            patchState(store, { loading: false });
          })
        )
      }
    };
  })
);
