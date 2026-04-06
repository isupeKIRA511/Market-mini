/** @type {import('tailwindcss').Config} */
export default {
    content: ['./src/**/*.{html,js,svelte,ts}'],
    theme: {
      extend: {
        colors: {
            "primary": "#FAC445",
            "on-primary": "#1D1B1C",
            "primary-container": "#FFD54F",
            "on-primary-container": "#312B1B",
            "secondary": "#312B1B",
            "on-secondary": "#FFFFFF",
            "secondary-container": "#e0c389",
            "on-secondary-container": "#261a00",
            "tertiary": "#00677e",
            "on-tertiary": "#ffffff",
            "background": "#fef8f9",
            "on-background": "#1D1B1C",
            "surface": "#fef8f9",
            "on-surface": "#1D1B1C",
            "surface-variant": "#f3eced",
            "on-surface-variant": "#4f4635",
            "outline": "#817662",
            "outline-variant": "#d2c5ae",
            "surface-container-lowest": "#ffffff",
            "surface-container-low": "#f8f2f3",
            "surface-container": "#f3eced",
            "surface-container-high": "#ede7e8",
            "surface-container-highest": "#e7e1e2",
            "error": "#ba1a1a",
            "on-error": "#ffffff",
            "error-container": "#ffdad6",
            "on-error-container": "#93000a"
        },
        fontFamily: {
          sans: ['Inter', 'SF Pro', 'sans-serif'],
        },
        screens: {
          mobile: { min: '375px', max: '430px' },
        },
      },
    },
    plugins: [],
  }
