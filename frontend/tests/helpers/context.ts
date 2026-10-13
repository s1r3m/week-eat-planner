import { PiniaColada } from '@pinia/colada'
import { createPinia, disposePinia } from 'pinia'
import { createSSRApp, effectScope } from 'vue'

const cleanups: (() => void)[] = []
export function cleanupAppContexts() {
	for (const cleanup of cleanups.toReversed()) cleanup()
	cleanups.length = 0
}

export function withAppContext<T>(setup: () => T) {
	const pinia = createPinia()
	const scope = effectScope()
	const app = createSSRApp({ render: () => null })
	app.use(pinia).use(PiniaColada)
	let result!: T
	app.runWithContext(() => {
		scope.run(() => {
			result = setup()
		})
	})
	cleanups.push(() => {
		scope.stop()
		disposePinia(pinia)
	})
	return result
}
