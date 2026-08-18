import type { MediaReference } from "../types";

/** Resolve a local or provider-backed EmDash media value to a browser URL. */
export function mediaUrl(media: MediaReference | null): string | null {
	if (!media) return null;
	if (media.src) return media.src;
	if (media.url) return media.url;
	if (media.meta?.storageKey) {
		return `/_emdash/api/media/file/${media.meta.storageKey}`;
	}
	return null;
}

/** Resolve a cover image, with a stable placeholder when one is not set. */
export function recipeImageUrl(title: string, coverImage: MediaReference | null): string | null {
	const url = mediaUrl(coverImage);
	if (url) return url;
	const seed = encodeURIComponent(title.toLowerCase().replace(/\s+/g, "-"));
	return `https://picsum.photos/seed/${seed}/800/800`;
}
