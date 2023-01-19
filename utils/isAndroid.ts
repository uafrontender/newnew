import isBrowser from './isBrowser';

function isAndroid() {
  if (isBrowser())
    return (
      [
        'android',
        'Android',
      ].includes(navigator.platform) ||
      ((navigator.userAgent.includes('Android') || navigator.userAgent.includes('android')) && 'ontouchend' in document)
    );
  return false;
}

export default isAndroid;
