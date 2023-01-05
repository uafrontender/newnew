async function copyToClipboard(copy: string) {
  if ('clipboard' in navigator) {
    await navigator.clipboard.writeText(copy);
  } else {
    document.execCommand('copy', true, copy);
  }
}

export default copyToClipboard;
