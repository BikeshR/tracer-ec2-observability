// Tracer Color System - Design Tokens
// Use for programmatic color access (charts, dynamic styling, etc.)

export const tracerColors = {
  // Core backgrounds
  background: {
    primary: '#141414',
    secondary: '#1a1a1a', 
    tertiary: '#1f1f1f',
  },
  
  // Borders and dividers
  border: {
    default: '#303030',
    light: '#404040',
  },
  
  // Text hierarchy  
  text: {
    primary: '#f5f5f5',
    secondary: '#a0a0a0', 
    muted: '#6b7280',
  },
  
  // Status colors
  status: {
    success: '#10b981',
    warning: '#f59e0b',
    danger: '#ef4444', 
    info: '#3b82f6',
  },
  
  // Interactive states
  interactive: {
    hover: '#252525',
    active: '#2a2a2a',
    focus: '#3b82f6',
  }
} as const;

// Waste level color mapping
export const wasteColors = {
  low: tracerColors.status.success,
  medium: tracerColors.status.warning, 
  high: tracerColors.status.danger,
} as const;

// Status badge classes (for components)
export const statusClasses = {
  success: 'bg-tracer-success/10 text-tracer-success border-tracer-success/20',
  warning: 'bg-tracer-warning/10 text-tracer-warning border-tracer-warning/20',
  danger: 'bg-tracer-danger/10 text-tracer-danger border-tracer-danger/20',
  info: 'bg-tracer-info/10 text-tracer-info border-tracer-info/20',
} as const;

// Export type for TypeScript
export type WasteLevel = keyof typeof wasteColors;
export type StatusType = keyof typeof statusClasses;