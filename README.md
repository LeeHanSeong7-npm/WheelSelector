## Installation

```bash
npm i @lhs7/wheel-selector
```

## Usage/Examples

<img src="https://github.com/LeeHanSeong7-npm/WheelSelector/blob/main/example.gif?raw=true" height="400">

```jsx
import { MouseWheelSelector } from "@lhs7/wheel-selector";

let wheelSelector = new MouseWheelSelector({ items: [] });
function load() {
	loadList().then((items[]) => {
		items = items.map((item) => {
			return {
				name: item.name,
				callback: () => {
					alert(item.url);
				},
			};
		});

		wheelSelector.updateItems(items);
	});
}

load();
```

## License

[MIT licensed](./LICENSE).
