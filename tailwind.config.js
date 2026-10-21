/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#0E1B17', paper: '#F2F5F3', line: '#D3DCD7', muted: '#5A6A64',
        brand: '#0B5D52', gain: '#0A7A45', loss: '#B3261E',
      },
      fontFamily: { sans: ['"IBM Plex Sans"', '"IBM Plex Sans Arabic"', 'system-ui', 'sans-serif'] },
    },
  },
  plugins: [],
};
