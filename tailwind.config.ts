import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#00A67E',
          50: '#E6F9F3',
          100: '#B3EDD9',
          200: '#80E1BF',
          300: '#4DD5A5',
          400: '#26CC92',
          500: '#00A67E',
          600: '#008F6D',
          700: '#00785B',
          800: '#00614A',
          900: '#004A38',
        },
        accent: '#F59E0B',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
}
export default config
