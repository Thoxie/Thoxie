/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}", // Include all files in the 'app' directory
    "./pages/**/*.{js,ts,jsx,tsx}", // Include 'pages' directory
    "./components/**/*.{js,ts,jsx,tsx}", // Tailwind scans the components folder
  ],
  theme: {
    extend: {}, // Extend default themes if needed
  },
  plugins: [],
};
