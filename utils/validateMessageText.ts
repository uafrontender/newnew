function validateInputText(input: string): boolean {
  // Don't allow whitespace only strings
  const whiteSpaceStringRegex = /^[\s]*$/;
  if (whiteSpaceStringRegex.test(input)) {
    return false;
  }

  return true;
}

export default validateInputText;
