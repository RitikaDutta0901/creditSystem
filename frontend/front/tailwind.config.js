/** @type {import('tailwindcss').Config} */
module.exports = {
  // FIX: This line tells Tailwind to look at all JS/TS files in your src folder
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}

