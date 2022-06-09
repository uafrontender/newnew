import React from 'react';
import { ThemeProvider } from 'styled-components';

import GlobalStyle from './globalStyles';

import getColorMode from '../utils/getColorMode';
import { useAppSelector } from '../redux-store/store';
import { darkTheme, lightTheme } from './themes';

interface IReactFunction {
  children: React.ReactNode;
}

const GlobalTheme: React.FC<IReactFunction> = ({ children }) => {
  const { colorMode } = useAppSelector((state) => state.ui);

  return (
    <ThemeProvider
      theme={getColorMode(colorMode) === 'light' ? lightTheme : darkTheme}
    >
      <GlobalStyle />
      {children}
    </ThemeProvider>
  );
};

export default GlobalTheme;
