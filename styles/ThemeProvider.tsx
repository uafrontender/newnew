import React from 'react';
import { ThemeProvider } from 'styled-components';

import { useAppSelector } from '../redux-store/store';
import GlobalStyle from './globalStyles';
import { darkTheme, lightTheme } from './themes';

const GlobalTheme: React.FunctionComponent = ({ children }) => {
  const { colorMode } = useAppSelector((state) => state.ui);

  return (
    <ThemeProvider
      theme={colorMode === 'light' ? lightTheme : darkTheme}
    >
      <GlobalStyle />
      { children }
    </ThemeProvider>
  );
};

export default GlobalTheme;
