const daisyUI = require("daisyui");

module.exports = {
  content: ["./index.html", "./src/**/*.{vue,js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      colors: {
        brand: {
          orange: '#FF6B35',
          navy: '#131921',
          navyLight: '#232F3E',
          teal: '#007185',
          yellow: '#FFA41C',
          bg: '#EAEDED',
        }
      }
    },
  },
  plugins: [
    daisyUI,
  ],
  daisyui: {
    themes: [
      {
        shophub: {
          "primary": "#FF6B35",
          "primary-content": "#ffffff",
          "secondary": "#007185",
          "secondary-content": "#ffffff",
          "accent": "#FFA41C",
          "accent-content": "#0F1111",
          "neutral": "#232F3E",
          "neutral-content": "#ffffff",
          "base-100": "#ffffff",
          "base-200": "#F3F4F6",
          "base-300": "#E5E7EB",
          "base-content": "#0F1111",
          "info": "#3ABFF8",
          "success": "#36D399",
          "warning": "#FBBD23",
          "error": "#F87272",
        },
      },
    ],
    darkTheme: false,
  },
};
