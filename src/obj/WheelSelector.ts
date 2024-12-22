import { SelectorItem } from "../types/SelectorItem";
import { SelectorOptions } from "../types/SelectorOptions";
import { Position } from "../types/Position";
import {
	disableIframePointerEvents,
	restoreIframePointerEvents,
} from "../util/iframe";
import { makeCanvas, removeCanvas, drawItems } from "../util/canvas";

export class WheelSelector {
	isActive: Boolean = false;
	isLeftClicked: Boolean = false;
	items: SelectorItem[] = [];
	clickedMousePos: Position | null = null;
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
		this.clickedMousePos = { x, y };
		this.cursorCanvas = makeCanvas(
			document,
			{ x, y },
			this.outerDistance * 2
		);
		disableIframePointerEvents(document);
		drawItems(
			this.cursorCanvas!!,
			this.innerDistance,
			this.outerDistance,
			this.items
		);
		this.isActive = true;
	}
	deactivateSelector() {
		this.clickedMousePos = null;
		removeCanvas(this.cursorCanvas!!);
		restoreIframePointerEvents(document);
		this.isActive = false;
	}
	selectItem(itemNo: number) {
		this.selectedItemNo = itemNo;
	}
	updateItems(items: SelectorItem[]) {
		this.selectedItemNo = null;
		this.items = items;
		return this.items;
	}
}
