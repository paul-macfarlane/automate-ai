# Automanager Theming Guide

This guide outlines the theming approach for Automanager to ensure consistent styling across the application.

## Theme Variables

Automanager uses CSS variables defined in `src/app/globals.css` to maintain a consistent theme. These variables support both light and dark modes automatically.

### Core Color Variables

| Variable Name               | Purpose                                 |
| --------------------------- | --------------------------------------- |
| `bg-background`             | Main background color                   |
| `text-foreground`           | Main text color                         |
| `bg-card`                   | Card background color                   |
| `text-card-foreground`      | Text color for cards                    |
| `bg-primary`                | Primary brand color                     |
| `text-primary-foreground`   | Text color on primary elements          |
| `bg-secondary`              | Secondary/alternative UI color          |
| `text-secondary-foreground` | Text color on secondary elements        |
| `bg-muted`                  | Muted background for subtle UI elements |
| `text-muted-foreground`     | Subdued text color                      |
| `bg-accent`                 | Accent color for hover states           |
| `text-accent-foreground`    | Text color on accent elements           |
| `border-border`             | Border color                            |

### Chart/Data Visualization Colors

For data visualizations, use these variables:

- `bg-chart-1` through `bg-chart-5`

## Dark Mode

Automanager supports system preference detection, light mode, and dark mode. The implementation uses:

1. **next-themes** - For theme management
2. **CSS Variables** - For applying different colors based on the theme
3. **ThemeProvider** - Wraps the application to provide theme context
4. **ThemeToggle** - UI component to switch between themes

### How it works

- Theme settings are saved to localStorage
- A script in the document head prevents flash of incorrect theme
- Default is set to follow the system preference
- Users can manually select light/dark/system from the theme toggle

### Adding Dark Mode to New Pages

All pages are automatically dark mode compatible when using the theme CSS variables. Just ensure:

1. Always include the `<ThemeToggle />` component in the page navigation
2. Use theme variables for colors (avoid hardcoded colors)

## Usage Guidelines

1. **Always use theme variables** instead of hardcoded colors:

   - ✅ `className="bg-background text-foreground"`
   - ❌ `className="bg-white dark:bg-gray-900 text-black dark:text-white"`

2. **For text colors**:

   - Main text: `text-foreground`
   - Secondary/subdued text: `text-muted-foreground`
   - Text on colored backgrounds: use the appropriate `*-foreground` variable

3. **For backgrounds**:

   - Main background: `bg-background`
   - Card backgrounds: `bg-card`
   - Subtle/secondary backgrounds: `bg-muted` or `bg-secondary`

4. **For borders**:

   - Use `border border-border` for standard borders

5. **For interactive elements**:
   - Primary actions: `bg-primary text-primary-foreground`
   - Secondary actions: `bg-secondary text-secondary-foreground`
   - Subtle actions: `bg-accent text-accent-foreground`

## Component Examples

```tsx
// Card example
<div className="bg-card text-card-foreground p-6 rounded-lg border border-border">
  <h3 className="text-xl font-semibold">Card Title</h3>
  <p className="text-muted-foreground">Card content goes here</p>
  <Button>Primary Action</Button>
</div>

// Section example
<section className="bg-muted py-12">
  <div className="container mx-auto">
    <h2 className="text-2xl font-bold text-foreground">Section Title</h2>
    <p className="text-muted-foreground">Section content</p>
  </div>
</section>
```

## shadcn/ui Components

shadcn/ui components already use theme variables, so no additional styling is needed for basic usage. When customizing, follow the same guidelines to maintain consistency.
