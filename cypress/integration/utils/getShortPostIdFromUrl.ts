function getShortPostIdFromUrl(url: string): string {
  const postShortIdRegex = /p\/([^\/]{1,14})/;
  return url.match(postShortIdRegex)[1];
}

export default getShortPostIdFromUrl;
