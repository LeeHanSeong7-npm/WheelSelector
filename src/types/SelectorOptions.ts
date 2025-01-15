import { SelectorItem } from "./SelectorItem";
import { Theme } from "./ThemeOptions";

export interface SelectorOptions {
	items?: SelectorItem[];
	outerDistance?: number;
	innerDistance?: number;
	theme?: Theme;
}

export interface MouseSelectorOptions extends SelectorOptions {
	activateKey?: string | null;
}
