import {
	ChangeDetectionStrategy,
	Component,
	input,
	model,
	computed,
	viewChild,
	inject,

} from '@angular/core';
import { PaginatorModule } from 'primeng/paginator';
import type { PaginatorState } from 'primeng/paginator';
import type { IFilterBase } from '../../../interfaces';
import { ButtonModule } from 'primeng/button';
import type { Paginator } from 'primeng/paginator';
import { I18nService } from '../../../services/i18n/i18n.service';
import { TranslatePipe } from '../../../pipes';
@Component({
	selector: 'app-paginator',
	imports: [PaginatorModule, ButtonModule, TranslatePipe],
	templateUrl: './paginator.component.html',
	styleUrl: './paginator.component.scss',
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PaginatorComponent {
	private readonly i18nService = inject(I18nService);
	paginator = viewChild<Paginator>('paginator');
	filter = model.required<IFilterBase<unknown>>();
	totalRecords = input.required<number>();

	private readonly isRtl = computed(() => this.i18nService.currentLanguage() === 'ar');

	/** LTR: arrow-left. RTL: arrow-right (back = toward start) */
	prevIcon = computed(() => (this.isRtl() ? 'icon-arrow-right' : 'icon-arrow-left'));
	/** LTR: arrow-right. RTL: arrow-left (forward = toward end) */
	nextIcon = computed(() => (this.isRtl() ? 'icon-arrow-left' : 'icon-arrow-right'));
	/** LTR: icon before text. RTL: icon after text (swap) */
	prevIconPos = computed(() => (this.isRtl() ? 'right' : 'left'));
	/** LTR: icon after text. RTL: icon before text (swap) */
	nextIconPos = computed(() => (this.isRtl() ? 'left' : 'right'));

	paginatorTemplate = computed(() => this.i18nService.translate('common.paginatorTemplate'));
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
