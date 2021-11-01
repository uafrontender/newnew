import { DefaultTheme } from 'styled-components';

import media from './media';

// Basic variables, theme-agnostic
const basicTheme: Omit<DefaultTheme, 'colorsThemed' | 'name'> = {
  media,
  borderRadius: {
    small: '8px',
    medium: '16px',
    large: '24px',
  },
  fontSizes: {
    mobileBottomNavigation: '10px',
  },
  colors: {
    primaryWhite: '#FFFFFF',
    primaryDark: '#0B0A13',
    accentBlue: '#1D6AFF',
    accentGreen: '#0FF34F',
    accentPink: '#FF1D6A',
    newnewYellow: '#FFE604',
  },
  shadows: {
    mediumBlue: '0px 12px 35px -10px rgba(29, 124, 255, 0.6)',
  },
  gradients: {
    blue: 'linear-gradient(315deg, rgba(29, 180, 255, 0.85) 0%, rgba(29, 180, 255, 0) 50%), #1D6AFF',
  },
};

export const lightTheme: DefaultTheme = {
  ...basicTheme,
  name: 'light',
  colorsThemed: {
    appBgColor: '#F2F2F2',
    appTextColor: '#0B0A13',
    surface: 'rgba(241, 243, 249, 0.6)',
    surfaceActive: '#4285F4',
    onSurface: '#0B0A13',
    onSurfaceActive: '#FFFFFF',
    appLogoMobile: '#011415',
    navigationBgColor: '#FFFFFF',
    mobileNavigation: '#828282',
    mobileNavigationActive: '#4F4F4F',
  },
};

export const darkTheme: DefaultTheme = {
  ...basicTheme,
  name: 'dark',
  colorsThemed: {
    appBgColor: '#0B0A13',
    appTextColor: '#FFFFFF',
    surface: '#14151F',
    surfaceActive: '#FFFFFF',
    onSurface: '#FFFFFF',
    onSurfaceActive: '#0B0A13',
    appLogoMobile: '#FFFFFF',
    navigationBgColor: '#0B0A13',
    mobileNavigation: '#828282',
    mobileNavigationActive: '#4F4F4F',
  },
};
