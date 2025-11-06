import { IFilterAdapter, IUsersFilter, IUsersFilterRequest } from "src/app/shared/interfaces";

export class UsersFilterInterfaceAdapter
	implements IFilterAdapter<IUsersFilterRequest>
{
	filter!: IUsersFilter;
	constructor(filter: IUsersFilter) {
		this.filter = filter;
	}
	adaptFilter(): IUsersFilterRequest {
		return {
			userNameEmailId:this.filter.userNameEmailId,
			userTitleId:this.filter.userTitleId??[],
		};
	}
}
