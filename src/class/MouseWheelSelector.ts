import { WheelSelector } from "./WheelSelector";
import {
	disableIframePointerEvents,
	restoreIframePointerEvents,
} from "../util/events";
import { MouseSelectorOptions } from "../types/SelectorOptions";
import { Position } from "../types/Position";

export class MouseWheelSelector extends WheelSelector {
	isLeftClicked: Boolean = false;
	activateKey: string | null = null;

	eventHandlers = {
		keydown: (event: KeyboardEvent) => {
			if (event.key === this.activateKey) {
				const centerX = window.innerWidth / 2;
				const centerY = window.innerHeight / 2;

				this.activateSelector({ x: centerX, y: centerY });
			}
		},
		keyup: (event: KeyboardEvent) => {
			if (event.key === this.activateKey) {
				this.deactivateSelector();
			}
		},
		click: (event: MouseEvent) => {
			if (this.isActive) {
				event.preventDefault();
				event.stopPropagation();
				event.stopImmediatePropagation();
				//클릭이벤트 중복 처리를 막기위해 더 뒤에서 처리되는 click에서 처리
				this.deactivateSelector();
			}
		},
		mousedown: (event: MouseEvent) => {
			if (event.button === 0) this.isLeftClicked = true;
			if (event.button === 2 && this.isLeftClicked) {
				event.preventDefault();
				this.activateSelector({ x: event.clientX, y: event.clientY });
			}
		},
		mousemove: (event: MouseEvent) => {
			if (this.position !== null) {
				const preSelected = this.selectedItemNo;
				this.selectedItemNo = this.checkSelected(
					this.calculLine(event.clientX, event.clientY)
				);
				if (preSelected !== this.selectedItemNo) {
					this.redraw();
				}
			}
		},
		mouseup: (event: MouseEvent) => {
			if (this.isActive) {
				event.preventDefault();
				event.stopPropagation();
				event.stopImmediatePropagation();
				if (event.button === 2) this.deactivateSelector();
			}
			if (event.button === 0) {
				this.isLeftClicked = false;
			}
		},
		contextmenu: (event: MouseEvent) => {
			if (this.isLeftClicked === true) event.preventDefault();
		},
	};
	constructor(options?: MouseSelectorOptions) {
		super(options);
		if (options)
			this.activateKey = options.activateKey ? options.activateKey : null;
		this.addEventHandlers();
	}

	activateSelector({ x, y }: Position) {
		disableIframePointerEvents(document);
		super.activateSelector({ x, y });
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
	addEventHandlers() {
		if (document === null) return;
		for (const [event, handler] of Object.entries(this.eventHandlers)) {
			document.addEventListener(event as any, handler, true);
		}
	}
	removeEventHandlers() {
		if (document === null) return;
		for (const [event, handler] of Object.entries(this.eventHandlers)) {
			document.removeEventListener(event as any, handler, true);
		}
	}
}
