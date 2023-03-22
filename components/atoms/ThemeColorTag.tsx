import Head from 'next/head';
import React from 'react';
import { useTheme } from 'styled-components';

const ThemeColorTag = () => {
  const theme = useTheme();

  return (
    <Head>
      <meta
        name='theme-color'
        content={theme.colorsThemed.statusBar.background}
      />
    </Head>
  );
};

export default ThemeColorTag;
