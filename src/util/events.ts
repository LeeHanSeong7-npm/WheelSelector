export function disableIframePointerEvents(document: Document) {
	const iframes = document.querySelectorAll("iframe");
	iframes.forEach((iframe) => {
		iframe.style.pointerEvents = "none";
	});
}

export function restoreIframePointerEvents(document: Document) {
	const iframes = document.querySelectorAll("iframe");
	iframes.forEach((iframe) => {
		iframe.style.pointerEvents = "auto";
	});
}

export function hideMouseCursor(document: Document) {
	document.body.style.cursor = "none";
}
export function showMouseCursor(document: Document) {
	document.body.style.cursor = "auto";
}
