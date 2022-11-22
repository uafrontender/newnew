/* eslint-disable no-nested-ternary */
import React, { useEffect, useRef, useState } from 'react';
import { ThemeProvider } from 'styled-components';
import { useRouter } from 'next/router';

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
  const router = useRouter();
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
    // Change theme when routing to a new page
    const handleRouteChange = (url: string) => {
      dispatch(setColorMode('auto'));
      setAutoThemeMatched(true);
    };

    if (!autoThemeMatched) {
      router.events.on('routeChangeComplete', handleRouteChange);
    } else {
      router.events.off('routeChangeComplete', handleRouteChange);
    }

    return () => {
      router.events.off('routeChangeComplete', handleRouteChange);
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
