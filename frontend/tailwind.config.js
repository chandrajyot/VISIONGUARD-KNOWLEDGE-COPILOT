/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        bgMain: '#080F1C',
        bgSidebar: '#0D1728',
        bgCard: '#111C31',
        borderDark: '#22314A',
        primaryBlue: '#316BFA',
        successGreen: '#20C968',
        warningOrange: '#F59E0B',
        defectRed: '#F04444',
        textPrimary: '#F5F7FB',
        textSecondary: '#91A5C4',
      },
    },
  },
  plugins: [],
}
