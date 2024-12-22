import { WheelSelector } from "../class/WheelSelector";
import { Position } from "../types/Position";

const whiteColor = "rgba(255, 255, 255, 1)";
const blackColor = "rgba(0, 0, 0, 1)";
const defaultColor = "rgba(0, 0, 0, 0.7)";
const selectedColor = "rgba(126, 221, 17, 0.7)";

export function makeCanvas(
	document: Document,
	pos: Position,
	size: number
): HTMLCanvasElement {
	const canvas = document.createElement("canvas");

	canvas.style.position = "fixed";
	canvas.style.left = `${pos.x - size / 2}px`;
	canvas.style.top = `${pos.y - size / 2}px`;
	canvas.style.pointerEvents = "none"; // Make sure it doesn't block mouse events
	canvas.style.zIndex = "100";
	canvas.width = size;
	canvas.height = size;

	document.body.appendChild(canvas);
	return canvas;
}

export function removeCanvas(canvas: HTMLCanvasElement) {
	canvas.remove();
}

export function clearCanvas(canvas: HTMLCanvasElement) {
	const ctx = canvas.getContext("2d");
	if (!ctx) return;
	ctx.clearRect(0, 0, canvas.width, canvas.height);
}

export function drawItem(
	canvas: HTMLCanvasElement,
	selector: WheelSelector,
	itemNo: number | null
) {
	const ctx = canvas.getContext("2d");
	if (!ctx) return;
	if (itemNo === null) return;

	const { items, outerDistance, innerDistance, selectedItemNo } = selector;
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
	ctx.fillStyle = selectedItemNo === itemNo ? selectedColor : defaultColor; // Assign item color or default
	ctx.fill();

	ctx.globalCompositeOperation = "source-over";
	drawLineFromCenter(canvas, startAngle, outerDistance);
	drawLineFromCenter(canvas, endAngle, outerDistance);

	// Add the label
	const midAngle = startAngle + angleStep / 2; // Find the midpoint of the slice
	const textRadius = (innerDistance + outerDistance) / 2; // Position text between inner and outer radii
	const textX = outerDistance + textRadius * Math.cos(midAngle); // X-coordinate for text
	const textY = outerDistance + textRadius * Math.sin(midAngle); // Y-coordinate for text

	ctx.fillStyle = selectedItemNo === itemNo ? blackColor : whiteColor; // Text color
	ctx.font = "16px Arial"; // Text font
	ctx.textAlign = "center"; // Center-align text
	ctx.textBaseline = "middle"; // Middle-align text
	ctx.fillText(item.name, textX, textY); // Draw the text

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

export function drawItems(canvas: HTMLCanvasElement, selector: WheelSelector) {
	clearCanvas(canvas);
	selector.items.forEach((_, idx) => drawItem(canvas, selector, idx));
}

export function drawLineFromCenter(
	canvas: HTMLCanvasElement,
	angle: number,
	length: number,
	color: string = whiteColor
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
