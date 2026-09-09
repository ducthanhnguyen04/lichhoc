import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        piggy: {
          50: '#fff0f5',
          100: '#ffe3ec',
          200: '#ffc2d1',
          300: '#ffb3c1',
          400: '#ff8fa3',
          500: '#ff758f',
          600: '#ff4d6d',
          700: '#c9184a',
          800: '#800f2f',
          900: '#590d22',
        },
        strawberry: {
          50: '#fff5f7',
          100: '#ffe3e8',
          200: '#ffccd5',
          300: '#ffa3b5',
          400: '#ff758f',
          500: '#ff4d6d',
          600: '#e01e37',
        },
        cream: {
          50: '#fffdfa',
          100: '#fff9f2',
          200: '#fff0e1',
          800: '#2d2226',
          900: '#1a1014',
        }
      },
      borderRadius: {
        '4xl': '2rem',
        '5xl': '2.5rem',
      },
    },
  },
  plugins: [],
};
export default config;
