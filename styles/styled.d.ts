import 'styled-components';

import { IMedia } from './media';

// Here we declare interface to use in the ./themes.ts
declare module 'styled-components' {
  export interface DefaultTheme {
    name: string;
    media: IMedia;
    // Theme-agnostic colors
    width: {
      maxContentWidth: number;
    };
    colors: {
      white: string;
      black: string;
      blue: string;
      dark: string;
      darkGray: string;
    };
    colorsThemed: {
      statusBar: {
        background: string;
      };
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
        backgroundHeader: string;
        backgroundErrorPopup: string;
        // Used for overlaydim
        overlaydim: string;
        thumbLineHidden: string;
        thumbLineVisible: string;
      };
      text: {
        // Used for both links and titles.
        primary: string;
        // Used for body copy text.
        secondary: string;
        // Used for initial copy of inputs.
        tertiary: string;
        // Used for initial state of text buttons.
        quaternary: string;
      };
      accent: {
        blue: string;
        pink: string;
        yellow: string;
        green: string;
        error: string;
        success: string;
      };
      social: {
        google: {
          main: string;
          hover: string;
          pressed: string;
        };
        facebook: {
          main: string;
          hover: string;
          pressed: string;
        };
        twitter: {
          main: string;
          hover: string;
          pressed: string;
        };
        apple: {
          main: string;
          hover: string;
          pressed: string;
        };
        instagram: {
          main: string;
          hover: string;
          pressed: string;
        };
        tiktok: {
          main: string;
          hover: string;
          pressed: string;
        };
        copy: {
          main: string;
          hover: string;
          pressed: string;
        };
      };
      tag: {
        color: {
          primary: string;
        };
        background: {
          primary: string;
        };
      };
      button: {
        color: {
          primary: string;
          primaryGrad: string;
          primaryProgress: string;
          secondary: string;
          modalSecondary: string;
          modalSecondarySelected: string;
          tertiary: string;
          quaternary: string;
          transparent: string;
          changeLanguage: string;
          danger: string;
          common: string;
          brandYellow: string;
        };
        background: {
          primary: string;
          primaryGrad: string;
          primaryProgress: string;
          secondary: string;
          modalSecondary: string;
          modalSecondarySelected: string;
          tertiary: string;
          quaternary: string;
          transparent: string;
          changeLanguage: string;
          danger: string;
          common: string;
          brandYellow: string;
        };
        hover: {
          primary: string;
          primaryGrad: string;
          primaryProgress: string;
          secondary: string;
          modalSecondary: string;
          modalSecondarySelected: string;
          tertiary: string;
          quaternary: string;
          transparent: string;
          changeLanguage: string;
          danger: string;
          common: string;
          brandYellow: string;
        };
        hoverShadow: {
          primary: string;
          danger: string;
          brandYellow: string;
        };
        active: {
          primary: string;
          primaryGrad: string;
          primaryProgress: string;
          secondary: string;
          modalSecondary: string;
          modalSecondarySelected: string;
          tertiary: string;
          quaternary: string;
          transparent: string;
          changeLanguage: string;
          danger: string;
          brandYellow: string;
        };
        ripple: {
          primary: string;
          primaryGrad: string;
          secondary: string;
        };
        progress: {
          primaryProgress: string;
        };
        disabled: string;
      };
    };
    shadows: {
      lightBlue: string;
      mediumBlue: string;
      intenseBlue: string;
      mediumGrey: string;
      cookie: string;
      dashboardNotifications: string;
    };
    gradients: {
      arrowLeft: string;
      arrowRight: string;
      blueDiagonal: string;
      blueReversedDiagonal: string;
      blueHorizontal: string;
      heroNotifications: string;
      heroNotificationsTablet: string;
      bannerPink: string;
      calendarTop: string;
      calendarBottom: string;
      creationSubmit: string;
      listTop: {
        primary: string;
        secondary: string;
        tertiary: string;
        quaternary: string;
      };
      listBottom: {
        primary: string;
        secondary: string;
        tertiary: string;
        quaternary: string;
      };
      listLeft: {
        primary: string;
        secondary: string;
        tertiary: string;
      };
      listRight: {
        primary: string;
        secondary: string;
        tertiary: string;
      };
      decisionOption: {
        yellow: string;
        blue: string;
        green: string;
      };
    };
    borderRadius: {
      small: string;
      smallLg: string;
      medium: string;
      large: string;
      xxxLarge: string;
    };
  }
}
