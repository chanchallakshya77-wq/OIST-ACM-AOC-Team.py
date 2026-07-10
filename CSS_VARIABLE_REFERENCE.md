# CSS Variable Reference Guide
**For**: AI Bureaucracy Agent - Document Validation & Component Styling
**Version**: 1.0
**Last Updated**: July 11, 2026

## Design System Variables (`:root`)

All styling in the application uses a centralized design system defined in `src/ui/styles/index.css`.

### Color Variables
Must use the `--color-` prefix. These are defined in `:root` and automatically adapt for light/dark mode.

```css
/* Primary & Branding */
--color-primary: #2563eb;           /* Main brand blue */
--color-primary-hover: #1d4ed8;     /* Darker blue on hover */

/* Status Colors */
--color-success: #16a34a;           /* Green - for approved/success states */
--color-warning: #ea580c;           /* Orange - for warnings/attention */
--color-error: #dc2626;             /* Red - for errors/rejections */
--color-info: #0891b2;              /* Cyan - for information */

/* Semantic Colors */
--color-secondary: #64748b;         /* Secondary/muted action color */

/* Neutral Palette */
--color-bg: #ffffff;                /* Main background (light mode) */
--color-surface: #f8fafc;           /* Card/section background */
--color-border: #e2e8f0;            /* Borders, dividers */
--color-text: #1e293b;              /* Primary text color */
--color-text-secondary: #64748b;    /* Secondary text, labels */
--color-text-muted: #94a3b8;        /* Muted text, hints */
```

### Dark Mode
The same variables are automatically updated via `@media (prefers-color-scheme: dark)`:

```css
@media (prefers-color-scheme: dark) {
  :root {
    --color-bg: #0f172a;            /* Dark navy background */
    --color-surface: #1e293b;       /* Slightly lighter surface */
    --color-border: #334155;        /* Lighter border for contrast */
    --color-text: #f1f5f9;          /* Light text */
    --color-text-secondary: #cbd5e1;/* Lighter secondary text */
    --color-text-muted: #94a3b8;    /* Unchanged muted */
  }
}
```

### Typography Variables
```css
--font-sans: system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif;
--font-mono: ui-monospace, 'Cascadia Code', 'Source Code Pro', monospace;
```

### Spacing Scale
```css
--space-1: 0.25rem;     /* 4px */
--space-2: 0.5rem;      /* 8px */
--space-3: 0.75rem;     /* 12px */
--space-4: 1rem;        /* 16px */
--space-6: 1.5rem;      /* 24px */
--space-8: 2rem;        /* 32px */
--space-12: 3rem;       /* 48px */
```

### Border Radius
```css
--radius-sm: 0.25rem;   /* 4px */
--radius-md: 0.375rem;  /* 6px */
--radius-lg: 0.5rem;    /* 8px */
--radius-xl: 0.75rem;   /* 12px */
```

### Shadow Scales
```css
--shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
--shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
--shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
```

## Correct Usage Examples

### ✅ CORRECT - Using Full Variable Names
```css
.my-component {
  color: var(--color-text);
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  padding: var(--space-4);
}

.button {
  background: var(--color-primary);
  color: white;
}

.button:hover {
  background: var(--color-primary-hover);
}

.label {
  color: var(--color-text-secondary);
  font-size: 0.875rem;
}
```

### ❌ INCORRECT - Shorthand Names (DON'T DO THIS)
```css
/* These variables don't exist and will render as transparent/invisible */
.my-component {
  color: var(--text);              /* ❌ WRONG - use --color-text */
  background: var(--surface);      /* ❌ WRONG - use --color-surface */
  border: 1px solid var(--border); /* ❌ WRONG - use --color-border */
}

.button {
  background: var(--primary);      /* ❌ WRONG - use --color-primary */
}

.label {
  color: var(--text-secondary);    /* ❌ WRONG - use --color-text-secondary */
}
```

## Component Styling Best Practices

### 1. Use Design System Colors for All Components
```css
.document-card {
  border: 1px solid var(--color-border);      /* ✅ Correct */
  background: var(--color-surface);
  color: var(--color-text);
}
```

### 2. For Status Badges
```css
.badge.mandatory {
  background: var(--color-error);             /* Red for required */
  color: white;
}

.badge.optional {
  background: var(--color-secondary);         /* Gray for optional */
  color: white;
}
```

### 3. For Interactive Elements
```css
.btn-primary {
  background: var(--color-primary);
}

.btn-primary:hover {
  background: var(--color-primary-hover);
}

.btn-secondary {
  background: var(--color-surface);
  color: var(--color-text);
  border: 1px solid var(--color-border);
}
```

### 4. For Form Inputs
```css
.form-input {
  border: 1px solid var(--color-border);
  color: var(--color-text);
  background: var(--color-bg);
}

.form-input:focus {
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
}
```

### 5. For Text Hierarchy
```css
h1 { color: var(--color-text); }               /* Primary text */
.subtitle { color: var(--color-text-secondary); }   /* Secondary text */
.help-text { color: var(--color-text-muted); }      /* Muted text */
```

## Components Currently Using Design System

✅ **Application Tracker** - `.application-card`, `.tracker-filters`, etc.
✅ **Status Timeline** - `.timeline-*`, `.timeline-marker`, etc.
✅ **Document Requirements** - `.document-requirement-card`, `.requirement-*`, etc.
✅ **Modal** - `.modal-*` classes
✅ **Buttons** - `.btn-*` classes
✅ **Forms** - `.form-*` classes
✅ **Layout** - `.sidebar`, `.card`, `.content-*` classes
✅ **Phase Indicator** - `.phase-*` classes

## Testing Your Changes

### Step 1: Make CSS Change
```css
.my-new-component {
  color: var(--color-text-secondary);
  border: 1px solid var(--color-border);
  /* Use FULL variable names with --color- prefix */
}
```

### Step 2: Build
```bash
npm run build
```

### Step 3: Verify Compilation
Look for: `✓ built in X.XXs` (not errors)

### Step 4: Test in Browser
- Open in light mode - colors should be visible
- Toggle to dark mode - colors should adapt automatically
- Inspect element in DevTools - should show actual color values, not "undefined"

## Troubleshooting

### Issue: Component appears invisible or colors aren't showing
**Cause**: Using shorthand variable names like `--border`, `--primary`, `--text`
**Fix**: Use full names with `--color-` prefix: `--color-border`, `--color-primary`, `--color-text`

### Issue: Build fails with CSS errors
**Cause**: May be unrelated - check TypeScript output first
**Fix**: Run `npm run build` and check error messages

### Issue: Dark mode colors don't change
**Cause**: CSS variables are defined but may not be applied
**Fix**: Ensure you're using `var(--color-*)` and not hardcoded colors

### Issue: Hover states don't work
**Cause**: Check if using correct hover variable like `--color-primary-hover`
**Fix**: Use dedicated `*-hover` variables for interactive states

## Adding New Styles

When adding new component styles:

1. **Always check if color already exists in `:root`**
   - Search for similar colors before adding new ones
   - Reuse existing semantic colors

2. **Use the full variable name**
   ```css
   /* Good */
   .new-component { color: var(--color-text-secondary); }
   
   /* Bad */
   .new-component { color: var(--text-secondary); }
   ```

3. **Build and test**
   ```bash
   npm run build
   npm run preview
   ```

4. **Verify in both light and dark modes**

## File Locations
- **Design System Definition**: `src/ui/styles/index.css` (lines 1-50)
- **Component Styles**: `src/ui/styles/index.css` (lines 51+)
- **Dark Mode Override**: `src/ui/styles/index.css` (lines 52-62)

---

**Last known working version**: v4.4.0 with all 22 CSS variable fixes applied
