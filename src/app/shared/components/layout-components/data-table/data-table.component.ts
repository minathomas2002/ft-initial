import { NgClass, NgTemplateOutlet } from "@angular/common";
import type { TemplateRef } from "@angular/core";
import {
  Component,
  computed,
  contentChild,
  input,
  model,
  output,
} from "@angular/core";
import { TableModule } from "primeng/table";
import type { IFilterBase, ITableHeaderItem } from "../../../interfaces";
import { EmptyRecordsComponent } from "../../utility-components/empty-records/empty-records.component";
import { PaginatorComponent } from "../../utility-components/paginator/paginator.component";
import { ESortingOrder } from "./../../../enums/sorting.enum";

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
})
export class DataTableComponent<T> {
  rowsCheckable = input<boolean>(false);
  itemsTemplate = contentChild.required<TemplateRef<unknown>>("itemsTemplate");
  columns = input.required<ITableHeaderItem<unknown>[]>();
  rows = input.required<T[]>();
  rowDataKey = input<string>("id");
  totalRecords = input.required<number>();
  isLoading = input<boolean>(false);
  filter = model.required<IFilterBase<unknown>>();
  showCheckBox = input<boolean>(false);
  ESortingOrder = ESortingOrder;
  selectedRows = model<T[]>();
  rowSelectable = input<(row: { data: T; index: number }) => boolean>(
    () => true,
  );
  scrollHeight = input<string>("");
  messageTitle = input<string>("No Data found");
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

  setSortingKey(key: string) {
    this.filter.update((res) => {
      const isSameKey = res.sortField === key;
      const newSortOrder = isSameKey
        ? res.sortOrder === ESortingOrder.asc
          ? ESortingOrder.desc
          : ESortingOrder.asc
        : ESortingOrder.asc;

      return {
        ...res,
        sortField: key,
        sortOrder: newSortOrder,
      };
    });
  }
}
