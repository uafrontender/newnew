/* eslint-disable no-nested-ternary */
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ThemeProvider } from 'styled-components';

import GlobalStyle from './globalStyles';

import getColorMode from '../utils/getColorMode';
import { darkTheme, lightTheme } from './themes';
import ThemeColorTag from '../components/atoms/ThemeColorTag';
import { useUiState } from '../contexts/uiStateContext';

interface IGlobalTheme {
  initialTheme: string;
  themeFromCookie?: 'light' | 'dark';
  children: React.ReactNode;
}

const GlobalTheme: React.FunctionComponent<IGlobalTheme> = ({
  initialTheme,
  themeFromCookie,
  children,
}) => {
  const { colorMode, setColorMode } = useUiState();
  const colorModeMemo = useRef('');

  const [mounted, setMounted] = useState(false);

  const [autoThemeMatched, setAutoThemeMatched] = useState(
    initialTheme !== 'auto'
  );

  const themeProp = useMemo(
    () =>
      !autoThemeMatched && (initialTheme === 'auto' || colorMode === 'auto')
        ? themeFromCookie
          ? themeFromCookie === 'light'
            ? lightTheme
            : darkTheme
          : darkTheme
        : getColorMode(!mounted ? initialTheme : colorMode) === 'light'
        ? lightTheme
        : darkTheme,
    [autoThemeMatched, colorMode, initialTheme, mounted, themeFromCookie]
  );

  useEffect(
    () => {
      colorModeMemo.current = colorMode;
      setMounted(true);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      // colorMode, - reason unknown
    ]
  );

  useEffect(
    () => {
      let timeout: any;
      const handleSwitchTheme = () => {
        setColorMode('auto');
        setAutoThemeMatched(true);
      };

      if (!autoThemeMatched) {
        timeout = setTimeout(() => {
          handleSwitchTheme();
        }, 1500);
      } else {
        clearTimeout(timeout);
      }

      return () => {
        clearTimeout(timeout);
      };
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      autoThemeMatched,
      // colorMode, - reason unknown
      // setColorMode, - reason unknown
    ]
  );

  useEffect(() => {
    if (colorModeMemo.current !== colorMode) {
      setAutoThemeMatched(true);
    }
  }, [colorMode]);

  return (
    <ThemeProvider theme={themeProp}>
      <GlobalStyle />
      <ThemeColorTag />
      {children}
    </ThemeProvider>
  );
};

export default GlobalTheme;
