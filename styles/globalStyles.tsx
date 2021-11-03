// import React, { ReactElement } from 'react';
import { createGlobalStyle } from 'styled-components';

// Fonts
import fonts from './fonts';

// TODO: finalize CSS resets & general light/dark mode configs
const GlobalStyle = createGlobalStyle`
    /* Imports */
    ${fonts}

    /* CSS resets */
  /* Make box-sizing: border-box default to all document */
  html {
    -webkit-box-sizing: border-box;
    -moz-box-sizing: border-box;
    box-sizing: border-box;
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
  }


    /* General light/dark mode configs */
  body {
    color: ${({ theme }) => theme.colorsThemed.onSurface};
    background-color: ${({ theme }) => theme.colorsThemed.grayscale.background1};
  }

  a {
    color: ${({ theme }) => theme.colorsThemed.onSurface};
  }

`;

export default GlobalStyle;
