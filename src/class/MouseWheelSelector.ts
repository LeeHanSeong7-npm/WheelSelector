import { SelectorOptions } from "../types/SelectorOptions";
import { WheelSelector } from "./WheelSelector";
import {
	disableIframePointerEvents,
	restoreIframePointerEvents,
} from "../util/iframe";
import { drawItems } from "../util/canvas";

export class MouseWheelSelector extends WheelSelector {
	ownerDocument: Document | null = null;
	eventHandlers = {
		mousedown: (event: MouseEvent) => {
			if (event.button === 0) this.isLeftClicked = true;
			if (event.button === 2 && this.isLeftClicked) {
				event.preventDefault();
				this.activateSelector(event.clientX, event.clientY);
			}
		},
		mousemove: (event: MouseEvent) => {
			if (this.position !== null) {
				const preSelected = this.selectedItemNo;
				this.selectedItemNo = this.checkSelected(
					this.calculLine(event.clientX, event.clientY)
				);
				if (preSelected !== this.selectedItemNo) {
					drawItems(this.cursorCanvas!!, this);
				}
			}
		},
		mouseup: (event: MouseEvent) => {
			if (event.button === 0) this.isLeftClicked = false;

			this.deactivateSelector();
		},
		//touchstart: (event: TouchEvent) => {},
		//touchend: (event: TouchEvent) => {},
		contextmenu: (event: MouseEvent) => {
			if (this.isLeftClicked === true) event.preventDefault();
		},
	};
	constructor(document: Document, options?: SelectorOptions) {
		super(options);
		this.ownerDocument = document;
		this.addMouseEvents();
	}

	activateSelector(x: number, y: number) {
		disableIframePointerEvents(document);
		super.activateSelector(x, y);
	}
	calculLine(
		ex: number,
		ey: number
	): {
		angle: number;
		length: number;
	} {
		const { x, y } = this.position!!;
		const [dx, dy] = [ex - x, ey - y];
		const angle = Math.atan2(dy, dx);
		const length = Math.sqrt(dy * dy + dx * dx);
		return {
			angle,
			length,
		};
	}
	checkSelected({
		angle,
		length,
	}: {
		angle: number;
		length: number;
	}): number | null {
		if (length < this.innerDistance)
			// || length > this.outerDistance * 2)
			return null;

		const normalizedAngle =
			((angle % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI);

		let startAngle = 0;
		const angleStep = (2 * Math.PI) / this.items.length;

		for (let idx = 0; idx < this.items.length; idx++) {
			const endAngle = startAngle + angleStep;

			if (normalizedAngle >= startAngle && normalizedAngle < endAngle) {
				return idx;
			}

			startAngle = endAngle;
		}

		return null;
	}
	deactivateSelector() {
		restoreIframePointerEvents(document);
		super.deactivateSelector();
		this.triggerSelected();
	}
	addMouseEvents() {
		if (this.ownerDocument === null) return;
		for (const [event, handler] of Object.entries(this.eventHandlers)) {
			this.ownerDocument.addEventListener(event as any, handler);
		}
	}
	removeMouseEvents() {
		if (this.ownerDocument === null) return;
		for (const [event, handler] of Object.entries(this.eventHandlers)) {
			this.ownerDocument.removeEventListener(event as any, handler);
		}
	}
}
