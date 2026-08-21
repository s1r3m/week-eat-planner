export interface IRecipe {
	id: string
	name: string
	author: string
	is_favorite: boolean
	image_url?: string
	portions?: number
}
