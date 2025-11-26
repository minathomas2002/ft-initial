import { inject } from '@angular/core';
import { patchState, signalStore, withMethods, withState } from '@ngrx/signals';
import { finalize, tap } from 'rxjs';
import { InvestorsApiService } from '../../api/investors/investors-api-service';
import { IInvestorsFilterRequest, IInvestorRecord } from '../../interfaces';

interface InvestorsState {
  loading: boolean;
  error: string | null;
  count: number;
  list: IInvestorRecord[];
}

const initialState: InvestorsState = {
  loading: false,
  error: null,
  count: 0,
  list: [],
};

export const InvestorsStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withMethods((store) => {
    const investorsApiService = inject(InvestorsApiService);

    return {
      getInvestorsList(filter: IInvestorsFilterRequest) {
        patchState(store, { loading: true });
        return investorsApiService.getInvestorsList(filter).pipe(
          tap((res) => {
            const investors = res.body.data || [];
            const totalCount = res.body.pagination?.totalCount ?? investors.length;
            patchState(store, { list: investors, count: totalCount });
          }),
          finalize(() => {
            patchState(store, { loading: false });
          })
        );
      },
    };
  })
);

