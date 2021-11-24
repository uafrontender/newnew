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
    smallLg: '12px',
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
      backgroundCookie: '#FFFFFF',
      outlines1: '#E5E9F1',
      outlines2: '#8B99B2',
      numbers: '#E5E9F1',
      backgroundHeader: 'rgba(255, 255, 255, 0.9)',
      backgroundFooter: '#F1F3F9',
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
    tag: {
      color: {
        primary: '#FFFFFF',
      },
      background: {
        primary: '#0B0A13',
      },
    },
    button: {
      color: {
        primary: '#FFFFFF',
        secondary: '#2C2C33',
        tertiary: '#2C2C33',
        quaternary: '#FFFFFF',

        blue: '#FFFFFF',
        transparent: '#FFFFFF',
        blueProgress: '#FFFFFF',
        changeLanguage: '#2C2C33',
      },
      background: {
        primary: 'linear-gradient(315deg, rgba(29, 180, 255, 0.85) 0%, rgba(29, 180, 255, 0) 50%), #1D6AFF',
        secondary: '#F1F3F9',
        tertiary: '#FFFFFF',
        quaternary: '#0B0A13',

        blue: '#1D6AFF',
        transparent: 'rgba(11, 10, 19, 0.2)',
        blueProgress: '#C1C9D7',
        changeLanguage: '#FFFFFF',
      },
      ripple: {
        primary: '#2955EC',
        secondary: '#CAD0E8',
        tertiary: '#DFE3F1',
        quaternary: '#0B0A13',

        blue: '#1D6AFF',
        transparent: 'rgba(11, 10, 19, 0.2)',
        blueProgress: '#C1C9D7',
        changeLanguage: '#FFFFFF',
      },
      hover: {
        primary: 'linear-gradient(315deg, rgba(29, 180, 255, 0.85) 0%, rgba(29, 180, 255, 0) 50%), #1D6AFF',
        secondary: '#DFE3F1',
        tertiary: '#DFE3F1',
        quaternary: '#0B0A13',

        blue: '#1D6AFF',
        transparent: 'rgba(11, 10, 19, 0.2)',
        blueProgress: '#C1C9D7',
        changeLanguage: '#FFFFFF',
      },
      active: {
        primary: 'linear-gradient(315deg, rgba(29, 180, 255, 0.85) 0%, rgba(29, 180, 255, 0) 50%), #1D6AFF',
        secondary: '#DFE3F1',
        tertiary: '#DFE3F1',
        quaternary: '#0B0A13',

        blue: '#1D6AFF',
        transparent: 'rgba(11, 10, 19, 0.2)',
        blueProgress: '#C1C9D7',
        changeLanguage: '#FFFFFF',
      },
      progress: {
        primary: 'linear-gradient(315deg, rgba(29, 180, 255, 0.85) 0%, rgba(29, 180, 255, 0) 50%), #1D6AFF',
        secondary: '#DFE3F1',
        tertiary: '#DFE3F1',
        quaternary: '#0B0A13',

        blue: '#C1C9D7',
        transparent: 'rgba(11, 10, 19, 0.2)',
        blueProgress: '#1D6AFF',
        changeLanguage: '#FFFFFF',
      },
    },
  },
  shadows: {
    mediumBlue: '0px 15px 35px -10px rgba(29, 134, 255, 0.25)',
    intenseBlue: '0px 15px 35px -10px rgba(29, 134, 255, 0.6)',
    mediumGrey: '0px 0px 20px rgba(11, 10, 19, 0.04), 0px 0px 6px rgba(11, 10, 19, 0.04), 0px 0px 1px rgba(11, 10, 19, 0.04)',
    cookie: '0px 10px 20px rgba(0, 0, 0, 0.04), 0px 2px 6px rgba(0, 0, 0, 0.04), 0px 0px 1px rgba(0, 0, 0, 0.04)',
  },
  gradients: {
    arrowLeft: 'linear-gradient(90deg, #FFFFFF 0%, rgba(255, 255, 255, 0) 102.97%)',
    arrowRight: 'linear-gradient(270deg, #FFFFFF 0%, rgba(255, 255, 255, 0) 102.97%)',
    blueDiagonal: 'linear-gradient(315deg, rgba(29, 180, 255, 0.85) 0%, rgba(29, 180, 255, 0) 50%), #1D6AFF',
    blueHorizontal: 'linear-gradient(270deg, rgba(29, 180, 255, 0.85) 0%, rgba(29, 180, 255, 0) 50%), #1D6AFF',
    heroNotifications: 'linear-gradient(180deg, rgba(255, 255, 255, 0), rgba(255, 255, 255, 1))',
    heroNotificationsTablet: 'linear-gradient(360deg, rgba(255, 255, 255, 0), rgba(255, 255, 255, 1))',
    bannerPink: 'linear-gradient(135deg, #FF1D6A 48.23%, #FF6699 60.42%, #FF1D6A 72.21%)',
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
      backgroundCookie: '#1B1C27',
      outlines1: '#272835',
      outlines2: '#6A6A7B',
      numbers: 'rgba(255, 255, 255, 0.06)',
      backgroundFooter: '#0B0A13',
      backgroundHeader: 'rgba(11, 10, 19, 0.9);',
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
    tag: {
      color: {
        primary: '#2C2C33',
      },
      background: {
        primary: '#FFFFFF',
      },
    },
    button: {
      color: {
        primary: '#FFFFFF',
        secondary: '#FFFFFF',
        tertiary: '#FFFFFF',
        quaternary: '#2C2C33',

        blue: '#FFFFFF',
        transparent: '#FFFFFF',
        blueProgress: '#FFFFFF',
        changeLanguage: '#FFFFFF',
      },
      background: {
        primary: 'linear-gradient(315deg, rgba(29, 180, 255, 0.85) 0%, rgba(29, 180, 255, 0) 50%), #1D6AFF',
        secondary: '#14151F',
        tertiary: '#0B0A13',
        quaternary: '#FFFFFF',

        blue: '#1D6AFF',
        transparent: 'rgba(11, 10, 19, 0.2)',
        blueProgress: '#14151F',
        changeLanguage: '#14151F',
      },
      ripple: {
        primary: '#2955EC',
        secondary: '#21222C',
        tertiary: '#21222C',
        quaternary: '#FFFFFF',

        blue: '#1D6AFF',
        transparent: 'rgba(11, 10, 19, 0.2)',
        blueProgress: '#14151F',
        changeLanguage: '#14151F',
      },
      hover: {
        primary: 'linear-gradient(315deg, rgba(29, 180, 255, 0.85) 0%, rgba(29, 180, 255, 0) 50%), #1D6AFF',
        secondary: '#21222C',
        tertiary: '#21222C',
        quaternary: '#FFFFFF',

        blue: '#1D6AFF',
        transparent: 'rgba(11, 10, 19, 0.2)',
        blueProgress: '#14151F',
        changeLanguage: '#14151F',
      },
      active: {
        primary: 'linear-gradient(315deg, rgba(29, 180, 255, 0.85) 0%, rgba(29, 180, 255, 0) 50%), #1D6AFF',
        secondary: '#21222C',
        tertiary: '#21222C',
        quaternary: '#FFFFFF',

        blue: '#1D6AFF',
        transparent: 'rgba(11, 10, 19, 0.2)',
        blueProgress: '#14151F',
        changeLanguage: '#14151F',
      },
      progress: {
        primary: 'linear-gradient(315deg, rgba(29, 180, 255, 0.85) 0%, rgba(29, 180, 255, 0) 50%), #1D6AFF',
        secondary: '#DFE3F1',
        tertiary: '#DFE3F1',
        quaternary: '#0B0A13',

        blue: '#14151F',
        transparent: 'rgba(11, 10, 19, 0.2)',
        blueProgress: '#1D6AFF',
        changeLanguage: '#14151F',
      },
    },
  },
  shadows: {
    mediumBlue: '0px 12px 35px -10px rgba(29, 124, 255, 0.6)',
    intenseBlue: '0px 15px 35px -10px rgba(29, 134, 255, 0.6)',
    mediumGrey: '0px 0px 20px rgba(11, 10, 19, 0.04), 0px 0px 6px rgba(11, 10, 19, 0.04), 0px 0px 1px rgba(11, 10, 19, 0.04)',
    cookie: '0px 10px 20px rgba(0, 0, 0, 0.04), 0px 2px 6px rgba(0, 0, 0, 0.04), 0px 0px 1px rgba(0, 0, 0, 0.04)',
  },
  gradients: {
    arrowLeft: 'linear-gradient(90deg, #0B0A13 0%, rgba(11, 10, 19, 0) 100%)',
    arrowRight: 'linear-gradient(270deg, #0B0A13 0%, rgba(11, 10, 19, 0) 100%)',
    blueDiagonal: 'linear-gradient(315deg, rgba(29, 180, 255, 0.85) 0%, rgba(29, 180, 255, 0) 50%), #1D6AFF',
    blueHorizontal: 'linear-gradient(270deg, rgba(29, 180, 255, 0.85) 0%, rgba(29, 180, 255, 0) 50%), #1D6AFF',
    heroNotifications: 'linear-gradient(180deg, rgba(11, 10, 19, 0), rgba(11, 10, 19, 1))',
    heroNotificationsTablet: 'linear-gradient(360deg, rgba(11, 10, 19, 0), rgba(11, 10, 19, 1))',
    bannerPink: 'linear-gradient(135deg, #FF1D6A 48.23%, #FF6699 60.42%, #FF1D6A 72.21%)',
  },
};
