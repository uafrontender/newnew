import { createGlobalStyle } from 'styled-components';

// TODO: Implement CSS resets, main colors and fonts in GlobalStyles
interface GlobalStylesInterface {
  darkMode: boolean
}

const GlobalStyle = createGlobalStyle<GlobalStylesInterface>`
  body {
    color: ${(props) => (props.darkMode ? 'white' : 'black')};
    background-color: ${(props) => (props.darkMode ? 'black' : 'white')};
  }
`;

export default GlobalStyle;
