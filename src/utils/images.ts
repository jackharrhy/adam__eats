/**
 * Resolve the image URL for a recipe.
 * Uses the cover photo if set, otherwise falls back to a picsum.photos
 * placeholder seeded by the recipe title for stable, deterministic images.
 */
export function recipeImageUrl(title: string, coverImage: { url?: string } | null): string {
	if (coverImage?.url) return coverImage.url;
	const seed = encodeURIComponent(title.toLowerCase().replace(/\s+/g, "-"));
	return `https://picsum.photos/seed/${seed}/800/800`;
}
