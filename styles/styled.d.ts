import 'styled-components';

// Here we declare interface to use in the ./themes.ts
declare module 'styled-components' {
  export interface DefaultTheme {
    name: string;
    // Theme-agnostic colors
    colors: {
      primaryDark: string;
      accentBlue: string;
      accentGreen: string;
      accentPink: string;
      newnewYellow: string;
    },
    // Theme-dependant colors
    colorsThemed: {
      appBgColor: string;
      surface: string;
      surfaceActive: string;
      onSurface: string;
      onSurfaceActive: string;
    },
    borderRadius: {
      small: string,
      medium: string,
      large: string,
    },
    shadows: {
      mediumBlue: string;
    },
    gradients: {
      blue: string;
    }
  }
}
