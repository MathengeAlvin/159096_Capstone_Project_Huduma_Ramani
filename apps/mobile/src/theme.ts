// Glovo Brand Color Palette & Design Tokens
// Inspired by Glovo's signature vibrant yellow, crisp white, deep charcoal, and teal accents.

export const GlovoTheme = {
  colors: {
    // Primary Glovo Yellow
    primary: "#FFC244",
    primaryHover: "#F5B42E",
    primaryLight: "#FFF7E0",
    primarySoft: "#FFFBEB",

    // Secondary Glovo Teal-Green
    secondary: "#00A082",
    secondaryHover: "#008B71",
    secondaryLight: "#E6F6F3",

    // Backgrounds & Surfaces
    white: "#FFFFFF",
    background: "#F8F9FA",
    backgroundAlt: "#FFFDF7",
    surface: "#FFFFFF",

    // Typography
    textDark: "#1E1E1E",
    textPrimary: "#202124",
    textSecondary: "#4B5563",
    textMuted: "#9CA3AF",
    textLight: "#FFFFFF",

    // Borders & Dividers
    border: "#F0F0F0",
    borderLight: "#F3F4F6",
    borderYellow: "#FDE68A",
    borderDark: "#E5E7EB",

    // Semantic Accents
    star: "#F59E0B",
    danger: "#EF4444",
    success: "#10B981",
  },

  borderRadius: {
    xs: 6,
    sm: 10,
    md: 14,
    lg: 18,
    xl: 24,
    pill: 9999,
  },

  shadows: {
    soft: {
      shadowColor: "#000000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.06,
      shadowRadius: 8,
      elevation: 2,
    },
    medium: {
      shadowColor: "#000000",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.08,
      shadowRadius: 12,
      elevation: 4,
    },
    glowYellow: {
      shadowColor: "#FFC244",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.35,
      shadowRadius: 10,
      elevation: 5,
    },
  },
};

