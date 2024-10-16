# a11y-color-contrast-checker

A color contrast checker for web developers to ensure your website meets WCAG (Web Content Accessibility Guidelines) standards for color contrast. This utility helps verify that text and background color combinations provide sufficient contrast for users with visual impairments, improving accessibility. During the development phase, it highlights elements in the DOM that do not meet the required standards.

## WCAG 2.1 - Success Criterion 1.4.3: Contrast (Minimum) (Level AA)

The visual presentation of text and images of text must have a contrast ratio of at least 4.5:1, except for the following:

-   **Large Text**: Large-scale text and images of large-scale text should have a contrast ratio of at least 3:1.
-   **Incidental**: Text or images of text that are part of an inactive user interface component, pure decoration, invisible to users, or part of a picture containing significant other visual content have no contrast requirement.
-   **Logotypes**: Text that is part of a logo or brand name has no contrast requirement.

For more information, refer to the official [WCAG 2.1 guidelines](https://www.w3.org/WAI/WCAG21/Understanding/contrast-minimum.html).

## Features

-   Checks color contrast between text and background according to WCAG 2.1 guidelines.
-   Highlights DOM elements that fail to meet the required contrast ratio.
-   Supports both ES6 and IIFE modules, making it easy to integrate into any project.

## Installation

Install the package using npm:

```bash
npm install a11y-color-contrast-checker --save-dev
```

## Usage

### For ES6 Modules

You can use the package in your React or other ES6-based projects as shown below:

```js
import { useEffect } from "react";
import "./App.css";
import { ColorContrastChecker } from "a11y-color-contrast-checker";

function App() {
	useEffect(() => {
		const getContainerElement = document.querySelector("#container");
		// Creating instance for the iife class.
		const colorChecker = new ColorContrastChecker(getContainerElement);

		// Initiatizing
		colorChecker.init();

		// Mutating the dom after 10 sec to check the plugin
		setTimeout(() => {
			const divElement = document.createElement("div");
			divElement.classList.add("box", "box--red");
			divElement.textContent = "dummy element";
			getContainerElement.appendChild(divElement);
		}, 10000);
	}, []);

	return (
		<div className="container" id="container">
			<div className="box box--white">text content</div>
			<div className="box box--yellow">text content</div>
			<div className="box box--orange">text content</div>
			<div className="box box--transparent"></div>
			<div className="box box--green">
				<span className="tamil"> tamil </span>
				text content
			</div>
			<div className="box box--dummy">
				<span className="tamil"> tamil </span>
				text content
			</div>
		</div>
	);
}

export default App;
```

## For IIFE (Immediately Invoked Function Expression)

If you are not using a module bundler, you can include the package in your HTML page:

```html
<!doctype html>
<html lang="en">
	<head>
		<meta charset="UTF-8" />
		<meta name="viewport" content="width=device-width, initial-scale=1.0" />
		<title>Color Contrast Checker</title>
		<link href="./style.css" rel="stylesheet" />
	</head>
	<body>
		<div class="container" id="container">
			<div class="box box--white">text content</div>
			<div class="box box--yellow">text content</div>
			<div class="box box--orange">text content</div>
			<div class="box box--transparent"></div>
			<div class="box box--green">
				<span class="tamil"> tamil </span>
				text content
			</div>
			<div class="box box--dummy">
				<span class="tamil"> tamil </span>
				text content
			</div>
		</div>
		<script src="../dist/iife/colorContrast.js"></script>
		<script>
			try {
				// Creating instance for the iife class.
				const getChecker = new colorContrast.ColorContrastChecke();
				// Initiatizing
				getChecker.init();

				// Mutating the dom after 10 sec to check the plugin
				setTimeout(() => {
					const divElement = document.createElement("div");
					divElement.classList.add("box", "box--red");
					divElement.textContent = "dummy element";
					container.appendChild(divElement);
				}, 10000);
			} catch (error) {
				console.error("Error initializing ColorContrastChecker:", error.message);
			}
		</script>
	</body>
</html>
```

## API

```
ColorContrastChecker(container)
```

-   container: The DOM element or the container you want to check for color contrast issues.

`init()`

-   Initializes the checker and scans the provided container for any elements that fail to meet WCAG standards.

`destroy()`

-   Use it when you're done observing changes to clean up resources efficiently.

## License

This project is licensed under the MIT License.


## Exmaple

<img width="427" alt="Screenshot 2024-10-17 at 00 19 25" src="https://github.com/user-attachments/assets/2c7cb13b-93fd-4532-9134-7acfdaf07de1">





