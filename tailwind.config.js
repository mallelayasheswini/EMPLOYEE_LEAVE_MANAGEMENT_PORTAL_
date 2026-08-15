/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f0f7ff',
          100: '#e0effe',
          200: '#bae0fd',
          300: '#7cc8fc',
          400: '#36aef8',
          500: '#0c92eb',
          600: '#0074ce',
          700: '#015da7',
          800: '#064f8a',
          900: '#0b4272',
          950: '#072a4b',
        },
        slate: {
          850: '#152033',
          950: '#090d16',
        }
      },
    },
  },
  plugins: [],
};
