import 'styled-components';

import { IMedia } from './media';

// Here we declare interface to use in the ./themes.ts
declare module 'styled-components' {
  export interface DefaultTheme {
    name: string;
    media: IMedia;
    // Theme-agnostic colors
    width: {
      maxContentWidth: number,
    };
    colors: {
      white: string,
      black: string,
      blue: string,
    };
    colorsThemed: {
      grayscale: {
        background1: string;
        background2: string;
        background3: string;
        backgroundT: string;
        // Used for an initial state.
        outlines1: string;
        // Used for both hover and focus states.
        outlines2: string;
        numbers: string;
        backgroundFooter: string;
      },
      text: {
        // Used for both links and titles.
        primary: string;
        // Used for body copy text.
        secondary: string;
        // Used for initial copy of inputs.
        tertiary: string;
        // Used for initial state of text buttons.
        quaternary: string;
      },
      accent: {
        blue: string;
        pink: string;
        yellow: string;
        green: string;
        error: string;
        success: string;
      },
      social: {
        google: {
          main: string;
          hover: string;
          pressed: string;
        },
        facebook: {
          main: string;
          hover: string;
          pressed: string;
        },
        twitter: {
          main: string;
          hover: string;
          pressed: string;
        },
        apple: {
          main: string;
          hover: string;
          pressed: string;
        },
      },
      button: {
        color: {
          blue: string,
          primary: string,
          secondary: string,
          tertiary: string,
          quaternary: string,
          transparent: string,
          blueProgress: string,
          changeLanguage: string,
        },
        background: {
          blue: string,
          primary: string,
          secondary: string,
          tertiary: string,
          quaternary: string,
          transparent: string,
          blueProgress: string,
          changeLanguage: string,
        },
        ripple: {
          blue: string,
          primary: string,
          secondary: string,
          tertiary: string,
          quaternary: string,
          transparent: string,
          blueProgress: string,
          changeLanguage: string,
        },
        hover: {
          blue: string,
          primary: string,
          secondary: string,
          tertiary: string,
          quaternary: string,
          transparent: string,
          blueProgress: string,
          changeLanguage: string,
        },
        progress: {
          blue: string,
          primary: string,
          secondary: string,
          tertiary: string,
          quaternary: string,
          transparent: string,
          blueProgress: string,
          changeLanguage: string,
        }
      },
    },
    shadows: {
      mediumBlue: string,
      intenseBlue: string,
      mediumGrey: string,
    },
    gradients: {
      arrowLeft: string,
      arrowRight: string,
      blueDiagonal: string,
      blueHorizontal: string,
      heroNotifications: string,
      heroNotificationsTablet: string,
      bannerPink: string,
    },
    borderRadius: {
      small: string,
      smallLg: string,
      medium: string,
      large: string,
      xxxLarge: string,
    },
  }
}
