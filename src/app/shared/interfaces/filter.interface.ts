import { ESortingOrder } from "../enums";


export interface IPagination {
	pageSize: number;
	pageNumber: number;
}

export interface ISorting<T> {
	sortField: T | null;
	sortOrder: ESortingOrder;
}

export interface IFiltration<T extends IFilterBase<S>, S> {
	filter: T;
	initialState: T;
	clearFilter(filter: T): void;
}

export interface IFilterBase<T> extends IPagination, ISorting<T> {}
