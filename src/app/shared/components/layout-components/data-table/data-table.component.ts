import { NgClass, NgTemplateOutlet } from "@angular/common";
import type { TemplateRef } from "@angular/core";
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  contentChild,
  inject,
  input,
  model,
  output,
} from "@angular/core";
import { TableModule } from "primeng/table";
import type { IFilterBase, ITableHeaderItem } from "../../../interfaces";
import { EmptyRecordsComponent } from "../../utility-components/empty-records/empty-records.component";
import { PaginatorComponent } from "../../utility-components/paginator/paginator.component";
import { ESortingOrder } from "./../../../enums/sorting.enum";
import { I18nService } from "src/app/shared/services/i18n";

@Component({
  selector: "app-data-table",
  imports: [
    TableModule,
    NgTemplateOutlet,
    PaginatorComponent,
    NgClass,
    EmptyRecordsComponent,
  ],
  templateUrl: "./data-table.component.html",
  styleUrl: "./data-table.component.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DataTableComponent<T> {
  private readonly i18nService = inject(I18nService);

  rowsCheckable = input<boolean>(false);
  itemsTemplate = contentChild.required<TemplateRef<unknown>>("itemsTemplate");
  columns = input.required<ITableHeaderItem<unknown>[]>();
  rows = input.required<T[]>();
  rowDataKey = input<string>("id");
  totalRecords = input.required<number>();
  isLoading = input<boolean>(false);
  hasPaginator = input<boolean>(true);
  filter = model.required<IFilterBase<unknown>>();
  showCheckBox = input<boolean>(false);
  ESortingOrder = ESortingOrder;
  selectedRows = model<T[]>();
  rowSelectable = input<(row: { data: T; index: number }) => boolean>(
    () => true,
  );
  scrollHeight = input<string>("");
  messageTitle = input<string>(this.i18nService.translate('common.noDataFound'));
  onRowClick = output<{ item: T | unknown; rowIndex: number }>();
  disabledRows = computed(() => {
    return this.rows().map(
      (item, index) => !this.rowSelectable()({ data: item, index: index }),
    );
  });

  getRowIndex(index: number) {
    return (
      (this.filter()?.pageNumber - 1) * this.filter()?.pageSize + index + 1
    );
  }

  /**
   * Cycles through 3 phases: asc -> desc -> no sorting (default)
   */
  setSortingKey(column: ITableHeaderItem<unknown>) {
    if (!column.isSortable) return;

    const key = column.sortingKey;
    this.filter.update((res) => {
      const isSameKey = res.sortField === key;

      if (!isSameKey) {
        return { ...res, sortField: key, sortOrder: ESortingOrder.asc };
      }

      if (res.sortOrder === ESortingOrder.asc) {
        return { ...res, sortField: key, sortOrder: ESortingOrder.desc };
      }

      return { ...res, sortField: null, sortOrder: ESortingOrder.desc };
    });
  }
}
