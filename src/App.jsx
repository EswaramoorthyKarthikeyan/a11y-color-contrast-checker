import { useEffect } from "react";
import { ColorContrastChecker } from "a11y-color-contrast-checker";
import "./App.css";

function App() {
	useEffect(() => {
		const container = document.querySelector("#container");
		const constrastCheck = new ColorContrastChecker(container);
		console.log(constrastCheck);
		constrastCheck.init();
	}, []);

	return (
		<div className="container" id="container">
			<div className="box box--white">text content</div>
			<div className="box box--yellow">text content</div>
			<div className="box box--orange">text content</div>
			<div className="box box--transparent">text content</div>
			<div className="box box--green">
				<span className="tamil"> tamil </span>
				<span>text content</span>
			</div>
		</div>
	);
}

export default App;
