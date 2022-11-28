/* eslint-disable consistent-return */
/* eslint-disable no-else-return */
import React from 'react'

function getBrowserVisibilityProp() {
  if (typeof document.hidden !== "undefined") {
    // Opera 12.10 and Firefox 18 and later support
    return "visibilitychange"
    // @ts-ignore
  } else if (typeof document.msHidden !== "undefined") {
    return "msvisibilitychange"
    // @ts-ignore
  } else if (typeof document.webkitHidden !== "undefined") {
    return "webkitvisibilitychange"
  }

  return "visibilitychange"
}

function getBrowserDocumentHiddenProp() {
  if (typeof document.hidden !== "undefined") {
    return "hidden"
    // @ts-ignore
  } else if (typeof document.msHidden !== "undefined") {
    return "msHidden"
    // @ts-ignore
  } else if (typeof document.webkitHidden !== "undefined") {
    return "webkitHidden"
  }
  return "hidden"
}

function getIsDocumentHidden() {
  // @ts-ignore
  return typeof document !== 'undefined' ? !document[getBrowserDocumentHiddenProp()] : false
}

export default function usePageVisibility() {
  const [isVisible, setIsVisible] = React.useState(getIsDocumentHidden())
  const onVisibilityChange = () => setIsVisible(getIsDocumentHidden())

  React.useEffect(() => {
    const visibilityChange = getBrowserVisibilityProp()

    document.addEventListener(visibilityChange, onVisibilityChange, false)

    return () => {
      document.removeEventListener(visibilityChange, onVisibilityChange)
    }
  })

  return isVisible
}
