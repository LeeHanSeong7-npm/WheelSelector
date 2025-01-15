import { SelectorItem } from "../types/SelectorItem";
import { SelectorOptions } from "../types/SelectorOptions";
import { Position } from "../types/Position";
import { Theme } from "../types/ThemeOptions";
import {
	makeCanvas,
	removeCanvas,
	drawItems,
	drawCancelButton,
} from "../util/canvas";

export class WheelSelector {
	isActive: Boolean = false;
	isLeftClicked: Boolean = false;
	position: Position | null = null;
	items: SelectorItem[] = [];
	selectedItemNo: number | null = null;
	outerDistance: number = 200;
	innerDistance: number = 100;
	cursorCanvas: HTMLCanvasElement | null = null;
	theme: Theme = {
		defaultColor: "rgba(0, 0, 0, 0.7)",
		selectedColor: "rgba(125, 220, 0, 0.7)",
	};

	constructor(options?: SelectorOptions) {
		if (options !== undefined) {
			let { outerDistance, innerDistance } = options;
			if (outerDistance === undefined) {
				if (innerDistance !== undefined)
					throw new Error("give outerDistance value");
				else {
					outerDistance = this.outerDistance;
					innerDistance = this.innerDistance;
				}
			} else {
				if (innerDistance === undefined) {
					innerDistance = outerDistance / 2;
				} else if (innerDistance >= outerDistance) {
					throw new Error(
						"innerDistance should be smaller than outerDistance"
					);
				}
			}
			options.outerDistance = outerDistance;
			options.innerDistance = innerDistance;

			let { theme } = options;
			if (theme) {
				Object.assign(this.theme, theme);
			}
		}
		options = Object.assign(
			{
				items: [],
			},
			options
		);
		this.updateItems(options.items ?? []);
		this.outerDistance = options.outerDistance!!;
		this.innerDistance = options.innerDistance!!;
	}
	activateSelector(pos: Position) {
		this.position = pos;
		WheelSelector.prototype.deactivateSelector.call(this);
		this.cursorCanvas = makeCanvas(this.position, this.outerDistance * 2);
		this.redraw();
		this.isActive = true;
	}
	deactivateSelector() {
		if (this.cursorCanvas !== null) removeCanvas(this.cursorCanvas);
		this.isActive = false;
	}
	triggerSelected() {
		if (this.selectedItemNo === null) return;
		const item = this.items[this.selectedItemNo];
		this.selectedItemNo = null;
		item.callback();
	}
	redraw() {
		if (this.position === null) return;
		if (this.items.length === 0) return;
		drawItems(this.cursorCanvas!!, this, [drawCancelButton]);
	}
	selectItem(itemno: number | null) {
		if (itemno !== null && this.items[itemno] === undefined)
			throw Error("invalid item number");
		this.selectedItemNo = itemno;
		this.redraw();
	}
	updateItems(items?: SelectorItem[]) {
		this.selectedItemNo = null;
		this.items = items ? items : [];
		this.redraw();
		return this.items;
	}
}
