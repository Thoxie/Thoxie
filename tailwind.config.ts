/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}", // Include all files in the app directory
    "./pages/**/*.{js,ts,jsx,tsx}", // Include all files in the pages directory
    "./components/**/*.{js,ts,jsx,tsx}", // Include components directory
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};
