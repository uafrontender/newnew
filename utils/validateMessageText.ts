function validateInputText(input: string): boolean {
  // Require at least one letter or digit
  const letterOrNumberRegex = /[a-zA-Z]/;
  if (!letterOrNumberRegex.test(input)) {
    return false;
  }

  return true;
}

export default validateInputText;
