const textTrim = (str: string, maxCharsQty = 35): string => {
  if (str.length > maxCharsQty) {
    return `${str.substring(0, maxCharsQty)} ...`;
  }
  return str;
};

export default textTrim;
