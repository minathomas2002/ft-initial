import { Component, contentChild, input, model, TemplateRef } from '@angular/core';
import { Paginator } from 'primeng/paginator';
import { PaginatorComponent } from '../../utility-components/paginator/paginator.component';
import { IFilterBase } from 'src/app/shared/interfaces';
import { EmptyRecordsComponent } from '../../utility-components/empty-records/empty-records.component';
import { NgTemplateOutlet } from '@angular/common';

@Component({
  selector: 'app-data-cards',
  imports: [PaginatorComponent, EmptyRecordsComponent, NgTemplateOutlet],
  templateUrl: './data-cards.html',
  styleUrl: './data-cards.scss',
})
export class DataCards {
  totalRecords = input.required<number>();
  itemsTemplate = contentChild.required<TemplateRef<unknown>>("itemsTemplate");
  items = input.required<unknown[]>();
  isLoading = input<boolean>(false);
  filter = model.required<IFilterBase<unknown>>();
  messageTitle = input<string>("No Data found");

}
