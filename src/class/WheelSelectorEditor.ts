import { WheelSelector } from "./WheelSelector";
import type { EditorOptions } from "../types/SelectorOptions";
import {
	makeCanvas,
	removeCanvas,
	drawDragging,
	clearCanvas,
} from "../util/canvas";
import { SelectorItem } from "../types/SelectorItem";
import { Position } from "../types/Position";

export class WheelSelectorEditor extends WheelSelector {
	dragginIconSize: number = 150;

	draggingItem: SelectorItem | null = null;
	preItems: SelectorItem[] = [];
	mouseCanvas: HTMLCanvasElement | null = null;

	onUpdated: (items: SelectorItem[]) => void;

	constructor(options: EditorOptions) {
		super(options);
		this.onUpdated = options.onUpdated ?? (() => {});
		this.calculate_Size_Pos(options.baseElement);
		this.addEventHandlers();
	}
	eventHandlers = {
		mousedown: (event: MouseEvent) => {
			//왼쪽 클릭만 처리
			if (event.button !== 0) return;

			//드래깅 대상이 존재
			if (typeof this.selectedItemNo === "number") {
				event.preventDefault();
				//드래깅 아이템 저장
				this.draggingItem = this.items[this.selectedItemNo];
				//드래깅 아이템 제외 상태 저장
				this.preItems = this.items.slice();
				this.preItems.splice(this.selectedItemNo, 1);
			} //드래깅 대상 없음
			else {
				this.draggingItem = null;
			}
		},
		mousemove: (event: MouseEvent) => {
			if (this.position === null) return;

			// selector의 아이템 선택 처리
			this.selectedItemNo = this.checkSelected(
				event.clientX,
				event.clientY
			);
			this.redraw();

			//캔버스 위치 조정
			if (this.mouseCanvas !== null) {
				const { clientX, clientY } = event;
				this.mouseCanvas.style.left = `${
					clientX - this.dragginIconSize / 2
				}px`;
				this.mouseCanvas.style.top = `${
					clientY - this.dragginIconSize / 2
				}px`;
			}

			//드래깅 상태이며, 선택 영역에 있을경우 경우 드래깅 아이콘 그리기
			if (
				this.draggingItem !== null &&
				typeof this.selectedItemNo !== "number"
			) {
				drawDragging(this);
			} else {
				clearCanvas(this.mouseCanvas);
			}
		},
		mouseup: (event: MouseEvent) => {
			//왼쪽 클릭후 드래깅 상태가 있는 경우만 처리
			if (event.button !== 0 || this.draggingItem === null) return;

			event.preventDefault();
			this.draggingItem = null;

			//마우스 아이콘 삭제
			clearCanvas(this.mouseCanvas);

			//아이템 변경 업데이트
			this.onUpdated(this.items);
		},
	};

	calculate_Size_Pos(baseElement: HTMLElement | null) {
		if (baseElement === null) return;
		const { width, height, top, left } =
			baseElement.getBoundingClientRect();
		const centerX = left + width / 2;
		const centerY = top + height / 2;
		this.outerDistance = Math.min(width, height) / 2;
		this.innerDistance = this.outerDistance / 2;

		this.activateSelector({ x: centerX, y: centerY });
	}

	private checkSelected(ex: number, ey: number): number | null | "CANCEL" {
		const { angle, length } = ((ex: number, ey: number) => {
			const { x, y } = this.position!!;
			const [dx, dy] = [ex - x, ey - y];
			const angle = Math.atan2(dy, dx);
			const length = Math.sqrt(dy * dy + dx * dx);
			return {
				angle,
				length,
			};
		})(ex, ey);

		//드래그 상태이면 이전 상태로 덮어씌우고 시작
		if (this.draggingItem !== null) this.items = this.preItems.slice();
		if (length < this.innerDistance) return "CANCEL";
		else if (length > this.outerDistance) return null;

		const normalizedAngle =
			((angle % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI);

		let startAngle = 0;
		// 드래깅 아이템이 존재할 경우 아이템 수 + 1
		const itemLength =
			this.items.length + (this.draggingItem === null ? 0 : 1);
		const angleStep = (2 * Math.PI) / itemLength;

		let selectedIdx = null;
		for (let idx = 0; idx < itemLength; idx++) {
			const endAngle = startAngle + angleStep;

			if (normalizedAngle >= startAngle && normalizedAngle < endAngle) {
				selectedIdx = idx;
				break;
			}

			startAngle = endAngle;
		}

		if (typeof selectedIdx === "number" && this.draggingItem !== null) {
			//선택된 아이템이 존재하면 드래깅 아이템을 해당 위치에 삽입
			this.items.splice(selectedIdx, 0, this.draggingItem);
		}

		return selectedIdx;
	}

	activateSelector(pos: Position) {
		if (this.mouseCanvas !== null) removeCanvas(this.mouseCanvas);
		this.mouseCanvas = makeCanvas({ x: 0, y: 0 }, this.dragginIconSize);
		this.mouseCanvas.style.zIndex = "10001";
		super.activateSelector(pos);
	}
	deactivateSelector() {
		if (this.mouseCanvas !== null) removeCanvas(this.mouseCanvas);
		super.deactivateSelector();
	}

	addEventHandlers() {
		if (document === null) return;
		for (const [event, handler] of Object.entries(this.eventHandlers)) {
			document.addEventListener(event as any, handler, true);
		}
	}
	removeEventHandlers() {
		if (document === null) return;
		removeCanvas(this.mouseCanvas);
		for (const [event, handler] of Object.entries(this.eventHandlers)) {
			document.removeEventListener(event as any, handler, true);
		}
	}
}
