/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        navy: '#080d1d',
        panel: '#10172d',
        panel2: '#151e38',
        cyan: '#00f5d4',
        electric: '#4cc9ff',
        violet: '#8b5cf6',
      },
      boxShadow: {
        glow: '0 0 32px rgba(0,245,212,.12)',
      },
    },
  },
  plugins: [],
};
