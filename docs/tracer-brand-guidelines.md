# Tracer Brand Guidelines

*Extracted from https://www.tracer.cloud/ for dashboard design consistency*

## Brand Overview

Tracer positions itself as a high-tech, precision-focused platform targeting scientific computing and cloud infrastructure professionals. The brand aesthetic emphasizes minimalism, technical sophistication, and data-driven insights.

## Color Palette

### Primary Colors
- **Background Dark**: `#141414` (Charcoal black)
- **Border/Grid Lines**: `#303030` (Dark gray)
- **Gradient**: Linear gradient using black with transparency

### Recommended Dashboard Colors
Based on the dark-first approach:
- **Primary Background**: `#141414`
- **Card/Component Background**: `#1a1a1a` or `#1f1f1f`
- **Border/Divider**: `#303030`
- **Text Primary**: `#ffffff` or `#f5f5f5`
- **Text Secondary**: `#a0a0a0` or `#8a8a8a`

### Accent Colors (Inferred)
Since Tracer uses a dark theme, suggested accent colors for data visualization:
- **Success/Efficient**: `#10b981` (Green)
- **Warning/Medium**: `#f59e0b` (Amber) 
- **Danger/High Waste**: `#ef4444` (Red)
- **Info/Neutral**: `#3b82f6` (Blue)

## Typography

### Font Stack
```css
font-family: "system-ui", "Segoe UI", "Roboto", "Helvetica", "Arial", sans-serif;
```

### Font Weights
- **Regular**: 400
- **Medium**: 500
- **Semibold**: 600 (recommended for headings)
- **Bold**: 700 (for emphasis)

### Typography Scale
- **H1**: 2.5rem (40px) - Main page titles
- **H2**: 2rem (32px) - Section headings
- **H3**: 1.5rem (24px) - Subsection titles
- **Body**: 1rem (16px) - Regular text
- **Small**: 0.875rem (14px) - Secondary text, labels
- **Caption**: 0.75rem (12px) - Metadata, timestamps

## Logo & Branding

### Logo Asset
- **File**: `tracer-logo.png`
- **Variants**: White/transparent for dark backgrounds
- **Usage**: Clean, minimal presentation

### Visual Motifs
- **Spacecraft imagery** - Represents precision and advanced technology
- **Grid systems** - Technical, data-oriented aesthetic
- **Minimal geometric shapes** - Clean, professional appearance

## Design Principles

### Layout
- **Max Width**: 1800px for large screens
- **Grid System**: Responsive with consistent vertical rhythm
- **Spacing**: Clean margins and padding that scale with screen size
- **Borders**: Subtle vertical lines (`#303030`) for section separation

### Component Styling
- **Cards**: Dark backgrounds with subtle borders
- **Buttons**: Minimal, high-contrast design
- **Navigation**: Clean with hover states
- **Tables**: Dark theme with alternating row highlights
- **Forms**: Dark inputs with focused states

### Information Hierarchy
- High contrast text on dark backgrounds
- Clear visual separation between sections
- Emphasis on data readability
- Minimal but purposeful visual elements

## Dashboard-Specific Recommendations

### EC2 Table Styling
```css
background: #1a1a1a;
border: 1px solid #303030;
color: #f5f5f5;
```

### Status Indicators
- **Running**: Green accent (`#10b981`)
- **Stopped**: Gray (`#6b7280`)
- **Warning**: Amber (`#f59e0b`)

### Waste Level Indicators
- **Low (Efficient)**: `#10b981` green
- **Medium**: `#f59e0b` amber
- **High (Wasteful)**: `#ef4444` red

## Implementation Notes

### Dark Mode First
- Design primarily for dark theme
- Ensure high contrast ratios for accessibility
- Use subtle backgrounds to avoid eye strain

### Technical Aesthetic
- Embrace data-dense layouts
- Use monospace fonts for code/IDs
- Grid-based alignment
- Minimal decorative elements

### Responsive Design
- Mobile-first approach
- Consistent spacing scale
- Readable typography at all sizes
- Touch-friendly interactive elements

## Assets Needed

1. **Favicon**: Extract or recreate Tracer logo for browser tab
2. **Logo SVG**: Vector version for header/branding
3. **Color Swatches**: Confirm exact hex values from live site
4. **Font Loading**: Verify optimal font loading strategy

## Next Steps

1. Extract actual favicon from tracer.cloud
2. Implement dark theme CSS variables
3. Update component styling to match brand
4. Test accessibility and contrast ratios
5. Validate with Tracer team if possible

---

*This guide is based on public website analysis and should be validated with official Tracer brand guidelines if available.*