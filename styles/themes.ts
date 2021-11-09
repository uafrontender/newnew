import { DefaultTheme } from 'styled-components';

import media from './media';

// Basic variables, theme-agnostic
const basicTheme: Omit<DefaultTheme, 'colorsThemed' | 'name' | 'gradients' | 'shadows'> = {
  media,
  width: {
    maxContentWidth: 1440,
  },
  colors: {
    white: '#FFFFFF',
    black: '#000000',
    blue: '#2955EC',
  },
  borderRadius: {
    small: '8px',
    medium: '16px',
    large: '24px',
    xxxLarge: '48px',
  },
};

export const lightTheme: DefaultTheme = {
  ...basicTheme,
  name: 'light',
  colorsThemed: {
    grayscale: {
      background1: '#FFFFFF',
      background2: '#F1F3F9',
      background3: '#F1F3F9',
      backgroundT: 'transparent',
      outlines1: '#E5E9F1',
      outlines2: '#8B99B2',
    },
    text: {
      primary: '#2C2C33',
      secondary: '#646E81',
      tertiary: '#909AAD',
      quaternary: '#B3BBCA',
    },
    accent: {
      blue: '#1D6AFF',
      pink: '#FF1D6A',
      yellow: '#FFE604',
      green: '#0FF34F',
      error: '#F12C46',
      success: '#15B981',
    },
    social: {
      google: {
        main: '#4285F4',
        hover: '#4285F4',
        pressed: 'linear-gradient(0deg, rgba(11, 10, 19, 0.2), rgba(11, 10, 19, 0.2)), #4285F4',
      },
      facebook: {
        main: '#1877F2',
        hover: '#1877F2',
        pressed: 'linear-gradient(0deg, rgba(11, 10, 19, 0.2), rgba(11, 10, 19, 0.2)), #1877F2',
      },
      twitter: {
        main: '#1DA1F2',
        hover: '#1DA1F2',
        pressed: 'linear-gradient(0deg, rgba(11, 10, 19, 0.2), rgba(11, 10, 19, 0.2)), #1DA1F2',
      },
      apple: {
        main: '#000000',
        hover: '#000000',
        pressed: 'linear-gradient(0deg, rgba(255, 255, 255, 0.2), rgba(255, 255, 255, 0.2)), #000000',
      },
    },
  },
  shadows: {
    mediumBlue: '0px 12px 35px -10px rgba(29, 124, 255, 0.6)',
    intenseBlue: '0px 15px 35px -10px rgba(29, 134, 255, 0.6)',
    mediumGrey: '0px 0px 20px rgba(11, 10, 19, 0.04), 0px 0px 6px rgba(11, 10, 19, 0.04), 0px 0px 1px rgba(11, 10, 19, 0.04)',
  },
  gradients: {
    blueDiagonal: 'linear-gradient(315deg, rgba(29, 180, 255, 0.85) 0%, rgba(29, 180, 255, 0) 50%), #1D6AFF',
    blueHorizontal: 'linear-gradient(270deg, rgba(29, 180, 255, 0.85) 0%, rgba(29, 180, 255, 0) 50%), #1D6AFF',
  },
};

export const darkTheme: DefaultTheme = {
  ...basicTheme,
  name: 'dark',
  colorsThemed: {
    grayscale: {
      background1: '#0B0A13',
      background2: '#14151F',
      background3: '#1B1C27',
      backgroundT: 'rgba(11, 10, 19, 0.65)',
      outlines1: '#272835',
      outlines2: '#6A6A7B',
    },
    text: {
      primary: '#FFFFFF',
      secondary: '#9BA2B1',
      tertiary: '#586070',
      quaternary: '#434956',
    },
    accent: {
      blue: '#1D6AFF',
      pink: '#FF1D6A',
      yellow: '#FFE604',
      green: '#0FF34F',
      error: '#E8354D',
      success: '#12A573',
    },
    social: {
      google: {
        main: '#4285F4',
        hover: '#4285F4',
        pressed: 'linear-gradient(0deg, rgba(11, 10, 19, 0.2), rgba(11, 10, 19, 0.2)), #4285F4',
      },
      facebook: {
        main: '#1877F2',
        hover: '#1877F2',
        pressed: 'linear-gradient(0deg, rgba(11, 10, 19, 0.2), rgba(11, 10, 19, 0.2)), #1877F2',
      },
      twitter: {
        main: '#1DA1F2',
        hover: '#1DA1F2',
        pressed: 'linear-gradient(0deg, rgba(11, 10, 19, 0.2), rgba(11, 10, 19, 0.2)), #1DA1F2',
      },
      apple: {
        main: '#000000',
        hover: '#000000',
        pressed: 'linear-gradient(0deg, rgba(11, 10, 19, 0.2), rgba(11, 10, 19, 0.2)), #FFFFFF',
      },
    },
  },
  shadows: {
    mediumBlue: '0px 12px 35px -10px rgba(29, 124, 255, 0.6)',
    intenseBlue: '0px 15px 35px -10px rgba(29, 134, 255, 0.6)',
    mediumGrey: '0px 0px 20px rgba(11, 10, 19, 0.04), 0px 0px 6px rgba(11, 10, 19, 0.04), 0px 0px 1px rgba(11, 10, 19, 0.04)',
  },
  gradients: {
    blueDiagonal: 'linear-gradient(315deg, rgba(29, 180, 255, 0.85) 0%, rgba(29, 180, 255, 0) 50%), #1D6AFF',
    blueHorizontal: 'linear-gradient(270deg, rgba(29, 180, 255, 0.85) 0%, rgba(29, 180, 255, 0) 50%), #1D6AFF',
  },
};
