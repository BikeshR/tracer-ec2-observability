import type { Config } from "tailwindcss";

export default {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Tracer Brand Colors - Semantic Naming
        tracer: {
          // Core backgrounds
          'bg-primary': '#141414',      // Main dark background
          'bg-secondary': '#1a1a1a',    // Card/component backgrounds
          'bg-tertiary': '#1f1f1f',     // Elevated surfaces
          
          // Borders and dividers  
          'border': '#303030',          // Grid lines, borders
          'border-light': '#404040',    // Hover borders
          
          // Text hierarchy
          'text-primary': '#f5f5f5',    // Primary text
          'text-secondary': '#a0a0a0',  // Secondary text
          'text-muted': '#6b7280',      // Muted text
          
          // Status colors (following Tracer's tech aesthetic)
          'success': '#10b981',         // Efficient/good
          'warning': '#f59e0b',         // Medium/caution  
          'danger': '#ef4444',          // High waste/danger
          'info': '#3b82f6',            // Info/neutral
          
          // Interactive states
          'hover': '#252525',           // Hover backgrounds
          'active': '#2a2a2a',          // Active states
          'focus': '#3b82f6',           // Focus rings
        },
        
        // Keep some standard colors for compatibility
        background: 'var(--background)',
        foreground: 'var(--foreground)',
      },
      
      fontFamily: {
        // Tracer brand typography
        sans: [
          'system-ui',
          'Segoe UI', 
          'Roboto',
          'Helvetica',
          'Arial',
          'sans-serif'
        ],
      },
      
      maxWidth: {
        'tracer': '1800px',  // Tracer's max layout width
      },
      
      boxShadow: {
        'tracer': '0 1px 3px 0 rgba(0, 0, 0, 0.3)', // Subtle dark theme shadow
      }
    },
  },
  plugins: [],
} satisfies Config;