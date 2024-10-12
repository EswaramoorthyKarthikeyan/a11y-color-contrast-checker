import { defineConfig } from "vite";
import path from "path";

export default defineConfig({
	main: "./colorContrast.js",
	build: {
		sourcemap: true,
		targets: ["es6"], // Specify the modern build target
		outDir: "dist",
		lib: {
			entry: path.resolve(__dirname, "./colorContrast.js"),
			name: "colorContrast",
		},
		rollupOptions: {
			output: [
				{
					format: "es", // ES6 Module output
					dir: "dist/es6", // Output directory for ES6
					entryFileNames: "[name].js",
				},
				{
					format: "iife", // IIFE output
					name: "colorContrast", // Global variable name in IIFE
					dir: "dist/iife", // Output directory for IIFE
					entryFileNames: "[name].js",
				},
				{
					format: "cjs", // ES5 (CommonJS) output for legacy
					dir: "dist/es5", // Output directory for ES5
					entryFileNames: "[name].js",
				},
			],
		},
	},
	mode: "production",
	esbuild: {
		target: "es5", // For legacy support of ES5
	},
});
