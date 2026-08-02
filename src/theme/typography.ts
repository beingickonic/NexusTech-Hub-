export const typography = {
  fontFamily: {
    sans: ['Inter', 'Poppins', 'sans-serif'],
    heading: ['Inter', 'sans-serif'],
    body: ['Inter', 'sans-serif'],
    mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
  },
  fontSize: {
    xs: '0.75rem',
    sm: '0.875rem',
    base: '1rem',
    md: '1.125rem',
    lg: '1.25rem',
    xl: '1.5rem',
    '2xl': '1.875rem',
    '3xl': '2.25rem',
    '4xl': '3rem',
  },
  fontWeight: {
    thin: '100',
    extralight: '200',
    light: '300',
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
    extrabold: '800',
    black: '900',
  },
  lineHeight: {
    tight: '1.25',
    snug: '1.375',
    normal: '1.5',
    relaxed: '1.625',
    loose: '2',
  },
  heading: {
    h1: { fontSize: '2.25rem', fontWeight: '800', lineHeight: '1.2' },
    h2: { fontSize: '1.875rem', fontWeight: '700', lineHeight: '1.25' },
    h3: { fontSize: '1.5rem', fontWeight: '600', lineHeight: '1.3' },
    h4: { fontSize: '1.25rem', fontWeight: '600', lineHeight: '1.4' },
    h5: { fontSize: '1.125rem', fontWeight: '500', lineHeight: '1.45' },
    h6: { fontSize: '1rem', fontWeight: '500', lineHeight: '1.5' },
  },
} as const;

export default typography;