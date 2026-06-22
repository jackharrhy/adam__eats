// @ts-check
import node from "@astrojs/node";
import react from "@astrojs/react";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "astro/config";
import emdash, { local } from "emdash/astro";
import { sqlite } from "emdash/db";

// https://astro.build/config
export default defineConfig({
	output: "server",
	adapter: node({ mode: "standalone" }),
	compressHTML: true,
	image: {
		layout: "constrained",
		responsiveStyles: true,
	},
	integrations: [
		react(),
		emdash({
			database: sqlite({ url: "file:./data/emdash.db" }),
			storage: local({
				directory: "./data/uploads",
				baseUrl: "/_emdash/api/media/file",
			}),
		}),
	],
	vite: {
		plugins: [tailwindcss()],
	},
	devToolbar: { enabled: false },
});
