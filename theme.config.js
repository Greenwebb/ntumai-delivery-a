/** @type {const} */
const themeColors = {
  // Primary brand color - Teal/Turquoise (from Figma)
  primary: { light: '#00BFA6', dark: '#00BFA6' },
  
  // Backgrounds
  background: { light: '#FFFFFF', dark: '#1A1A2E' },
  surface: { light: '#F8F9FA', dark: '#252542' },
  
  // Text colors
  foreground: { light: '#1A1A2E', dark: '#FFFFFF' },
  muted: { light: '#6B7280', dark: '#9CA3AF' },
  
  // Borders
  border: { light: '#E5E7EB', dark: '#374151' },
  
  // Status colors
  success: { light: '#00C853', dark: '#00E676' },
  warning: { light: '#FF9800', dark: '#FFB74D' },
  error: { light: '#FF5252', dark: '#FF8A80' },
  
  // Accent color (coral/red for emphasis like "doing?" text)
  accent: { light: '#FF6B6B', dark: '#FF8A80' },
};

module.exports = { themeColors };
