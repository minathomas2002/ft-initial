import { Filter } from "src/app/shared/classes/filter";
import { Pagination } from "src/app/shared/classes/pagination";
import { Sorting } from "src/app/shared/classes/sorting";
import { ESortingOrder } from "src/app/shared/enums";
import { ISystemEmployeeFilter, TSystemEmployeeSortingKeys } from "src/app/shared/interfaces";

export class EmployeesFilter extends Filter<
	ISystemEmployeeFilter,
	TSystemEmployeeSortingKeys
> {
	constructor() {
		super();
		const pagination = new Pagination(10);
		const sorting = new Sorting<TSystemEmployeeSortingKeys>();
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
