function validateInputText(input: string): boolean {
  // Require at least one letter or digit
  const whiteSpaceStringRegex = /^[\s]*$/;
  if (whiteSpaceStringRegex.test(input)) {
    return false;
  }

  return true;
}

export default validateInputText;
