import React from 'react';
import { ThemeProvider } from 'styled-components';
import GlobalStyle from '../styles/globalStyles';
import { darkTheme, lightTheme } from '../styles/themes';

export const decorators = [
  (Story, context) => (
    <ThemeProvider theme={context.globals.theme === 'light' ? lightTheme : darkTheme}>
      <GlobalStyle />
      <Story />
    </ThemeProvider>
  ),
];

export const globalTypes = {
  theme: {
    name: 'Theme',
    description: 'Global theme for components',
    defaultValue: 'light',
    toolbar: {
      icon: 'circlehollow',
      // Array of plain string values or MenuItem shape (see below)
      items: ['light', 'dark'],
      // Property that specifies if the name of the item will be displayed
      showName: true,
    },
  },
};

export const parameters = {
  actions: { argTypesRegex: "^on[A-Z].*" },
  controls: {
    matchers: {
      color: /(background|color)$/i,
      date: /Date$/,
    },
  },
}
