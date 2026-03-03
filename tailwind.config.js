export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                holo: {
                    cyan: '#00f2ff',
                    magenta: '#ff00ff',
                    blue: '#0066ff',
                    deep: '#020617',
                },
                glass: {
                    surface: 'rgba(255, 255, 255, 0.03)',
                    border: 'rgba(255, 255, 255, 0.08)',
                }
            },
            boxShadow: {
                'neon-cyan': '0 0 20px rgba(0, 242, 255, 0.4)',
                'neon-magenta': '0 0 20px rgba(255, 0, 255, 0.4)',
                'glass': '0 8px 32px 0 rgba(0, 0, 0, 0.4)',
            },
            animation: {
                'float': 'float 6s ease-in-out infinite',
                'glow-pulse': 'glow-pulse 4s infinite',
                'spin-slow': 'spin 3s linear infinite',
            },
            keyframes: {
                float: {
                    '0%, 100%': { transform: 'translateY(0)' },
                    '50%': { transform: 'translateY(-12px)' },
                },
                'glow-pulse': {
                    '0%, 100%': { opacity: 0.5, filter: 'blur(10px)' },
                    '50%': { opacity: 0.8, filter: 'blur(15px)' },
                }
            }
        },
    },
    plugins: [],
}
