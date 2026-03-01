// Theme color palette - Customize these values
export const themeColors = {
  // Primary colors
  primary: {
    main: '#1976d2',
    light: '#42a5f5',
    dark: '#1565c0',
    contrastText: '#ffffff',
  },
  // Secondary colors
  secondary: {
    main: '#9c27b0',
    light: '#ba68c8',
    dark: '#7b1fa2',
    contrastText: '#ffffff',
  },
  // Accent colors
  accent: {
    success: '#2e7d32',
    warning: '#ed6c02',
    error: '#d32f2f',
    info: '#0288d1',
  },
  // Node colors for flow builder
  nodes: {
    memory: '#8e24aa',
    orchestrator: '#1565c0',
    faqSpecialist: '#2e7d32',
    genericResponse: '#ed6c02',
    response: '#d32f2f',
  },
  // Background colors
  background: {
    default: '#f5f5f5',
    paper: '#ffffff',
    dark: '#121212',
    darkPaper: '#1e1e1e',
  },
  // Text colors
  text: {
    primary: '#212121',
    secondary: '#757575',
    disabled: '#9e9e9e',
    dark: {
      primary: '#ffffff',
      secondary: '#b0b0b0',
    },
  },
  // Chat colors
  chat: {
    userBubble: '#1976d2',
    assistantBubble: '#f5f5f5',
    userText: '#ffffff',
    assistantText: '#212121',
  },
};

export type ThemeColors = typeof themeColors;
