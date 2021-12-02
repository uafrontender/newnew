import React from 'react';
import { ThemeProvider } from 'styled-components';

import { useAppSelector } from '../redux-store/store';
import GlobalStyle from './globalStyles';
import { darkTheme, lightTheme } from './themes';

const GlobalTheme: React.FunctionComponent = ({ children }) => {
  const { colorMode } = useAppSelector((state) => state.ui);

  const colorModeSwitch = (mode: string) => {
    if (mode !== 'auto') {
      return mode === 'light' ? lightTheme : darkTheme;
    }
    const hours = new Date().getHours();
    const isDayTime = hours > 7 && hours < 18;
    return isDayTime ? lightTheme : darkTheme;
  };

  return (
    <ThemeProvider
      // theme={colorMode === 'light' ? lightTheme : darkTheme}
      theme={colorModeSwitch(colorMode)}
    >
      <GlobalStyle />
      { children }
    </ThemeProvider>
  );
};

export default GlobalTheme;
