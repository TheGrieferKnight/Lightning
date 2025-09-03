// tailwind.config.js

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{ts,tsx,js,jsx,html}"],
  theme: {
    extend: {},
  },
  safelist: [
    {
      // dynamic color utilities used by components
      pattern:
        /(bg|text|border)-(red|amber|yellow|blue|indigo|cyan|sky)-(300|400|500|600|700)(\/(20|30|40|50|60))?/,
    },
    {
      pattern: /(bg|border|text)-neutral-(700|800|900)\/(40|50|60|70)?/,
    },
  ],
  plugins: [],
};
