export interface ITableHeaderItem<T> {
	label: string;
	isSortable: boolean;
	sortingKey?: T;
}
