import isBrowser from './isBrowser';

const isFirefox = () =>
  isBrowser() &&
  navigator.userAgent &&
  navigator.userAgent?.toLowerCase().indexOf('firefox') > -1

export default isFirefox;
