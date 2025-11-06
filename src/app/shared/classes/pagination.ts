import type { IPagination } from '../interfaces';

export class Pagination implements IPagination {
	pageSize: number;
	pageNumber: number;
	constructor(pageSize = 16, pageNumber = 1) {
		this.pageSize = pageSize;
		this.pageNumber = pageNumber;
	}
}
