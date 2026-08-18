export interface MediaReference {
	mediaId?: string;
	id?: string;
	alt?: string;
	url?: string;
	src?: string;
	previewUrl?: string;
	filename?: string;
	mimeType?: string;
	contentType?: string;
	size?: number;
	width?: number;
	height?: number;
	meta?: {
		storageKey?: string;
		[key: string]: unknown;
	};
}

export interface RecipeData {
	title: string;
	cook_source: string;
	cover_image: MediaReference | null;
	video: MediaReference | null;
	excerpt: string | null;
}
