/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        'newyork': ['var(--font-newyork)'],
        'newyork-large': ['var(--font-newyork-large)'],
        'newyork-medium': ['var(--font-newyork-medium)'],
        'newyork-small': ['var(--font-newyork-small)'],
      },
    },
  },
  plugins: [],
} 