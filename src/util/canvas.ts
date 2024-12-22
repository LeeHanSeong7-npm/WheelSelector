import { Position } from "../types/Position";
import { SelectorItem } from "../types/SelectorItem";

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

export function drawItems(
	canvas: HTMLCanvasElement,
	innerSize: number,
	outerSize: number,
	items: SelectorItem[]
) {
	const ctx = canvas.getContext("2d");
	if (!ctx) return;

	ctx.clearRect(0, 0, canvas.width, canvas.height);

	const itemCount = items.length;
	const angleStep = (2 * Math.PI) / itemCount; // Divide 360 degrees into equal parts
	const defaultColors = ["rgba(0, 0, 0, 0.5)", "rgba(100, 100, 100, 0.5)"]; // Default color palette
	const transparentColor = "rgba(0, 0, 0, 1)";
	let startAngle = 0;

	for (const idx in items) {
		const index = parseInt(idx);
		const item = items[index];
		const endAngle = startAngle + angleStep;

		// Draw the outer slice
		ctx.beginPath();
		ctx.moveTo(outerSize, outerSize);
		ctx.arc(outerSize, outerSize, outerSize, startAngle, endAngle, false);
		ctx.lineTo(outerSize, outerSize); // Close the outer slice
		ctx.closePath();
		ctx.fillStyle = defaultColors[index % defaultColors.length]; // Assign item color or default
		ctx.fill();

		// Cut out the inner circle (make it transparent)
		ctx.globalCompositeOperation = "destination-out";
		ctx.beginPath();
		ctx.arc(outerSize, outerSize, innerSize, startAngle, endAngle, false);
		ctx.lineTo(outerSize, outerSize); // Close the inner slice
		ctx.closePath();
		ctx.fillStyle = transparentColor; // Assign item color or default
		ctx.fill(); // Cut out the inner area

		// Restore composite operation to default
		ctx.globalCompositeOperation = "source-over";

		// Add the label
		const midAngle = startAngle + angleStep / 2; // Find the midpoint of the slice
		const textRadius = (innerSize + outerSize) / 2; // Position text between inner and outer radii
		const textX = outerSize + textRadius * Math.cos(midAngle); // X-coordinate for text
		const textY = outerSize + textRadius * Math.sin(midAngle); // Y-coordinate for text

		ctx.fillStyle = "black"; // Text color
		ctx.font = "16px Arial"; // Text font
		ctx.textAlign = "center"; // Center-align text
		ctx.textBaseline = "middle"; // Middle-align text
		ctx.fillText(item.name, textX, textY); // Draw the text

		startAngle = endAngle; // Update the start angle for the next slice
	}

	return ctx;
}

export function drawLineFromCenter(
	canvas: HTMLCanvasElement,
	angle: number,
	length: number
) {
	const ctx = canvas.getContext("2d");
	if (!ctx) return;

	// Get the center of the canvas
	const centerX = canvas.width / 2;
	const centerY = canvas.height / 2;

	// Convert angle from degrees to radians
	const angleRadians = (angle * Math.PI) / 180;

	// Calculate the endpoint of the line using trigonometry
	const endX = centerX + length * Math.cos(angleRadians);
	const endY = centerY + length * Math.sin(angleRadians);

	ctx.clearRect(0, 0, canvas.width, canvas.height);

	// Draw the line
	ctx.beginPath();
	ctx.moveTo(centerX, centerY); // Start at the center of the canvas
	ctx.lineTo(endX, endY); // Draw to the calculated endpoint
	ctx.strokeStyle = "black"; // Set the line color
	ctx.lineWidth = 2; // Set the line width
	ctx.stroke(); // Render the line

	return ctx;
}
