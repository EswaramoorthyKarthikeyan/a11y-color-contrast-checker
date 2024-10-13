import { useEffect } from "react";
import "./App.css";
import { ColorContrastChecker } from "a11y-color-contrast-checker";

function App() {
	useEffect(() => {
		const getContainerElement = document.querySelector("#container");
		const colorChecker = new ColorContrastChecker(getContainerElement);
		colorChecker.init();

		setTimeout(() => {
			const divElement = document.createElement("div");
			divElement.classList.add("box", "box--red");
			divElement.textContent = "dummy element";
			getContainerElement.appendChild(divElement);
		}, 10000);
	}, []);

	return (
		// <div className="container" id="container">
		<div className="container">
			<div className="box box--white">text content</div>
			<div className="box box--yellow">text content</div>
			<div className="box box--orange">text content</div>
			<div className="box box--transparent"></div>
			<div className="box box--green">
				<span className="tamil"> tamil </span>
				<span>text content</span>
			</div>
			<div className="box box--dummy">
				<span className="tamil"> tamil </span>
				<span>text content</span>
			</div>
		</div>
	);
}

export default App;
