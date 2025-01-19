import { WheelSelector } from "./WheelSelector";
import {
	disableIframePointerEvents,
	hideMouseCursor,
	restoreIframePointerEvents,
	showMouseCursor,
} from "../util/events";
import { MouseSelectorOptions } from "../types/SelectorOptions";
import { Position } from "../types/Position";

export class MouseWheelSelector extends WheelSelector {
	isLeftClicked: Boolean = false;
	activateKey: string | null = null;
	startPos: Position | null = null;
	lineInfo: {
		angle: number;
		length: number;
	} | null = null;
	eventHandlers = {
		keydown: (event: KeyboardEvent) => {
			if (event.key === this.activateKey) {
				const centerX = window.innerWidth / 2;
				const centerY = window.innerHeight / 2;

				hideMouseCursor(document);
				this.activateSelector({ x: centerX, y: centerY });
			}
		},
		keyup: (event: KeyboardEvent) => {
			if (event.key === this.activateKey) {
				showMouseCursor(document);
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
			if (!this.isActive) {
				this.startPos = { x: event.clientX, y: event.clientY };
				return;
			}
			if (this.position === null) return null;
			const { angle, length } = this.calculLine(
				event.clientX,
				event.clientY
			);
			this.selectedItemNo = this.checkSelected({ angle, length });
			this.lineInfo = { angle, length };
			this.redraw();
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
		const { x, y } = this.startPos!!;
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
	}): number | null | "CANCEL" {
		if (length < this.innerDistance) return "CANCEL";

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
		this.lineInfo = null;
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
