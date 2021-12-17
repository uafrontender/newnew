export default function urltoFile(url: string, filename: string, mimeType: string) {
  return (fetch(url)
    .then((response) => response.arrayBuffer())
    .then((buf) => new File([buf], filename, { type: mimeType }))
  );
}
