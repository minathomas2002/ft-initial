export interface IActionMenuItem<T, K> {
	label: string;
	key: K;
	command?: (item: T) => void;
}
