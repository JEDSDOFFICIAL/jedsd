// Modern Email Design System for JEDSD
// Beautiful, responsive email templates with professional styling

export const emailColors = {
  // Primary brand colors
  primary: '#2563eb',
  primaryDark: '#1d4ed8',
  primaryLight: '#3b82f6',
  
  // Secondary colors
  secondary: '#10b981',
  secondaryDark: '#059669',
  secondaryLight: '#34d399',
  
  // Status colors
  success: '#059669',
  warning: '#d97706',
  error: '#dc2626',
  info: '#2563eb',
  
  // Neutral colors
  gray50: '#f9fafb',
  gray100: '#f3f4f6',
  gray200: '#e5e7eb',
  gray300: '#d1d5db',
  gray400: '#9ca3af',
  gray500: '#6b7280',
  gray600: '#4b5563',
  gray700: '#374151',
  gray800: '#1f2937',
  gray900: '#111827',
  
  // Background colors
  backgroundPrimary: '#ffffff',
  backgroundSecondary: '#f8fafc',
  backgroundAccent: '#eff6ff',
  
  // Text colors
  textPrimary: '#1f2937',
  textSecondary: '#6b7280',
  textMuted: '#9ca3af',
  textWhite: '#ffffff',
};

export const emailFonts = {
  primary: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  secondary: '"Inter", sans-serif',
  mono: '"SF Mono", "Monaco", "Inconsolata", "Roboto Mono", monospace',
};

export const emailSpacing = {
  xs: '4px',
  sm: '8px',
  md: '16px',
  lg: '24px',
  xl: '32px',
  '2xl': '48px',
  '3xl': '64px',
};

export const emailBorderRadius = {
  sm: '4px',
  md: '8px',
  lg: '12px',
  xl: '16px',
  '2xl': '24px',
  full: '9999px',
};

export const emailShadows = {
  sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
  md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
  lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
  xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
};

// Reusable style objects
export const emailStyles = {
  container: {
    maxWidth: '600px',
    margin: '0 auto',
    backgroundColor: emailColors.backgroundSecondary,
    fontFamily: emailFonts.primary,
  },
  
  card: {
    backgroundColor: emailColors.backgroundPrimary,
    borderRadius: emailBorderRadius.xl,
    boxShadow: emailShadows.lg,
    padding: emailSpacing['2xl'],
    margin: emailSpacing.lg,
  },
  
  header: {
    textAlign: 'center' as const,
    paddingBottom: emailSpacing.xl,
    borderBottom: `2px solid ${emailColors.gray100}`,
    marginBottom: emailSpacing.xl,
  },
  
  logo: {
    fontSize: '32px',
    fontWeight: '700',
    color: emailColors.primary,
    marginBottom: emailSpacing.md,
  },
  
  subtitle: {
    fontSize: '16px',
    color: emailColors.textSecondary,
    margin: '0',
  },
  
  heading: {
    fontSize: '28px',
    fontWeight: '700',
    color: emailColors.textPrimary,
    textAlign: 'center' as const,
    margin: `0 0 ${emailSpacing.lg} 0`,
    lineHeight: '1.2',
  },
  
  subheading: {
    fontSize: '20px',
    fontWeight: '600',
    color: emailColors.textPrimary,
    margin: `${emailSpacing.xl} 0 ${emailSpacing.md} 0`,
  },
  
  text: {
    fontSize: '16px',
    lineHeight: '1.6',
    color: emailColors.textSecondary,
    margin: `0 0 ${emailSpacing.md} 0`,
  },
  
  textMuted: {
    fontSize: '14px',
    lineHeight: '1.5',
    color: emailColors.textMuted,
    margin: `0 0 ${emailSpacing.sm} 0`,
  },
  
  buttonPrimary: {
    backgroundColor: emailColors.primary,
    color: emailColors.textWhite,
    padding: `${emailSpacing.md} ${emailSpacing.xl}`,
    borderRadius: emailBorderRadius.md,
    textDecoration: 'none',
    fontWeight: '600',
    fontSize: '16px',
    display: 'inline-block',
    margin: emailSpacing.sm,
    border: 'none',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  
  buttonSecondary: {
    backgroundColor: emailColors.gray100,
    color: emailColors.textPrimary,
    padding: `${emailSpacing.md} ${emailSpacing.xl}`,
    borderRadius: emailBorderRadius.md,
    textDecoration: 'none',
    fontWeight: '600',
    fontSize: '16px',
    display: 'inline-block',
    margin: emailSpacing.sm,
    border: `1px solid ${emailColors.gray200}`,
    cursor: 'pointer',
  },
  
  buttonSuccess: {
    backgroundColor: emailColors.success,
    color: emailColors.textWhite,
    padding: `${emailSpacing.md} ${emailSpacing.xl}`,
    borderRadius: emailBorderRadius.md,
    textDecoration: 'none',
    fontWeight: '600',
    fontSize: '16px',
    display: 'inline-block',
    margin: emailSpacing.sm,
    border: 'none',
  },
  
  alertSuccess: {
    backgroundColor: '#f0fdf4',
    border: `1px solid #bbf7d0`,
    borderLeft: `4px solid ${emailColors.success}`,
    borderRadius: emailBorderRadius.md,
    padding: emailSpacing.lg,
    margin: `${emailSpacing.lg} 0`,
  },
  
  alertWarning: {
    backgroundColor: '#fffbeb',
    border: `1px solid #fed7aa`,
    borderLeft: `4px solid ${emailColors.warning}`,
    borderRadius: emailBorderRadius.md,
    padding: emailSpacing.lg,
    margin: `${emailSpacing.lg} 0`,
  },
  
  alertError: {
    backgroundColor: '#fef2f2',
    border: `1px solid #fecaca`,
    borderLeft: `4px solid ${emailColors.error}`,
    borderRadius: emailBorderRadius.md,
    padding: emailSpacing.lg,
    margin: `${emailSpacing.lg} 0`,
  },
  
  alertInfo: {
    backgroundColor: '#eff6ff',
    border: `1px solid #bfdbfe`,
    borderLeft: `4px solid ${emailColors.info}`,
    borderRadius: emailBorderRadius.md,
    padding: emailSpacing.lg,
    margin: `${emailSpacing.lg} 0`,
  },
  
  detailsBox: {
    backgroundColor: emailColors.gray50,
    border: `1px solid ${emailColors.gray200}`,
    borderRadius: emailBorderRadius.lg,
    padding: emailSpacing.lg,
    margin: `${emailSpacing.lg} 0`,
  },
  
  footer: {
    textAlign: 'center' as const,
    paddingTop: emailSpacing.xl,
    borderTop: `1px solid ${emailColors.gray200}`,
    marginTop: emailSpacing.xl,
  },
  
  footerText: {
    fontSize: '12px',
    color: emailColors.textMuted,
    lineHeight: '1.5',
    margin: `${emailSpacing.sm} 0`,
  },
  
  badge: {
    display: 'inline-block',
    padding: `${emailSpacing.xs} ${emailSpacing.sm}`,
    borderRadius: emailBorderRadius.full,
    fontSize: '12px',
    fontWeight: '600',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.5px',
  },
  
  badgeSuccess: {
    backgroundColor: '#dcfce7',
    color: '#166534',
  },
  
  badgeWarning: {
    backgroundColor: '#fef3c7',
    color: '#92400e',
  },
  
  badgeError: {
    backgroundColor: '#fee2e2',
    color: '#991b1b',
  },
  
  badgeInfo: {
    backgroundColor: '#dbeafe',
    color: '#1e40af',
  },
};
