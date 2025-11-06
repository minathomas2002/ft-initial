import { filter } from 'rxjs/operators';
import {
	Component,
	input,
	model,
	computed,
	viewChild,
	effect,
	OnChanges,
	SimpleChanges,
} from '@angular/core';
import { PaginatorModule } from 'primeng/paginator';
import type { PaginatorState } from 'primeng/paginator';
import type { IFilterBase } from '../../../interfaces';
import { ButtonModule } from 'primeng/button';
import type { Paginator } from 'primeng/paginator';
@Component({
	selector: 'app-paginator',
	imports: [PaginatorModule, ButtonModule],
	templateUrl: './paginator.component.html',
	styleUrl: './paginator.component.scss',
})
export class PaginatorComponent {
	paginator = viewChild<Paginator>('paginator');
	filter = model.required<IFilterBase<unknown>>();
	totalRecords = input.required<number>();
	maxPageLinkNumber = computed(() => {
		return Math.ceil(this.totalRecords() / this.filter().pageSize) || 1;
	});
	nextIsDisabled = computed(() => {
		return this.filter().pageNumber >= this.maxPageLinkNumber();
	});
	prevIsDisabled = computed(() => {
		return this.filter().pageNumber <= 1;
	});

	first = computed(() => {
		const first = (this.filter().pageNumber - 1) * this.filter().pageSize;
		return first;
	});
	goToPage(pageNumber: number) {
		this.paginator()?.changePage(pageNumber - 1);
	}

	pageChanged(event: PaginatorState) {
		this.filter.update((state) => ({
			...state,
			pageSize: Number(event.rows),
			pageNumber: Number(event.page) + 1,
		}));
	}
}
