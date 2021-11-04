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
    color: ${({ theme }) => theme.colorsThemed.text.primary};
    background-color: ${({ theme }) => theme.colorsThemed.grayscale.background1};
  }

  a {
    color: ${({ theme }) => theme.colorsThemed.text.primary};
  }
`;

export default GlobalStyle;
