 /** @type {import('tailwindcss').Config} */
export default {
   content: [
    "./src/**/*.{html,js,jsx,ts,tsx}",
    "./index.html",
  ],
   theme: {
     extend: {
  animation: {
    "slide-up": "slideUp 0.3s ease-out",
  },
  keyframes: {
    slideUp: {
      "0%": { opacity: 0, transform: "translateY(20px)" },
      "100%": { opacity: 1, transform: "translateY(0)" },
    },
  },
}
,
   },
   plugins: [],
 };