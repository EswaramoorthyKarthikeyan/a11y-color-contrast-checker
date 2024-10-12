import { useEffect } from "react";
import { ColorContrastChecker } from "a11y-color-contrast-checker";
import "./App.css";

function App() {
	useEffect(() => {
		const container = document.querySelector("#container");
		const constrastCheck = new ColorContrastChecker(container);
		console.log(constrastCheck);
		constrastCheck.init();

		setTimeout(() => {
			const newElement = document.createElement("div");
			newElement.classList.add("box", "box--yellow");
			newElement.textContent = "Its  a yellow box";
			container.appendChild(newElement);
			const showEle = document.querySelector("#newElement");
			showEle.style.display = "block";
		}, 10000);

		return () => {
			constrastCheck.destroy();
		};
	}, []);

	return (
		<div className="container" id="container">
			<div className="box box--white">text content</div>
			<div className="box box--yellow">text content</div>
			<div className="box box--orange">text content</div>
			<div className="box box--transparent">text content</div>
			<div className="box box--green">
				<span className="tamil"></span>
				<span>text content</span>
			</div>

			<div className="box box--hide" id="newElement">
				<ul className="">
					<li className="">
						<span className=""> Tamil </span>
					</li>
					<li className="">
						<p className=""> English </p>
					</li>
					<li className="">
						<div className="">
							<input value="tamil" style={{ backgroundColor: "violet" }} />
						</div>
					</li>
				</ul>
				<h1></h1>
				<h2></h2>
				<h3></h3>
				<h4></h4>
				<h5></h5>
				<h6></h6>
			</div>
		</div>
	);
}

export default App;
