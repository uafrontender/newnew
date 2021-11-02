import 'styled-components';

import { IMedia } from './media';

// Here we declare interface to use in the ./themes.ts
declare module 'styled-components' {
  export interface DefaultTheme {
    name: string;
    media: IMedia;
    // Theme-agnostic colors
    colors: {
      baseLight900: string,
      baseLight800: string,
      baseLight700: string,
      baseLight600: string,
      baseLight500: string,
      baseLight400: string,
      baseLight300: string,
      baseLight200: string,
      baseLight100: string,
      baseLight50: string,
      baseLight0: string,

      baseDark900: string,
      baseDark800: string,
      baseDark700: string,
      baseDark600: string,
      baseDark500: string,
      baseDark400: string,
      baseDark300: string,
      baseDark200: string,
      baseDark100: string,
      baseDark50: string,

      brand1900: string,
      brand1800: string,
      brand1700: string,
      brand1600: string,
      brand1500: string,
      brand1400: string,
      brand1300: string,
      brand1200: string,
      brand1100: string,
      brand150: string,

      brand2900: string,
      brand2800: string,
      brand2700: string,
      brand2600: string,
      brand2500: string,
      brand2400: string,
      brand2300: string,
      brand2200: string,
      brand2100: string,
      brand250: string,

      brand3900: string,
      brand3800: string,
      brand3700: string,
      brand3600: string,
      brand3500: string,
      brand3400: string,
      brand3300: string,
      brand3200: string,
      brand3100: string,
      brand350: string,

      brand4900: string,
      brand4800: string,
      brand4700: string,
      brand4600: string,
      brand4500: string,
      brand4400: string,
      brand4300: string,
      brand4200: string,
      brand4100: string,
      brand450: string,

      brand5900: string,
      brand5800: string,
      brand5700: string,
      brand5600: string,
      brand5500: string,
      brand5400: string,
      brand5300: string,
      brand5200: string,
      brand5100: string,
      brand550: string,
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
      blueDiagonal: string;
      blueHorizontal: string;
    },
    fontSizes: {
      mobileBottomNavigation: string;
    }
  }
}
