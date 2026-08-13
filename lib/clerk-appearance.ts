import { dark } from "@clerk/ui/themes";

const outline = "1px solid var(--border-subtle)";

export const clerkAppearance = {
  theme: dark,
  variables: {
    colorPrimary: "var(--accent-primary)",
    colorPrimaryForeground: "var(--bg-base)",
    colorDanger: "var(--state-error)",
    colorSuccess: "var(--state-success)",
    colorWarning: "var(--state-warning)",
    colorNeutral: "var(--text-primary)",
    colorForeground: "var(--text-primary)",
    colorMuted: "var(--bg-subtle)",
    colorMutedForeground: "var(--text-muted)",
    colorBackground: "var(--bg-surface)",
    colorInput: "var(--bg-elevated)",
    colorInputForeground: "var(--text-primary)",
    colorRing: "var(--accent-primary)",
    colorBorder: "var(--text-faint)",
    colorModalBackdrop: "var(--bg-base)",
    colorShadow: "var(--bg-base)",
    borderRadius: "var(--radius-lg)",
    fontFamily: "var(--font-geist-sans)",
    fontFamilyMono: "var(--font-geist-mono)",
  },
  elements: {
    socialButtonsBlockButton: {
      border: outline,
      backgroundColor: "var(--bg-elevated)",
    },
    socialButtonsIconButton: {
      border: outline,
      backgroundColor: "var(--bg-elevated)",
    },
    dividerLine: {
      backgroundColor: "var(--text-faint)",
    },
    dividerText: {
      color: "var(--text-muted)",
    },
    formFieldInput: {
      border: outline,
    },
  },
};
