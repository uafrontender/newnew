import isBrowser from './isBrowser';

function isWindows() {
  if (!isBrowser) {
    return false;
  }

  const windowsPlatforms = ['Win32', 'Win64', 'Windows', 'WinCE'];

  return windowsPlatforms.indexOf(window.navigator.userAgent) !== -1;
}

export default isWindows;
