import { describe, expect, it } from 'vitest'

import { getRedirectTarget, isUnauthorized } from '@/modules/auth/utils/session'

describe('isUnauthorized', () => {
	it.each([
		{ statusCode: 401 },
		{ status: 401 },
		{ response: { status: 401 } },
	])('recognizes unauthorized responses: %j', (error) => {
		expect(isUnauthorized(error)).toBe(true)
	})

	it.each([
		undefined,
		null,
		new Error('Network error'),
		{ statusCode: 500 },
		{ status: 403 },
		{ response: { status: 404 } },
		{ status: '401' },
	])('does not treat other failures as unauthorized: %j', (error) => {
		expect(isUnauthorized(error)).toBe(false)
	})
})

describe('getRedirectTarget', () => {
	it.each(['/', '/my/recipes?q=1#item', '/weeks/shared-week/'])(
		'preserves the internal return URL %s',
		(value) => {
			expect(getRedirectTarget(value)).toBe(value)
		},
	)

	it.each([
		undefined,
		null,
		123,
		{ path: '/my/recipes' },
		'',
		'my/recipes',
		'https://evil.test',
		'//evil.test',
		String.raw`/\evil.test`,
		'/\n/evil.test',
		'/my/recipes\t',
		'/my/recipes\u{0}',
		'/my recipes',
	])('falls back to My Weeks for an invalid return URL: %j', (value) => {
		expect(getRedirectTarget(value)).toBe('/my/weeks')
	})

	it('falls back to My Weeks for an array of redirect query values', () => {
		expect(getRedirectTarget(['/my/recipes'])).toBe('/my/weeks')
	})
})
