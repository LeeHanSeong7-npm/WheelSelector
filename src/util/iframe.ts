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
