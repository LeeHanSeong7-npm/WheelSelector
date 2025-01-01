import { SelectorItem } from "../types/SelectorItem";
import { SelectorOptions } from "../types/SelectorOptions";
import { Position } from "../types/Position";
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
		if (this.isActive === true) return;
		this.position = { x, y };
		this.redraw();
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
		removeCanvas(this.cursorCanvas!!);
		const { x, y } = this.position;
		this.cursorCanvas = makeCanvas(
			document,
			{ x, y },
			this.outerDistance * 2
		);
		drawItems(this.cursorCanvas!!, this);
	}
	updateItems(items: SelectorItem[]) {
		this.selectedItemNo = null;
		this.items = items;
		this.redraw();
		return this.items;
	}
}
