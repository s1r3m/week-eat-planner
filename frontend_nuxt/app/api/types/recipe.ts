export interface IRecipe extends IRecipeInfo {
	portions?: number
}

export interface IRecipeInfo {
	author: string
	id: string
	image_url?: string
	is_favorite: boolean
	name: string

	__pending: boolean
}
