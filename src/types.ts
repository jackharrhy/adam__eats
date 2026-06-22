export interface MediaReference {
	mediaId: string;
	alt?: string;
	url?: string;
	contentType?: string;
	width?: number;
	height?: number;
}

export interface RecipeData {
	title: string;
	cook_source: string;
	cover_image: MediaReference | null;
	excerpt: string | null;
}
