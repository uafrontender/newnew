export const formatNumber = (n: number = 0) => {
  if (n.toString().length <= 3) {
    return n;
  }

  return n
    .toFixed(2)
    .replace('.', ',')
    .replace(/\d{3}(?=(\d{3})*,)/g, (s) => `.${s}`)
    .split(',')[0]
    .replace('.', ',');
};
