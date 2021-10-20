import { ReactElement } from 'react';
import { createGlobalStyle } from 'styled-components';

import { useAppSelector } from '../redux-store/store';

// TODO: Implement CSS resets, main colors and fonts in GlobalStyles
interface GlobalStylesInterface {
  colorMode: 'light' | 'dark';
}

const GlobalStyleInner = createGlobalStyle<GlobalStylesInterface>`
  body {
    color: ${({ colorMode }) => (colorMode === 'dark' ? 'white' : 'black')};
    background-color: ${({ colorMode }) => (colorMode === 'dark' ? 'black' : 'white')};
  }

  a {
    color: ${({ colorMode }) => (colorMode === 'dark' ? 'lightblue' : 'initial')};
  }
`;

const GlobalStyle = (): ReactElement => {
  const { colorMode } = useAppSelector(state => state.ui);

  return <GlobalStyleInner colorMode={colorMode} />;
};

export default GlobalStyle;
