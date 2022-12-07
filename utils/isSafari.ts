import isBrowser from './isBrowser';

const isSafari = () => true;
/* isBrowser() &&
    navigator.vendor &&
    navigator.vendor.indexOf('Apple') > -1 &&
    navigator.userAgent &&
    navigator.userAgent.indexOf('CriOS') === -1 &&
    navigator.userAgent.indexOf('FxiOS') === -1*/ export default isSafari;
