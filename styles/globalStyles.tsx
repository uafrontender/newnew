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
    // Do not assign all, breaks Lotti, use only color (theme) related props here
    transition: color 0.3s linear, background 0.3s linear, background-color 0.3s linear !important;
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
    font-family: Gilroy, Segoe UI Emoji, Arial, Helvetica, sans-serif;

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

  /* .iti__flag {background-image: url("../../flags.png");}

  @media (-webkit-min-device-pixel-ratio: 2), (min-resolution: 192dpi) {
    .iti__flag {background-image: url("../../flags.png");}
  } */

  #nprogress .bar {
    background: repeating-linear-gradient(to right, #1D6AFF 0%, rgba(29, 180, 255, 0.85) 50%, #1D6AFF 100%);
    background-size: 200% auto;
    background-position: 0 100%;
    animation: gradient 2s infinite;
    animation-fill-mode: forwards;
    animation-timing-function: linear;
  }

  @keyframes gradient {
    0%   { background-position: 0 0; }
    100% { background-position: -200% 0; }
  }
`;

export default GlobalStyle;
