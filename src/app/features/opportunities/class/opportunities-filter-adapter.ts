import { IFilterAdapter, IUsersFilter, IUsersFilterRequest } from "src/app/shared/interfaces";
import { IOpportunitiesFilter, IOpportunitiesFilterRequest } from "src/app/shared/interfaces/opportunities.interface";

export class OpportunitiesFilterInterfaceAdapter
	implements IFilterAdapter<IOpportunitiesFilterRequest>
{
	filter!: IOpportunitiesFilter;
	constructor(filter: IOpportunitiesFilter) {
		this.filter = filter;
	}
	adaptFilter(): IOpportunitiesFilterRequest {
		return this.filter;
	}
}
