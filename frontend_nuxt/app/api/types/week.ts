export type DayOfWeek =
	| 'MONDAY'
	| 'TUESDAY'
	| 'WEDNESDAY'
	| 'THURSDAY'
	| 'FRIDAY'
	| 'SATURDAY'
	| 'SUNDAY'

export interface IMealSlot {
	id: string
	meal_type: MealType
	day_of_week: DayOfWeek
	recipe: IRecipe | null
}

export interface IWeek extends IWeekPreview {
	week_days: IWeekDay[]
}

export interface IWeekDay {
	name: DayOfWeek
	slots: IMealSlot[]
}

export interface IWeekPayload {
	name: string
}

export interface IWeekPreview {
	id: string
	name: string
	user_id: string

	__pending?: boolean
}

export type MealType = 'BREAKFAST' | 'LUNCH' | 'DINNER' | 'SNACK'
