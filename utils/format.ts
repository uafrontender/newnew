export const formatNumber = (value: number = 0, rounded: boolean = false) =>
  new Intl.NumberFormat('en', {
    minimumFractionDigits: rounded ? 0 : 2,
  }).format(value || 0);

export const formatString = (
  value: string = '',
  ellipsis: boolean = false,
  maxLength: number = 11
) => {
  if (value.length <= maxLength) {
    return value;
  }

  let formatted = value.slice(0, maxLength);

  if (ellipsis) {
    formatted += '...';
  }

  return formatted;
};

export const splitNumber = (value: number) => {
  const reversedSymbols = Array.from(value.toString()).reverse();
  const reversedResult: string[] = [];

  for (let i = 0; i < reversedSymbols.length; i++) {
    if (i > 0 && i % 3 === 0) {
      reversedResult.push(',');
    }

    reversedResult.push(reversedSymbols[i]);
  }

  return reversedResult.reverse().join('');
};
