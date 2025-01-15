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
//	•	Deactivate Selector: Release the mouse button (mouseup) or call deactivateSelector
let wheelSelector = new MouseWheelSelector();
function load() {
	loadList().then((items: CursorItem[]) => {
		items = items.map((item: CursorItem) => {
			return {
				name: item.name,
				callback: () => {
					alert(item.name);
				},
			};
		});

		wheelSelector.updateItems(items as any);
	});
}

load();

chrome.storage.onChanged.addListener(load);

```

## options

```jsx
interface SelectorOptions {
	// Selector Item List
	items?: {
		name: string, // Item name displayed in the selector
		callback: Function, // Callback executed when the item is selected
	}[];
	outerDistance?: number; // Distance between the outer line and the center
	innerDistance?: number; // Distance between the inner line and the center
	theme?: {
		defaultColor?: string, // Default color of items
		selectedColor?: string, // Highlighted color for the selected item
	};
}

interface MouseSelectorOptions extends SelectorOptions {
	activateKey?: string | null; // KeyboardEvent.key for MouseWheelSelector key activate
}
```

## Plain WheelSelector for Custom WheelSelector

```jsx
let options: SelectorOptions = {
	items: [],
	outerDistance: 200,
	innerDistance: 100,
	theme: {
		defaultColor: "rgba(0, 0, 0, 0.7)",
		selectedColor: "rgba(125, 220, 0, 0.7)",
	},
};
let wheelSelector = new WheelSelector(options);

const centerX = window.innerWidth / 2;
const centerY = window.innerHeight / 2;

wheelSelector.activateSelector({ x: centerX, y: centerY }); // Activate selector and add canvas to document

wheelSelector.updateItems([
	{ name: "1", callback: () => {} },
	{
		name: "2",
		callback: () => {
			console.log("test");
		},
	},
]); // Update item list and redraw

wheelSelector.selectItem(1); // Select item with index 1 => { name: "2" }

wheelSelector.redraw(); // Redraw manually

wheelSelector.triggerSelected(); // Execute callback of the selected item

wheelSelector.selectItem(null); // Unselect item

wheelSelector.deactivateSelector(); // Deactivate selector and remove canvas
```

## License

[MIT licensed](./LICENSE).
