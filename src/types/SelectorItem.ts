export interface SelectorItem {
	name: string;
	callback: (item: SelectorItem) => void;
	payload?: any;
}
