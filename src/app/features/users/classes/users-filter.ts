import { Filter } from "src/app/shared/classes/filter";
import { Pagination } from "src/app/shared/classes/pagination";
import { Sorting } from "src/app/shared/classes/sorting";
import { ESortingOrder } from "src/app/shared/enums";
import { IUsersFilter, TUsersSortingKeys } from "src/app/shared/interfaces/users.interface";

export class UsersFilter extends Filter<
	IUsersFilter,
	TUsersSortingKeys
> {
	constructor() {
		super();
		const pagination = new Pagination(10);
		const sorting = new Sorting<TUsersSortingKeys>();
		sorting.sortField = 'joinDate';
		sorting.sortOrder = ESortingOrder.asc;
		this.filter = {
			...pagination,
			...sorting,
		};

		this.initialState = structuredClone(this.filter);
	}

	clearFilter(filter?: Partial<unknown>) {
		this.filter = structuredClone({
			...this.initialState,
			...(filter ? filter : {}),
		});
	}
}
