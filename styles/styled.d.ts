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
      dark: string,
    };
    colorsThemed: {
      statusBar: {
        background: string;
      },
      background: {
        primary: string;
        secondary: string;
        tertiary: string;
        quaternary: string;
        quinary: string;
        backgroundT: string;
        backgroundDD: string;
        backgroundDDSelected: string;
        backgroundCookie: string;
        // Used for an initial state.
        outlines1: string;
        // Used for both hover and focus states.
        outlines2: string;
        numbers: string;
        backgroundFooter: string;
        backgroundHeader: string;
        // Used for overlaydim
        overlayDim: string;
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
      tag: {
        color: {
          primary: string,
        },
        background: {
          primary: string,
        },
      },
      button: {
        color: {
          primary: string,
          primaryGrad: string,
          primaryProgress: string,
          secondary: string,
          modalSecondary: string,
          modalSecondarySelected: string,
          tertiary: string,
          quaternary: string,
          transparent: string,
          changeLanguage: string,
        },
        background: {
          primary: string,
          primaryGrad: string,
          primaryProgress: string,
          secondary: string,
          modalSecondary: string,
          modalSecondarySelected: string,
          tertiary: string,
          quaternary: string,
          transparent: string,
          changeLanguage: string,
        },
        hover: {
          primary: string,
          primaryGrad: string,
          primaryProgress: string,
          secondary: string,
          modalSecondary: string,
          modalSecondarySelected: string,
          tertiary: string,
          quaternary: string,
          transparent: string,
          changeLanguage: string,
        },
        active: {
          primary: string,
          primaryGrad: string,
          primaryProgress: string,
          secondary: string,
          modalSecondary: string,
          modalSecondarySelected: string,
          tertiary: string,
          quaternary: string,
          transparent: string,
          changeLanguage: string,
        },
        ripple: {
          primary: string,
          primaryGrad: string,
          secondary: string,
        },
        progress: {
          primaryProgress: string,
        },
        disabled: string,
      },
    },
    shadows: {
      mediumBlue: string,
      intenseBlue: string,
      mediumGrey: string,
      cookie: string,
    },
    gradients: {
      arrowLeft: string,
      arrowRight: string,
      blueDiagonal: string,
      blueHorizontal: string,
      heroNotifications: string,
      heroNotificationsTablet: string,
      bannerPink: string,
      calendarTop: string,
      calendarBottom: string,
      creationSubmit: string,
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
