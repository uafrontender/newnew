/* eslint-disable consistent-return */
import React from 'react';

function getBrowserVisibilityProp() {
  if (typeof document.hidden !== 'undefined') {
    // Opera 12.10 and Firefox 18 and later support
    return 'visibilitychange';
  }

  if (typeof (document as any).msHidden !== 'undefined') {
    return 'msvisibilitychange';
  }

  if (typeof (document as any).webkitHidden !== 'undefined') {
    return 'webkitvisibilitychange';
  }

  return 'visibilitychange';
}

function getBrowserDocumentHiddenProp() {
  if (typeof document.hidden !== 'undefined') {
    return 'hidden';
  }

  if (typeof (document as any).msHidden !== 'undefined') {
    return 'msHidden';
  }

  if (typeof (document as any).webkitHidden !== 'undefined') {
    return 'webkitHidden';
  }

  return 'hidden';
}

function getIsDocumentHidden() {
  return typeof document !== 'undefined'
    ? (document as any)[getBrowserDocumentHiddenProp()]
    : false;
}

export default function usePageVisibility() {
  const [isVisible, setIsVisible] = React.useState(getIsDocumentHidden());
  const onVisibilityChange = () => setIsVisible(getIsDocumentHidden());

  React.useEffect(() => {
    const visibilityChange = getBrowserVisibilityProp();

    document.addEventListener(visibilityChange, onVisibilityChange, false);

    return () => {
      document.removeEventListener(visibilityChange, onVisibilityChange);
    };
  });

  return isVisible;
}
