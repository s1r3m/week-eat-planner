// Use the new PostCSS adapter package for Tailwind v4+:
// @tailwindcss/postcss
module.exports = {
  plugins: [
    // explicit require is robust for PostCSS loader resolution
    require('@tailwindcss/postcss'),
    require('autoprefixer'),
  ],
}
