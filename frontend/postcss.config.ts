// TypeScript version of PostCSS config for IDEs. The actual loader will use
// postcss.config.cjs at runtime.
// TypeScript helper for IDEs. The runtime will use postcss.config.cjs.
// Use require here to mirror runtime config and avoid resolution issues.
// eslint-disable-next-line @typescript-eslint/no-var-requires
const tailwindPostcss = require('@tailwindcss/postcss')
// eslint-disable-next-line @typescript-eslint/no-var-requires
const autoprefixer = require('autoprefixer')

export default {
  plugins: [tailwindPostcss, autoprefixer],
}
