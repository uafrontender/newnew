import React, { useEffect, useState } from 'react';
import { ThemeProvider } from 'styled-components';
import { useCookies } from 'react-cookie';

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
  const [cookies] = useCookies();

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    if (!cookies?.colorMode) {
      dispatch(setColorMode('auto'));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cookies.colorMode]);

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
