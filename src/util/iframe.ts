export function disableIframePointerEvents() {
	const iframes = document.querySelectorAll("iframe");
	iframes.forEach((iframe) => {
		iframe.style.pointerEvents = "none";
	});
}

export function restoreIframePointerEvents() {
	const iframes = document.querySelectorAll("iframe");
	iframes.forEach((iframe) => {
		iframe.style.pointerEvents = "auto";
	});
}
