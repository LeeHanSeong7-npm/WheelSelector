import { WheelSelector } from "../class/WheelSelector";
import { WheelSelectorEditor } from "../class/WheelSelectorEditor";
import { Position } from "../types/Position";

const whiteColor: string = "rgba(255, 255, 255, 1)";
const blackColor: string = "rgba(0, 0, 0, 1)";
const transparentColor: string = "rgba(0, 0, 0, 0)";

export function makeCanvas(pos: Position, size: number): HTMLCanvasElement {
	const canvas = document.createElement("canvas");

	canvas.style.position = "fixed";
	canvas.style.left = `${pos.x - size / 2}px`;
	canvas.style.top = `${pos.y - size / 2}px`;
	canvas.style.pointerEvents = "none"; // Make sure it doesn't block mouse events
	canvas.style.zIndex = "10000";
	canvas.width = size;
	canvas.height = size;

	document.body.appendChild(canvas);
	return canvas;
}

export function removeCanvas(canvas: HTMLCanvasElement | null) {
	if (!canvas) return;
	clearCanvas(canvas);
	canvas.remove();
}

export function clearCanvas(canvas: HTMLCanvasElement | null) {
	if (!canvas) return;
	const ctx = canvas.getContext("2d");
	if (!ctx) return;
	ctx.clearRect(0, 0, canvas.width, canvas.height);
}

export function drawItem(selector: WheelSelector, itemNo: number | null) {
	const {
		items,
		outerDistance,
		innerDistance,
		selectedItemNo,
		cursorCanvas,
	} = selector;
	const { selectedColor, defaultColor } = selector.theme;

	if (cursorCanvas === null) return;

	const ctx = cursorCanvas.getContext("2d");
	if (!ctx) return;
	if (itemNo === null) return;

	const item = items[itemNo];

	const itemCount = items.length;
	const angleStep = (2 * Math.PI) / itemCount; // Divide 360 degrees into equal parts
	const startAngle = angleStep * itemNo;
	const endAngle = startAngle + angleStep;

	//Erase outer slice
	ctx.globalCompositeOperation = "destination-out";
	ctx.beginPath();
	ctx.moveTo(outerDistance, outerDistance);
	ctx.arc(outerDistance, outerDistance, outerDistance, startAngle, endAngle);
	ctx.closePath();
	ctx.fillStyle = whiteColor;
	ctx.fill();

	// Draw the outer slice
	ctx.globalCompositeOperation = "source-over";
	ctx.beginPath();
	ctx.moveTo(outerDistance, outerDistance);
	ctx.arc(outerDistance, outerDistance, outerDistance, startAngle, endAngle);
	ctx.closePath();
	ctx.fillStyle =
		selectedItemNo === itemNo ? selectedColor!! : defaultColor!!; // Assign item color or default
	ctx.fill();

	if (selector.items.length > 1) {
		ctx.globalCompositeOperation = "source-over";
		drawLineFromCenter(cursorCanvas, startAngle, outerDistance, whiteColor);
		drawLineFromCenter(cursorCanvas, endAngle, outerDistance, whiteColor);
	}

	// Add the label
	const midAngle = startAngle + angleStep / 2; // Find the midpoint of the slice
	const textRadius = (innerDistance + outerDistance) / 2; // Position text between inner and outer radii
	const textX = outerDistance + textRadius * Math.cos(midAngle); // X-coordinate for text
	const textY = outerDistance + textRadius * Math.sin(midAngle); // Y-coordinate for text
	drawText(
		cursorCanvas,
		item.name ?? "",
		selectedItemNo === itemNo ? blackColor : whiteColor,
		{
			x: textX,
			y: textY,
		}
	);

	//Erase inner slice
	ctx.globalCompositeOperation = "destination-out";
	ctx.beginPath();
	ctx.moveTo(outerDistance, outerDistance);
	ctx.arc(outerDistance, outerDistance, innerDistance, 0, Math.PI * 2);
	ctx.closePath();
	ctx.fillStyle = whiteColor;
	ctx.fill();

	ctx.globalCompositeOperation = "source-over";
}

export function drawItems(selector: WheelSelector, after: Function[] = []) {
	const { cursorCanvas, outerDistance, innerDistance } = selector;
	if (cursorCanvas === null) return;
	clearCanvas(cursorCanvas);
	selector.items.forEach((_, idx) => drawItem(selector, idx));

	drawCircleLine(cursorCanvas, outerDistance, 3, whiteColor);
	drawCircleLine(cursorCanvas, innerDistance, 3, whiteColor);

	after.forEach((e) => e(selector));
}

export function drawCancelButton(selector: WheelSelector) {
	const { cursorCanvas } = selector;
	if (cursorCanvas === null) return;
	const ctx = cursorCanvas.getContext("2d");
	if (!ctx) return;

	const { outerDistance, innerDistance, selectedItemNo, items } = selector;
	const { selectedColor, defaultColor } = selector.theme;

	ctx.globalCompositeOperation = "source-over";
	ctx.beginPath();
	ctx.moveTo(outerDistance, outerDistance);
	ctx.arc(outerDistance, outerDistance, innerDistance, 0, Math.PI * 2);
	ctx.closePath();
	ctx.fillStyle =
		selectedItemNo === "CANCEL"
			? selectedColor!!
			: items.length !== 0
			? transparentColor
			: defaultColor!!; // Assign item color or default
	ctx.fill();
}

export function drawDragging(selector: WheelSelectorEditor) {
	const { draggingItem, mouseCanvas, dragginIconSize } = selector;

	if (mouseCanvas === null || draggingItem === null) return;
	if (mouseCanvas !== null) clearCanvas(mouseCanvas);

	const ctx = mouseCanvas.getContext("2d");
	if (!ctx) return;

	const radius = dragginIconSize / 2;

	ctx.beginPath();
	ctx.arc(radius, radius, radius, 0, Math.PI * 2);
	ctx.closePath();
	ctx.fillStyle = selector.theme.defaultColor!!;
	ctx.fill();

	drawCircleLine(mouseCanvas, radius, 3, whiteColor);

	drawText(mouseCanvas, draggingItem.name ?? "", whiteColor, {
		x: radius,
		y: radius,
	});
}

function drawCircleLine(
	canvas: HTMLCanvasElement,
	radius: number,
	width: number,
	color: string
) {
	const ctx = canvas.getContext("2d");
	if (!ctx) return;

	ctx.beginPath();
	ctx.arc(
		canvas.width / 2,
		canvas.height / 2,
		radius - width / 2,
		0,
		Math.PI * 2
	);
	ctx.closePath();

	ctx.strokeStyle = color; // Outline color
	ctx.lineWidth = width; // Outline thickness
	ctx.stroke();
}
function drawText(
	canvas: HTMLCanvasElement,
	text: string,
	color: string,
	pos: Position
) {
	const ctx = canvas.getContext("2d");
	if (!ctx) return;

	ctx.fillStyle = color; // Text color
	ctx.font = "16px Arial"; // Text font
	ctx.textAlign = "center"; // Center-align text
	ctx.textBaseline = "middle"; // Middle-align text
	ctx.fillText(text, pos.x, pos.y);
}

function drawLineFromCenter(
	canvas: HTMLCanvasElement,
	angle: number,
	length: number,
	color: string
) {
	const ctx = canvas.getContext("2d");
	if (!ctx) return;

	// Get the center of the canvas
	const centerX = canvas.width / 2;
	const centerY = canvas.height / 2;

	// Calculate the endpoint of the line using trigonometry
	const endX = centerX + length * Math.cos(angle);
	const endY = centerY + length * Math.sin(angle);

	// Draw the line
	ctx.beginPath();
	ctx.moveTo(centerX, centerY); // Start at the center of the canvas
	ctx.lineTo(endX, endY); // Draw to the calculated endpoint
	ctx.strokeStyle = color; // Set the line color
	ctx.lineWidth = 2; // Set the line width
	ctx.stroke(); // Render the line

	return ctx;
}
