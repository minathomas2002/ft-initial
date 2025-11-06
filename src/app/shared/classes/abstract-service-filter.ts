import type { Signal, WritableSignal } from "@angular/core";
import { type Observable, Subject, switchMap, take } from "rxjs";
import type { IFilterBase } from "../interfaces";
import type { Filter } from "./filter";

export abstract class AbstractServiceFilter<
	IFilter extends IFilterBase<unknown>,
> {
	abstract filterClass: Filter<IFilter, unknown>;
	abstract filter: WritableSignal<IFilter>;
	abstract showClearAll: Signal<boolean>;

	abstract clearAllFilters(): void;
	abstract applyFilterWithPaging(): void;
	abstract performFilter$(): Observable<unknown>;

	private filterSubject = new Subject<void>();

	constructor() {
		this.initializeFilterSubscription();
	}

	clearAll(filter?: Partial<IFilter>) {
		this.filterClass.clearFilter(filter);
		this.filter.update((val) => structuredClone(this.filterClass.filter));
	}

	updateFilterSignal(filter?: Partial<IFilter> | undefined): void {
		this.filter.update((val) => ({ ...structuredClone(val), ...filter }));
	}

	resetPagination() {
		this.filter.update((val) => ({ ...val, pageNumber: 1 }));
	}

	applyFilter() {
		this.resetPagination();
		this.filterSubject.next();
	}

	private initializeFilterSubscription() {
		this.filterSubject
			.pipe(switchMap(() => this.performFilter$().pipe(take(1))))
			.subscribe();
	}
}
