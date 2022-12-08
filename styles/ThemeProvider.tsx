/* eslint-disable no-nested-ternary */
import React, { useEffect, useRef, useState } from 'react';
import { ThemeProvider } from 'styled-components';

import GlobalStyle from './globalStyles';

import getColorMode from '../utils/getColorMode';
import { useAppDispatch, useAppSelector } from '../redux-store/store';
import { darkTheme, lightTheme } from './themes';
import { setColorMode } from '../redux-store/slices/uiStateSlice';

interface IGlobalTheme {
  initialTheme: string;
  children: React.ReactNode;
}

const GlobalTheme: React.FunctionComponent<IGlobalTheme> = ({
  initialTheme,
  children,
}) => {
  const dispatch = useAppDispatch();
  const { colorMode } = useAppSelector((state) => state.ui);
  const colorModeMemo = useRef('');

  const [mounted, setMounted] = useState(false);

  const [autoThemeMatched, setAutoThemeMatched] = useState(
    initialTheme !== 'auto'
  );

  useEffect(() => {
    colorModeMemo.current = colorMode;
    setMounted(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    let timeout: any;
    const handleSwitchTheme = () => {
      dispatch(setColorMode('auto'));
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

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoThemeMatched]);

  useEffect(() => {
    if (colorModeMemo.current !== colorMode) {
      setAutoThemeMatched(true);
    }
  }, [colorMode]);

  return (
    <ThemeProvider
      theme={
        !autoThemeMatched && (initialTheme === 'auto' || colorMode === 'auto')
          ? darkTheme
          : getColorMode(!mounted ? initialTheme : colorMode) === 'light'
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
