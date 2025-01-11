import { SelectorItem } from "../types/SelectorItem";
import { SelectorOptions } from "../types/SelectorOptions";
import { Position } from "../types/Position";
import { Theme } from "../types/ThemeOptions";
import { makeCanvas, removeCanvas, drawItems } from "../util/canvas";

export class WheelSelector {
	isActive: Boolean = false;
	isLeftClicked: Boolean = false;
	position: Position | null = null;
	items: SelectorItem[] = [];
	selectedItemNo: number | null = null;
	outerDistance: number = 0;
	innerDistance: number = 0;
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
					outerDistance = 200;
					innerDistance = 100;
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
	activateSelector(x: number, y: number) {
		WheelSelector.prototype.deactivateSelector.call(this);
		this.position = { x, y };
		this.cursorCanvas = makeCanvas({ x, y }, this.outerDistance * 2);
		drawItems(this.cursorCanvas!!, this);
		this.isActive = true;
	}
	deactivateSelector() {
		removeCanvas(this.cursorCanvas!!);
		this.position = null;
		this.isActive = false;
	}
	triggerSelected = () => {
		if (this.selectedItemNo === null) return;
		const item = this.items[this.selectedItemNo];
		this.selectedItemNo = null;
		item.callback();
	};
	redraw() {
		if (this.position === null) return;
		const { x, y } = this.position;
		this.activateSelector(x, y);
	}
	updateItems(items: SelectorItem[]) {
		this.selectedItemNo = null;
		this.items = items;
		return this.items;
	}
}
