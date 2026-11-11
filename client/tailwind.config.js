export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        sage: { DEFAULT: '#87977A', light: '#a0b090', dark: '#6b7a60' },
        forest: { DEFAULT: '#263C32', light: '#3a5a4a', dark: '#1a2b23' },
        ivory: { DEFAULT: '#F8F5EC', dark: '#ede9db' },
        beige: { DEFAULT: '#E9E0D0', dark: '#d4c9b5' },
        terracotta: { DEFAULT: '#B97860', light: '#cc9980', dark: '#9a6248' },
        charcoal: { DEFAULT: '#292B27', light: '#3f4139' },
      },
      fontFamily: {
        serif: ['"Playfair Display"', 'Georgia', 'serif'],
        sans: ['"DM Sans"', 'Inter', 'system-ui', 'sans-serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.6s ease-out',
        'slide-up': 'slideUp 0.5s ease-out',
      },
      keyframes: {
        fadeIn: { from: { opacity: '0' }, to: { opacity: '1' } },
        slideUp: { from: { opacity: '0', transform: 'translateY(20px)' }, to: { opacity: '1', transform: 'translateY(0)' } },
      },
    },
  },
  plugins: [],
};
