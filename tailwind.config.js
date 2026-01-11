/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './assets/**/*.{js,jsx,ts,tsx}',
    './templates/**/*.html.twig',
  ],
  theme: {
    extend: {},
  },
  plugins: [],
  // Important: évite les conflits avec Bootstrap existant
  corePlugins: {
    preflight: false,
  },
}
