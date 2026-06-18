import { readdirSync, readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const recipesDir = join(root, "src", "content", "recipes");
const seedPath = join(root, "seed", "seed.json");

function parseTitle(raw, fallback) {
	const m = raw.match(/^---\s*\n[\s\S]*?title:\s*["']?([^"'\n]+)["']?/m);
	return m?.[1]?.trim() ?? fallback;
}

const files = readdirSync(recipesDir).filter((f) => f.endsWith(".cook"));
const recipes = files
	.map((f) => {
		const id = f.replace(/\.cook$/, "");
		const raw = readFileSync(join(recipesDir, f), "utf-8");
		const title = parseTitle(raw, id.replace(/-/g, " "));
		return { id, slug: id, status: "published", data: { title, cook_source: raw } };
	})
	.toSorted((a, b) => a.data.title.localeCompare(b.data.title));

const seed = {
	$schema: "https://emdashcms.com/seed.schema.json",
	version: "1",
	meta: {
		name: "adam__eats",
		description: "Cooklang recipe site powered by EmDash",
		author: "jack",
	},
	settings: {
		title: "adam__eats",
		tagline: "Cooklang recipe site",
	},
	collections: [
		{
			slug: "recipes",
			label: "Recipes",
			labelSingular: "Recipe",
			supports: ["drafts", "revisions", "search", "seo"],
			fields: [
				{ slug: "title", label: "Title", type: "string", required: true, searchable: true },
				{
					slug: "cook_source",
					label: "Cooklang Source",
					type: "text",
					required: true,
					searchable: true,
					options: { rows: 24 },
				},
				{
					slug: "cover_image",
					label: "Cover Image",
					type: "image",
					options: { showPreview: true },
				},
				{ slug: "excerpt", label: "Excerpt", type: "text", options: { rows: 2 } },
			],
		},
	],
	content: { recipes },
};

mkdirSync(dirname(seedPath), { recursive: true });
writeFileSync(seedPath, JSON.stringify(seed, null, 2) + "\n");
console.log(`Wrote ${seedPath} with ${recipes.length} recipes`);
