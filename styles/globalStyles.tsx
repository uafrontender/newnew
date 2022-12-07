// import React, { ReactElement } from 'react';
import { createGlobalStyle } from 'styled-components';

// TODO: finalize CSS resets & general light/dark mode configs
const GlobalStyle = createGlobalStyle`
  /* CSS resets */
  /* Make box-sizing: border-box default to all document */
  html {
    -webkit-box-sizing: border-box;
    -moz-box-sizing: border-box;
    box-sizing: border-box;
    -webkit-tap-highlight-color:  rgba(255, 255, 255, 0);
  }

  /* Smooth theme transitions */
  html.theming,
  html.theming * {
    transition: all 0.3s linear !important;
  }

  *, *:before, *:after {
    -webkit-box-sizing: inherit;
    -moz-box-sizing: inherit;
    box-sizing: inherit;
  }

  /* Remove default margins & paddings */
  *, *:before, *:after {
    margin: 0;
    padding: 0;
  }

  /* Fonts */
  *, *:before, *:after {
    font-family: Gilroy, Arial, Helvetica, sans-serif;

    font-smooth: always;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }

  /* General light/dark mode configs */
  body {
    color: ${({ theme }) => theme.colorsThemed.text.primary};
    background: ${({ theme }) => theme.colorsThemed.background.primary};

    /* Hide scrollbar */
    ::-webkit-scrollbar {
      display: none;
    }
    scrollbar-width: none;
    -ms-overflow-style: none;
  }

  body.blurred {
    backdrop-filter: blur(16px);
    -webkit-backdrop-filter: blur(16px);
  }

  a {
    color: ${({ theme }) => theme.colorsThemed.text.primary};
    text-decoration: none;
  }

  .iti__flag {background-image: url("../../flags.png");}

  @media (-webkit-min-device-pixel-ratio: 2), (min-resolution: 192dpi) {
    .iti__flag {background-image: url("../../flags.png");}
  }
`;

export default GlobalStyle;
