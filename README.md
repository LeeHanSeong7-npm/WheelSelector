## Installation

```bash
npm i @lhs7/wheel-selector
```

## Usage/Examples

<img src="https://github.com/LeeHanSeong7-npm/WheelSelector/blob/main/example.gif?raw=true" height="400">

```jsx
import { MouseWheelSelector } from "@lhs7/wheel-selector";
import { loadList } from "./loadList"

//	•	Activate Selector With Mouse: Right-click after a left-click.
//	•	Deactivate Selector: Release the mouse button (mouseup) or call deactivateSelector().
let wheelSelector = new MouseWheelSelector({
	items: [],
	activateKey: "Escape",	//	•	Activate Key for Selector
	theme: {
		defaultColor: "rgba(0, 0, 0, 0.7)",		//	•	NonSelected Item Color
		selectedColor: "rgba(125, 220, 0, 0.7)",	//	•	Selected Item Color
	},
});
function load() {
	loadList().then((items: CursorItem[]) => {
		items = items.map((item: CursorItem) => {
			return {
				name: item.name,
				callback: () => {
					chrome.runtime.sendMessage(item);
				},
			};
		});

		wheelSelector.updateItems(items as any);
	});
}

load();

chrome.storage.onChanged.addListener(load);

```

## License

[MIT licensed](./LICENSE).
