import React from 'react';

function setColorsByTheme() {
  const uiState = localStorage.getItem('persist:ui');

  console.log(uiState);

  if (uiState) {
    const colorMode = JSON.parse(uiState)?.colorMode;

    console.log(colorMode);
  }
}

const ThemeScriptTag = () => {
  const themeScript = `(${setColorsByTheme})()`;
  // eslint-disable-next-line react/no-danger
  return <script dangerouslySetInnerHTML={{ __html: themeScript }} />;
};

export default ThemeScriptTag;
