import { ChangeDetectionStrategy, Component, contentChild, inject, input, model, TemplateRef } from '@angular/core';
import { Paginator } from 'primeng/paginator';
import { PaginatorComponent } from '../../utility-components/paginator/paginator.component';
import { IFilterBase } from 'src/app/shared/interfaces';
import { EmptyRecordsComponent } from '../../utility-components/empty-records/empty-records.component';
import { NgTemplateOutlet } from '@angular/common';
import { TranslatePipe } from 'src/app/shared/pipes';
import { I18nService } from 'src/app/shared/services/i18n';

@Component({
  selector: 'app-data-cards',
  imports: [PaginatorComponent, EmptyRecordsComponent, NgTemplateOutlet],
  templateUrl: './data-cards.html',
  styleUrl: './data-cards.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DataCards {
  totalRecords = input.required<number>();
  itemsTemplate = contentChild.required<TemplateRef<unknown>>("itemsTemplate");
  items = input.required<unknown[]>();
  isLoading = input<boolean>(false);
  filter = model.required<IFilterBase<unknown>>();
  private readonly i18nService = inject(I18nService);
  messageTitle = input<string>(this.i18nService.translate('common.noDataFound'));
}
