export const formatNumber = (n: number = 0) => n
  .toFixed(2)
  .replace('.', ',')
  .replace(/\d{3}(?=(\d{3})*,)/g, (s) => `.${s}`)
  .split(',')[0]
  .replace('.', ',');
