/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}", // Include all files in the `app/` directory
    "./components/**/*.{js,ts,jsx,tsx}", // Include all files in the `components` directory
    "./pages/**/*.{js,ts,jsx,tsx}", // Include the `pages` folder if you're not using `app/`
  ],
  theme: {
    extend: {}, // Extend Tailwind's theme if desired here
  },
  plugins: [],
};
