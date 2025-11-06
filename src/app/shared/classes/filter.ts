import type { IFilterBase, IFiltration } from '../interfaces';
export abstract class Filter<T extends IFilterBase<S>, S> implements IFiltration<T, S> {
	filter!: T;
	initialState!: T;

	abstract clearFilter(filter?: Partial<T>): void;
}
