/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx}", // Include all files in the `pages` directory
    "./components/**/*.{js,ts,jsx,tsx}", // Include all files in the `components` directory
    "./app/**/*.{js,ts,jsx,tsx}", // Add support if using the Next.js app directory
  ],
  theme: {
    extend: {}, // Add custom styles here if needed
  },
  plugins: [],
};
