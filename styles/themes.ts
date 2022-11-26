import { DefaultTheme } from 'styled-components';

import media from './media';

// Basic variables, theme-agnostic
const basicTheme: Omit<
  DefaultTheme,
  'colorsThemed' | 'name' | 'gradients' | 'shadows'
> = {
  media,
  width: {
    maxContentWidth: 1440,
  },
  colors: {
    white: '#FFFFFF',
    black: '#000000',
    blue: '#2955EC',
    dark: '#0B0A13',
    darkGray: '#2C2C33',
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
    statusBar: {
      background: '#fffefe', // #FFFFFF not working on ios
    },
    background: {
      primary: '#FFFFFF',
      secondary: '#F1F3F9',
      tertiary: '#EDF0F7',
      quaternary: '#E2E7F3',
      quinary: '#D4DBED',
      backgroundT: 'transparent',
      backgroundDD: '#FFFFFF',
      backgroundDDSelected: '#F1F3F9',
      backgroundCookie: '#FFFFFF',
      outlines1: '#E5E9F1',
      outlines2: '#8B99B2',
      numbers: '#E5E9F1',
      backgroundHeader: 'rgba(255, 255, 255, 0.9)',
      backgroundErrorPopup: '#434956',
      overlaydim: 'rgba(229, 233, 241, 0.5)',
      thumbLineHidden: 'rgba(241, 243, 249, 0.9)',
      thumbLineVisible: 'rgba(29, 106, 255, 0.2)',
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
        pressed:
          'linear-gradient(0deg, rgba(11, 10, 19, 0.2), rgba(11, 10, 19, 0.2)), #4285F4',
      },
      facebook: {
        main: '#1877F2',
        hover: '#1877F2',
        pressed:
          'linear-gradient(0deg, rgba(11, 10, 19, 0.2), rgba(11, 10, 19, 0.2)), #1877F2',
      },
      twitter: {
        main: '#1DA1F2',
        hover: '#1DA1F2',
        pressed:
          'linear-gradient(0deg, rgba(11, 10, 19, 0.2), rgba(11, 10, 19, 0.2)), #1DA1F2',
      },
      apple: {
        main: '#000000',
        hover: '#000000',
        pressed:
          'linear-gradient(0deg, rgba(255, 255, 255, 0.2), rgba(255, 255, 255, 0.2)), #000000',
      },
      instagram: {
        main: 'radial-gradient(92.71% 92.71% at 5.21% 94.79%, #FEDA77 0%, #F58529 25.52%, #DD2A7B 51.56%, #8134AF 73.96%, #515BD4 100%)',
        hover:
          'radial-gradient(92.71% 92.71% at 5.21% 94.79%, #FEDA77 0%, #F58529 25.52%, #DD2A7B 51.56%, #8134AF 73.96%, #515BD4 100%)',
        pressed:
          'radial-gradient(92.71% 92.71% at 5.21% 94.79%, #FEDA77 0%, #F58529 25.52%, #DD2A7B 51.56%, #8134AF 73.96%, #515BD4 100%)',
      },
      tiktok: {
        main: '#FFFFFF',
        hover: '#FFFFFF',
        pressed: '#FFFFFF',
      },
      copy: {
        main: 'linear-gradient(315deg, rgba(29, 180, 255, 0.85) 0%, rgba(29, 180, 255, 0) 50%), #1D6AFF',
        hover:
          'linear-gradient(315deg, rgba(29, 180, 255, 0.85) 0%, rgba(29, 180, 255, 0) 50%), #1D6AFF',
        pressed:
          'linear-gradient(315deg, rgba(29, 180, 255, 0.85) 0%, rgba(29, 180, 255, 0) 50%), #1D6AFF',
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
        primaryGrad: '#FFFFFF',
        primaryProgress: '#FFFFFF',
        secondary: '#2C2C33',
        modalSecondary: '#2C2C33',
        modalSecondarySelected: '#2C2C33',
        tertiary: '#2C2C33',
        quaternary: '#2C2C33',
        transparent: '#FFFFFF',
        changeLanguage: '#2C2C33',
        danger: '#FFFFFF',
        common: '#2C2C33',
      },
      background: {
        primary: '#1D6AFF',
        primaryGrad:
          'linear-gradient(315deg, rgba(29, 180, 255, 0.85) 0%, rgba(29, 180, 255, 0) 50%), #1D6AFF',
        primaryProgress: '#C1C9D7',
        secondary: '#F1F3F9',
        modalSecondary: '#FFFFFF',
        modalSecondarySelected: '#F1F3F9',
        tertiary: '#FFFFFF',
        quaternary: 'rgba(0, 21, 128, 0.06)',
        transparent: 'rgba(11, 10, 19, 0.2)',
        changeLanguage: 'rgba(0, 21, 128, 0.06)',
        danger: '#F12C46',
        common: '#FFFFFF',
      },
      hover: {
        primary: '#1D6AFF',
        primaryGrad:
          'linear-gradient(140deg, rgba(29, 180, 255, 0.85) 0%, rgba(29, 180, 255, 0) 50%), #1D6AFF',
        primaryProgress: '#C1C9D7',
        secondary: '#E2E7F3',
        modalSecondary: '#F1F3F9',
        modalSecondarySelected: '#F1F3F9',
        tertiary: '#DFE3F1',
        quaternary: 'rgba(0, 21, 128, 0.1)',
        transparent: 'rgba(11, 10, 19, 0.2)',
        changeLanguage: '#E2E7F3',
        danger: '#F12C46',
        common: '#000000',
      },
      active: {
        primary: '#0950DA',
        primaryGrad: '#0950DA',
        primaryProgress: '#C1C9D7',
        secondary: '#D4DBED',
        modalSecondary: '#F1F3F9',
        modalSecondarySelected: '#F1F3F9',
        tertiary: '#DFE3F1',
        quaternary: 'rgba(0, 21, 128, 0.14)',
        transparent: 'rgba(11, 10, 19, 0.2)',
        changeLanguage: '#D4DBED',
        danger: '#F12C46',
      },
      ripple: {
        primary: '#0045CC',
        primaryGrad: '#0045CC',
        secondary: '#BEC9E4',
      },
      progress: {
        primaryProgress: '#1D6AFF',
      },
      disabled: 'rgba(255, 255, 255, 0.5)',
    },
  },
  shadows: {
    mediumBlue: '0px 15px 35px -10px rgba(29, 134, 255, 0.25)',
    intenseBlue: '0px 15px 35px -10px rgba(29, 134, 255, 0.6)',
    mediumGrey:
      '0px 0px 20px rgba(11, 10, 19, 0.04), 0px 0px 6px rgba(11, 10, 19, 0.04), 0px 0px 1px rgba(11, 10, 19, 0.04)',
    cookie:
      '0px 10px 20px rgba(0, 0, 0, 0.04), 0px 2px 6px rgba(0, 0, 0, 0.04), 0px 0px 1px rgba(0, 0, 0, 0.04)',
    dashboardNotifications: '0px 0px 35px rgba(100, 110, 129, 0.1)',
  },
  gradients: {
    arrowLeft:
      'linear-gradient(90deg, #FFFFFF 0%, rgba(255, 255, 255, 0) 102.97%)',
    arrowRight:
      'linear-gradient(270deg, #FFFFFF 0%, rgba(255, 255, 255, 0) 102.97%)',
    blueDiagonal:
      'linear-gradient(315deg, rgba(29, 180, 255, 0.85) 0%, rgba(29, 180, 255, 0) 50%), #1D6AFF',
    blueHorizontal:
      'linear-gradient(270deg, rgba(29, 180, 255, 0.85) 0%, rgba(29, 180, 255, 0) 50%), #1D6AFF',
    blueReversedDiagonal:
      'linear-gradient(135deg, rgba(29, 180, 255, 0.85) 0%, rgba(29, 180, 255, 0) 50%), #1D6AFF',
    heroNotifications:
      'linear-gradient(180deg, rgba(255, 255, 255, 0), rgba(255, 255, 255, 1))',
    heroNotificationsTablet:
      'linear-gradient(360deg, rgba(255, 255, 255, 0), rgba(255, 255, 255, 1))',
    bannerPink:
      'linear-gradient(135deg, #FF1D6A 48.23%, #FF6699 60.42%, #FF1D6A 72.21%)',
    calendarTop:
      'linear-gradient(180deg, #FFFFFF 0%, rgba(255, 255, 255, 0) 100%)',
    calendarBottom:
      'linear-gradient(180deg, rgba(255, 255, 255, 0) 0%, #FFFFFF 98.96%)',
    creationSubmit:
      'linear-gradient(360deg, #FFFFFF 0%, rgba(255, 255, 255, 0) 100%);',
    listTop: {
      primary:
        'linear-gradient(180deg, rgba(255, 255, 255, 0.8) 0%, rgba(255, 255, 255, 0) 100%)',
      secondary:
        'linear-gradient(180deg, rgba(241, 243, 249, 0.8) 0%, rgba(241, 243, 249, 0) 100%)',
      tertiary:
        'linear-gradient(180deg, rgba(255, 255, 255, 0.8) 0%, rgba(255, 255, 255, 0) 100%)',
      quaternary:
        'linear-gradient(180deg, rgba(255, 255, 255, 0) 0%, rgba(255, 255, 255, 1) 100%);',
    },
    listBottom: {
      primary:
        'linear-gradient(180deg, rgba(255, 255, 255, 0) 0%, rgba(255, 255, 255, 0.8) 100%)',
      secondary:
        'linear-gradient(180deg, rgba(241, 243, 249, 0) 0%, rgba(241, 243, 249, 0.8) 100%)',
      tertiary:
        'linear-gradient(180deg, rgba(255, 255, 255, 0) 0%, rgba(255, 255, 255, 0.8) 100%)',
      quaternary:
        'linear-gradient(180deg, rgba(255, 255, 255, 1) 0%, rgba(255, 255, 255, 0) 100%);',
    },
    listLeft: {
      primary:
        'linear-gradient(90deg, #FFFFFF 0%, rgba(255, 255, 255, 0) 102.97%)',
      secondary:
        'linear-gradient(90deg, rgba(241, 243, 249, 1) 0%, rgba(241, 243, 249, 0) 102.97%)',
      tertiary:
        'linear-gradient(90deg, #FFFFFF 0%, rgba(255, 255, 255, 0) 102.97%)',
    },
    listRight: {
      primary:
        'linear-gradient(270deg, #FFFFFF 0%, rgba(255, 255, 255, 0) 102.97%)',
      secondary:
        'linear-gradient(270deg, rgba(241, 243, 249, 1) 0%, rgba(241, 243, 249, 0) 102.97%)',
      tertiary:
        'linear-gradient(270deg, #FFFFFF 0%, rgba(255, 255, 255, 0) 102.97%)',
    },
    decisionOption: {
      yellow:
        'linear-gradient(225deg, #FFE604 5.73%, #F7DB0E 35.42%, #FDBA00 68.23%);',
      blue: 'linear-gradient(225deg, #00D5FF 5.73%, #1DB4FF 35.42%, #1D6AFF 68.23%);',
      green:
        'linear-gradient(225deg, #0FF34F 0%, #07DF74 44.27%, #00C291 100%);',
    },
  },
};

export const darkTheme: DefaultTheme = {
  ...basicTheme,
  name: 'dark',
  colorsThemed: {
    statusBar: {
      background: '#0B0A13',
    },
    background: {
      primary: '#0B0A13',
      secondary: '#14151F',
      tertiary: '#1B1C27',
      quaternary: '#1E1F29',
      quinary: '#282933',
      backgroundT: 'rgba(11, 10, 19, 0.65)',
      backgroundDD: '#14151F',
      backgroundDDSelected: '#21222C',
      backgroundCookie: '#1B1C27',
      outlines1: '#272835',
      outlines2: '#6A6A7B',
      numbers: 'rgba(255, 255, 255, 0.06)',
      backgroundHeader: 'rgba(11, 10, 19, 0.9)',
      backgroundErrorPopup: '#434956',
      overlaydim: 'rgba(11, 10, 19, 0.65)',
      thumbLineHidden: 'rgba(20, 21, 31, 0.9)',
      thumbLineVisible: 'rgba(255, 255, 255, 0.2)',
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
        pressed:
          'linear-gradient(0deg, rgba(11, 10, 19, 0.2), rgba(11, 10, 19, 0.2)), #4285F4',
      },
      facebook: {
        main: '#1877F2',
        hover: '#1877F2',
        pressed:
          'linear-gradient(0deg, rgba(11, 10, 19, 0.2), rgba(11, 10, 19, 0.2)), #1877F2',
      },
      twitter: {
        main: '#1DA1F2',
        hover: '#1DA1F2',
        pressed:
          'linear-gradient(0deg, rgba(11, 10, 19, 0.2), rgba(11, 10, 19, 0.2)), #1DA1F2',
      },
      apple: {
        main: '#000000',
        hover: '#000000',
        pressed:
          'linear-gradient(0deg, rgba(11, 10, 19, 0.2), rgba(11, 10, 19, 0.2)), #FFFFFF',
      },
      instagram: {
        main: 'radial-gradient(92.71% 92.71% at 5.21% 94.79%, #FEDA77 0%, #F58529 25.52%, #DD2A7B 51.56%, #8134AF 73.96%, #515BD4 100%)',
        hover:
          'radial-gradient(92.71% 92.71% at 5.21% 94.79%, #FEDA77 0%, #F58529 25.52%, #DD2A7B 51.56%, #8134AF 73.96%, #515BD4 100%)',
        pressed:
          'radial-gradient(92.71% 92.71% at 5.21% 94.79%, #FEDA77 0%, #F58529 25.52%, #DD2A7B 51.56%, #8134AF 73.96%, #515BD4 100%)',
      },
      tiktok: {
        main: '#FFFFFF',
        hover: '#FFFFFF',
        pressed: '#FFFFFF',
      },
      copy: {
        main: 'linear-gradient(315deg, rgba(29, 180, 255, 0.85) 0%, rgba(29, 180, 255, 0) 50%), #1D6AFF',
        hover:
          'linear-gradient(315deg, rgba(29, 180, 255, 0.85) 0%, rgba(29, 180, 255, 0) 50%), #1D6AFF',
        pressed:
          'linear-gradient(315deg, rgba(29, 180, 255, 0.85) 0%, rgba(29, 180, 255, 0) 50%), #1D6AFF',
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
        primaryGrad: '#FFFFFF',
        primaryProgress: '#FFFFFF',
        secondary: '#FFFFFF',
        modalSecondary: '#FFFFFF',
        modalSecondarySelected: '#FFFFFF',
        tertiary: '#FFFFFF',
        quaternary: '#FFFFFF',
        transparent: '#FFFFFF',
        changeLanguage: '#FFFFFF',
        danger: '#FFFFFF',
        common: '#000000',
      },
      background: {
        primary: '#1D6AFF',
        primaryGrad:
          'linear-gradient(315deg, rgba(29, 180, 255, 0.85) 0%, rgba(29, 180, 255, 0) 50%), #1D6AFF',
        primaryProgress: '#14151F',
        secondary: '#14151F',
        modalSecondary: '#14151F',
        modalSecondarySelected: '#21222C',
        tertiary: '#0B0A13',
        quaternary: 'rgba(255, 255, 255, 0.06)',
        transparent: 'rgba(11, 10, 19, 0.2)',
        changeLanguage: '#14151F',
        danger: '#F12C46',
        common: '#2C2C33',
      },
      hover: {
        primary: '#1D6AFF',
        primaryGrad:
          'linear-gradient(140deg, rgba(29, 180, 255, 0.85) 0%, rgba(29, 180, 255, 0) 50%), #1D6AFF',
        primaryProgress: '#14151F',
        secondary: '#1E1F29',
        modalSecondary: '#1E1F29',
        modalSecondarySelected: '#21222C',
        tertiary: '#21222C',
        quaternary: 'rgba(255, 255, 255, 0.1)',
        transparent: 'rgba(11, 10, 19, 0.2)',
        changeLanguage: '#1E1F29',
        danger: '#F12C46',
        common: '#000000',
      },
      active: {
        primary: '#0950DA',
        primaryGrad: '#0950DA',
        primaryProgress: '#14151F',
        secondary: '#282933',
        modalSecondary: '#282933',
        modalSecondarySelected: '#21222C',
        tertiary: '#21222C',
        quaternary: 'rgba(255, 255, 255, 0.14)',
        transparent: 'rgba(11, 10, 19, 0.2)',
        changeLanguage: '#282933',
        danger: '#F12C46',
      },
      ripple: {
        primary: '#0045CC',
        primaryGrad: '#0045CC',
        secondary: '#363745',
      },
      progress: {
        primaryProgress: '#1D6AFF',
      },
      disabled: 'rgba(11, 10, 19, 0.5)',
    },
  },
  shadows: {
    mediumBlue: '0px 12px 35px -10px rgba(29, 124, 255, 0.6)',
    intenseBlue: '0px 15px 35px -10px rgba(29, 134, 255, 0.6)',
    mediumGrey:
      '0px 0px 20px rgba(11, 10, 19, 0.04), 0px 0px 6px rgba(11, 10, 19, 0.04), 0px 0px 1px rgba(11, 10, 19, 0.04)',
    cookie:
      '0px 10px 20px rgba(0, 0, 0, 0.04), 0px 2px 6px rgba(0, 0, 0, 0.04), 0px 0px 1px rgba(0, 0, 0, 0.04)',
    dashboardNotifications: 'unset',
  },
  gradients: {
    arrowLeft: 'linear-gradient(90deg, #0B0A13 0%, rgba(11, 10, 19, 0) 100%)',
    arrowRight: 'linear-gradient(270deg, #0B0A13 0%, rgba(11, 10, 19, 0) 100%)',
    blueDiagonal:
      'linear-gradient(315deg, rgba(29, 180, 255, 0.85) 0%, rgba(29, 180, 255, 0) 50%), #1D6AFF',
    blueHorizontal:
      'linear-gradient(270deg, rgba(29, 180, 255, 0.85) 0%, rgba(29, 180, 255, 0) 50%), #1D6AFF',
    blueReversedDiagonal:
      'linear-gradient(135deg, rgba(29, 180, 255, 0.85) 0%, rgba(29, 180, 255, 0) 50%), #1D6AFF',
    heroNotifications:
      'linear-gradient(180deg, rgba(11, 10, 19, 0), rgba(11, 10, 19, 1))',
    heroNotificationsTablet:
      'linear-gradient(360deg, rgba(11, 10, 19, 0), rgba(11, 10, 19, 1))',
    bannerPink:
      'linear-gradient(135deg, #FF1D6A 48.23%, #FF6699 60.42%, #FF1D6A 72.21%)',
    calendarTop:
      'linear-gradient(180deg, #14151F 0%, rgba(20, 21, 31, 0) 100%)',
    calendarBottom:
      'linear-gradient(180deg, rgba(20, 21, 31, 0) 0%, #14151F 100%)',
    creationSubmit:
      'linear-gradient(360deg, #0B0A13 0%, rgba(11, 10, 19, 0) 100%)',
    listTop: {
      primary:
        'linear-gradient(180deg, rgba(20, 21, 31, 0.8) 0%, rgba(20, 21, 31, 0) 100%)',
      secondary:
        'linear-gradient(180deg, rgba(20, 21, 31, 0.8) 0%, rgba(20, 21, 31, 0) 100%)',
      tertiary:
        'linear-gradient(180deg, rgba(20, 21, 31, 0.8) 0%, rgba(20, 21, 31, 0) 100%)',
      quaternary:
        'linear-gradient(180deg, rgba(11, 10, 19, 0) 0%, rgba(11, 10, 19, 1) 100%)',
    },
    listBottom: {
      primary:
        'linear-gradient(180deg, rgba(20, 21, 31, 0) 0%, rgba(20, 21, 31, 0.8) 100%)',
      secondary:
        'linear-gradient(180deg, rgba(20, 21, 31, 0) 0%, rgba(20, 21, 31, 0.8) 100%)',
      tertiary:
        'linear-gradient(180deg, rgba(20, 21, 31, 0) 0%, rgba(20, 21, 31, 0.8) 100%)',
      quaternary:
        'linear-gradient(180deg, rgba(11, 10, 19, 1) 0%, rgba(11, 10, 19, 0) 100%)',
    },
    listLeft: {
      primary:
        'linear-gradient(90deg, rgb(11, 10, 19, 0.8) 0%, rgba(11, 10, 19, 0) 100%)',
      secondary:
        'linear-gradient(90deg, rgba(20, 21, 31, 0.8) 0%, rgba(11, 10, 19, 0) 100%)',
      tertiary:
        'linear-gradient(90deg, rgba(20, 21, 31, 0.8) 0%, rgba(11, 10, 19, 0) 100%)',
    },
    listRight: {
      primary:
        'linear-gradient(270deg, rgb(11, 10, 19, 0.8) 0%, rgba(11, 10, 19, 0)  100%)',
      secondary:
        'linear-gradient(270deg, rgba(20, 21, 31, 0.8)  0%, rgba(11, 10, 19, 0)  100%)',
      tertiary:
        'linear-gradient(270deg, rgba(20, 21, 31, 0.8)  0%, rgba(11, 10, 19, 0)  100%)',
    },
    decisionOption: {
      yellow:
        'linear-gradient(225deg, #FFE604 5.73%, #F7DB0E 35.42%, #FDBA00 68.23%)',
      blue: 'linear-gradient(225deg, #00D5FF 5.73%, #1DB4FF 35.42%, #1D6AFF 68.23%)',
      green:
        'linear-gradient(225deg, #0FF34F 0%, #07DF74 44.27%, #00C291 100%)',
    },
  },
};
