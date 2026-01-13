/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                primary: '#4F46E5', // Example: Indigo-600
                secondary: '#64748B', // Example: Slate-500
                accent: '#0EA5E9', // Example: Sky-500
                background: '#F8FAFC', // Slate-50
                surface: '#FFFFFF',
            }
        },
    },
    plugins: [],
}
