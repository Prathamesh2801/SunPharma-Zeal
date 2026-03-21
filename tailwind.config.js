
export default {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],

  theme: {
    extend: {
      // ── Colors ─────────────────────────────────────────────
      colors: {
        // Brand Orange scale
        brand: {
          50: "var(--color-brand-50)",
          100: "var(--color-brand-100)",
          200: "var(--color-brand-200)",
          300: "var(--color-brand-300)",
          400: "var(--color-brand-400)",
          500: "var(--color-brand-500)", // PRIMARY
          600: "var(--color-brand-600)",
          700: "var(--color-brand-700)",
          800: "var(--color-brand-800)",
          900: "var(--color-brand-900)",
          950: "var(--color-brand-950)",
        },

        // Surface / Background
        surface: {
          0: "var(--color-surface-0)",
          50: "var(--color-surface-50)",
          100: "var(--color-surface-100)",
          200: "var(--color-surface-200)",
          300: "var(--color-surface-300)",
          400: "var(--color-surface-400)",
          500: "var(--color-surface-500)",
          600: "var(--color-surface-600)",
          700: "var(--color-surface-700)",
          800: "var(--color-surface-800)",
          900: "var(--color-surface-900)",
        },

        // Ink / Text
        ink: {
          primary: "var(--color-ink-primary)",
          secondary: "var(--color-ink-secondary)",
          tertiary: "var(--color-ink-tertiary)",
          disabled: "var(--color-ink-disabled)",
          inverse: "var(--color-ink-inverse)",
        },

        // Accent — Teal
        "accent-teal": {
          DEFAULT: "var(--color-accent-teal)",
          light: "var(--color-accent-teal-light)",
          subtle: "var(--color-accent-teal-subtle)",
        },

        // Accent — Gold
        "accent-gold": {
          DEFAULT: "var(--color-accent-gold)",
          light: "var(--color-accent-gold-light)",
          subtle: "var(--color-accent-gold-subtle)",
        },

        // Semantic
        success: {
          DEFAULT: "var(--color-success)",
          subtle: "var(--color-success-subtle)",
        },
        warning: {
          DEFAULT: "var(--color-warning)",
          subtle: "var(--color-warning-subtle)",
        },
        error: {
          DEFAULT: "var(--color-error)",
          subtle: "var(--color-error-subtle)",
        },
        info: {
          DEFAULT: "var(--color-info)",
          subtle: "var(--color-info-subtle)",
        },
      },

      // ── Typography ──────────────────────────────────────────
      fontFamily: {
        display: ["var(--font-display)"],
        body: ["var(--font-body)"],
        mono: ["var(--font-mono)"],
      },

      // ── Border Radius ───────────────────────────────────────
      borderRadius: {
        xs: "var(--radius-xs)",
        sm: "var(--radius-sm)",
        md: "var(--radius-md)",
        lg: "var(--radius-lg)",
        xl: "var(--radius-xl)",
        "2xl": "var(--radius-2xl)",
        full: "var(--radius-full)",
      },

      // ── Box Shadow ──────────────────────────────────────────
      boxShadow: {
        sm: "var(--shadow-sm)",
        card: "var(--shadow-card)",
        hover: "var(--shadow-hover)",
        glow: "var(--shadow-glow)",
      },

      // ── Transition ──────────────────────────────────────────
      transitionDuration: {
        fast: "100ms",
        base: "150ms",
        slow: "250ms",
      },

      // ── Spacing extras (on top of Tailwind defaults) ────────
      spacing: {
        4.5: "1.125rem", // 18px — handy mid-step
        13: "3.25rem",
        18: "4.5rem",
        22: "5.5rem",
        30: "7.5rem",
      },

      // ── Font Size (display additions) ───────────────────────
      fontSize: {
        "2xs": ["0.625rem", { lineHeight: "1rem" }], // 10px
        "6xl": ["3.75rem", { lineHeight: "1" }], // 60px
        "7xl": ["4.5rem", { lineHeight: "1" }], // 72px
      },
    },
  },

  plugins: [],
};
