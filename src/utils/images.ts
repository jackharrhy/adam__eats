/**
 * Resolve the image URL for a recipe.
 * Uses the cover photo if set, otherwise falls back to a picsum.photos
 * placeholder seeded by the recipe title for stable, deterministic images.
 *
 * The cover image from emdash is a MediaValue that may have:
 * - `src`: a direct URL (external providers or legacy data)
 * - `meta.storageKey` + `id`: needs resolution via emdash's media URL builder
 * - `url`: a resolved URL (rare, from MediaReference)
 */
export function recipeImageUrl(
	title: string,
	coverImage: { src?: string; url?: string; id?: string; meta?: { storageKey?: string } } | null,
): string | null {
	if (coverImage) {
		if (coverImage.src) return coverImage.src;
		if (coverImage.url) return coverImage.url;
		if (coverImage.meta?.storageKey) {
			return `/_emdash/api/media/file/${coverImage.meta.storageKey}`;
		}
	}
	const seed = encodeURIComponent(title.toLowerCase().replace(/\s+/g, "-"));
	return `https://picsum.photos/seed/${seed}/800/800`;
}
