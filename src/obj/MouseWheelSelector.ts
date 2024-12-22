import { SelectorOptions } from "../types/SelectorOptions";
import { WheelSelector } from "./WheelSelector";
import { makeCanvas, removeCanvas, drawLineFromCenter } from "../util/canvas";

export class MouseWheelSelector extends WheelSelector {
	mouseCanvas: HTMLCanvasElement | null = null;

	constructor(document: Document, options?: SelectorOptions) {
		super(options);
		this.listenMouseEvents(document);
	}

	activateSelector(x: number, y: number) {
		super.activateSelector(x, y);
		this.mouseCanvas = makeCanvas(
			document,
			{ x, y },
			this.outerDistance * 2
		);
	}
	calculLine(
		ex: number,
		ey: number
	): {
		angle: number;
		length: number;
	} {
		const { x, y } = this.clickedMousePos!!;
		const [dx, dy] = [ex - x, ey - y];
		const angle = Math.atan2(dy, dx) * (180 / Math.PI);
		const length = Math.min(
			Math.sqrt(dy * dy + dx * dx),
			this.outerDistance
		);
		return {
			angle,
			length,
		};
	}
	deactivateSelector() {
		removeCanvas(this.mouseCanvas!!);
		super.deactivateSelector();
	}
	listenMouseEvents(document: Document) {
		document.addEventListener("mousedown", (event: MouseEvent) => {
			if (event.button === 0) this.isLeftClicked = true;
			if (event.button === 2 && this.isLeftClicked) {
				event.preventDefault();
				this.activateSelector(event.clientX, event.clientY);
			}
		});

		document.addEventListener("mousemove", (event: MouseEvent) => {
			if (this.clickedMousePos !== null) {
				const { angle, length } = this.calculLine(
					event.clientX,
					event.clientY
				);
				drawLineFromCenter(this.mouseCanvas!!, angle, length);
			}
		});

		document.addEventListener("mouseup", (event: MouseEvent) => {
			if (event.button === 0) this.isLeftClicked = false;

			this.deactivateSelector();
		});

		//document.addEventListener("touchstart", (event: TouchEvent) => {});

		//document.addEventListener("touchend", (event: TouchEvent) => {});

		document.addEventListener("contextmenu", (event: MouseEvent) => {
			if (this.isLeftClicked === true) event.preventDefault();
		});
	}
}