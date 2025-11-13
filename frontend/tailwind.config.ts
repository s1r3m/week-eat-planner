// TypeScript version of the Tailwind config for IDEs and type-safety.
// Note: many CLI tools (tailwindcss/postcss) read CommonJS configs (cjs).
// We also provide `tailwind.config.cjs` so the tooling can load it at runtime.
export default {
  content: [
    './index.html',
    './src/**/*.{vue,js,ts,jsx,tsx}'
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
