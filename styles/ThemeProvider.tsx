import React, { useEffect, useState } from 'react';
import { ThemeProvider } from 'styled-components';

import GlobalStyle from './globalStyles';

import getColorMode from '../utils/getColorMode';
import { useAppSelector } from '../redux-store/store';
import { darkTheme, lightTheme } from './themes';

const GlobalTheme: React.FunctionComponent<{
  children: React.ReactNode;
  initialTheme: string;
}> = ({ initialTheme, children }) => {
  const { colorMode } = useAppSelector((state) => state.ui);

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <ThemeProvider
      theme={
        getColorMode(!mounted ? initialTheme : colorMode) === 'light'
          ? lightTheme
          : darkTheme
      }
    >
      <GlobalStyle />
      {children}
    </ThemeProvider>
  );
};

export default GlobalTheme;
