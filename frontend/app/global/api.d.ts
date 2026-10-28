import type { components } from '#open-fetch-schemas/base-api'

declare global {
	type BackendSchema = components['schemas']
}
