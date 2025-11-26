import {
  IFilterAdapter,
  IInvestorsFilter,
  IInvestorsFilterRequest,
} from 'src/app/shared/interfaces';

export class InvestorFilterInterfaceAdapter implements IFilterAdapter<IInvestorsFilter> {
  filter!: IInvestorsFilter;
  constructor(filter: IInvestorsFilter) {
    this.filter = filter;
  }
  adaptFilter(): IInvestorsFilterRequest {
    var filter = this.filter;
    return {
      ...filter,
      joinDateFrom: filter.joinDate?.[0]?.toLocaleDateString('en-CA'),
      joinDateTo: filter.joinDate?.[1]?.toLocaleDateString('en-CA'),
    };
  }
}
