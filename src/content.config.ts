import { defineCollection } from "astro:content";
import { z } from "astro/zod";
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = fileURLToPath(new URL(".", import.meta.url));
const recipesDir = join(__dirname, "content", "recipes");

const recipes = defineCollection({
  loader: async () => {
    const files = readdirSync(recipesDir)
      .filter((f) => f.endsWith(".cook"))
      .map((f) => {
        const id = f.replace(/\.cook$/, "");
        const rawText = readFileSync(join(recipesDir, f), "utf-8");
        const title = parseTitleFromCook(rawText) ?? id.replace(/-/g, " ");
        return { id, title, rawText };
      });
    return files;
  },
  schema: z.object({
    title: z.string(),
    rawText: z.string(),
  }),
});

function parseTitleFromCook(raw: string): string | null {
  const match = raw.match(/^---\s*\n[\s\S]*?title:\s*["']?([^"'\n]+)["']?/m);
  return match?.[1]?.trim() ?? null;
}

export const collections = { recipes };
