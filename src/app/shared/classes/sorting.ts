import { ESortingOrder } from '../enums/sorting.enum';
import type { ISorting } from './../interfaces/filter.interface';
export class Sorting<T> implements ISorting<T> {
	constructor(
		public sortField: T | null = null,
		public sortOrder: ESortingOrder = ESortingOrder.desc,
	) {}
}
