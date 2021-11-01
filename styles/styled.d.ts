import 'styled-components';

import { IMedia } from './media';

// Here we declare interface to use in the ./themes.ts
declare module 'styled-components' {
  export interface DefaultTheme {
    name: string;
    media: IMedia;
    // Theme-agnostic colors
    colors: {
      primaryDark: string;
      primaryWhite: string;
      accentBlue: string;
      accentGreen: string;
      accentPink: string;
      newnewYellow: string;
      secondaryGray: string;
    },
    // Theme-dependant colors
    colorsThemed: {
      appBgColor: string;
      appTextColor: string;
      surface: string;
      surfaceActive: string;
      onSurface: string;
      onSurfaceActive: string;
      alertRed: string;
      appLogoMobile: string;
      navigationBgColor: string;
      mobileNavigation: string;
      mobileNavigationActive: string;
    },
    borderRadius: {
      small: string,
      medium: string,
      large: string,
      xxxLarge: string,
    },
    shadows: {
      mediumBlue: string;
    },
    gradients: {
      blue: string;
    },
    fontSizes: {
      mobileBottomNavigation: string;
    }
  }
}
