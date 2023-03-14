function opnUrlInNewTab(urlToOpen: string) {
  const popupWindow = window.open(urlToOpen);
  if (popupWindow) {
    popupWindow.focus();
  } else {
    // If fails open in the same tab
    window.location.href = urlToOpen;
  }
}

export default opnUrlInNewTab;
