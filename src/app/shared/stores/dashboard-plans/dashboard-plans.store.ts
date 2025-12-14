import { inject } from '@angular/core';
import { patchState, signalStore, withMethods, withState } from '@ngrx/signals';
import { finalize, tap } from 'rxjs';
import { DashboardPlansApiService } from '../../api/dashboard-plans/dashboard-plans-api-service';
import { IPlanFilterRequest, IPlanRecord, IPlansDashboardResponse, IPlansDashboardStatistics } from '../../interfaces';

interface DashboardPlansState {
  loading: boolean;
  error: string | null;
  count: number;
  list: IPlanRecord[];
  statistics: IPlansDashboardStatistics | null;
}

const initialState: DashboardPlansState = {
  loading: false,
  error: null,
  count: 0,
  list: [],
  statistics: null,
};

export const DashboardPlansStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withMethods((store) => {
    const dashboardPlansApiService = inject(DashboardPlansApiService);

    return {
      getInvestorDashboardPlans(filter: IPlanFilterRequest) {
        patchState(store, { loading: true });
        return dashboardPlansApiService.getInvestorDashboardPlans(filter).pipe(
          tap((res) => {
            const plans = res.body.data || [];
            const totalCount = res.body.pagination?.totalCount ?? plans.length;
            patchState(store, { list: plans, count: totalCount });
            patchState(store, { statistics: res.body.counts });
          }),
          finalize(() => {
            patchState(store, { loading: false });
          })
        );
      }
    };
  })
);

