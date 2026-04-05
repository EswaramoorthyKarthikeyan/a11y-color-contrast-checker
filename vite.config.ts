/// <reference types="vitest" />
import { defineConfig } from "vite";
import path from "path";
import dts from "vite-plugin-dts";

export default defineConfig({
	plugins: [dts({ outDir: "dist/types", rollupTypes: false })],
	test: {
		environment: "happy-dom",
		include: ["tests/**/*.test.ts"],
	},
	build: {
		sourcemap: true,
		target: "es6",
		outDir: "dist",
		lib: {
			entry: path.resolve(__dirname, "./src/index.ts"),
			name: "colorContrast",
		},
		rollupOptions: {
			output: [
				{
					format: "es",
					dir: "dist/es6",
					entryFileNames: "[name].js",
				},
				{
					format: "iife",
					name: "colorContrast",
					dir: "dist/iife",
					entryFileNames: "[name].js",
				},
				{
					format: "cjs",
					dir: "dist/es5",
					entryFileNames: "[name].js",
				},
			],
		},
	},
	mode: "production",
	esbuild: {
		target: "es2015",
	},
});
