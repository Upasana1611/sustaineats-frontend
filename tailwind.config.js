/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        sustainGreen: '#82bc00', // Matches your Diet Foods template
      },
    },
  },
  plugins: [],
}