function isStringEmpty(value: string) {
  const onlySpacesRegex = /^\s+$/;
  return onlySpacesRegex.test(value);
}

export default isStringEmpty;
