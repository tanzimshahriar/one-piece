import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    screens: {
      sm: '640px',
      md: '820px',
      lg: '1080px',
      xl: '1320px',
      '2xl': '1600px',
    },
    extend: {
      colors: {
        paper: {
          DEFAULT: 'rgb(var(--paper-rgb) / <alpha-value>)',
          2: 'rgb(var(--paper-2-rgb) / <alpha-value>)',
          3: 'rgb(var(--paper-3-rgb) / <alpha-value>)',
        },
        ink: {
          DEFAULT: 'rgb(var(--ink-rgb) / <alpha-value>)',
          2: 'rgb(var(--ink-2-rgb) / <alpha-value>)',
          soft: 'rgb(var(--ink-soft-rgb) / <alpha-value>)',
        },
        red: { DEFAULT: 'rgb(var(--red-rgb) / <alpha-value>)', deep: 'rgb(var(--red-deep-rgb) / <alpha-value>)' },
        straw: { DEFAULT: 'rgb(var(--straw-rgb) / <alpha-value>)', deep: 'rgb(var(--straw-deep-rgb) / <alpha-value>)' },
        sea: {
          DEFAULT: 'rgb(var(--sea-rgb) / <alpha-value>)',
          deep: 'rgb(var(--sea-deep-rgb) / <alpha-value>)',
          light: 'rgb(var(--sea-light-rgb) / <alpha-value>)',
        },
        parchment: 'rgb(var(--parchment-rgb) / <alpha-value>)',
      },
      fontFamily: {
        display: ['var(--font-display)', 'system-ui', 'sans-serif'],
        serif: ['var(--font-serif)', 'Georgia', 'serif'],
        sans: ['var(--font-sans)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-mono)', 'ui-monospace', 'monospace'],
      },
      maxWidth: {
        page: '1480px',
      },
      transitionTimingFunction: {
        punch: 'cubic-bezier(.2,1.4,.3,1)',
        silk: 'cubic-bezier(.7,0,.2,1)',
      },
    },
  },
  plugins: [],
};

export default config;
