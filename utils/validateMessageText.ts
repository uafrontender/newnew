// TODO: reconsider spaces related rules
function validateMessageText(input: string): string {
  // Don`t allow spaces at the start of the text
  let result = input.trimStart();

  // Don`t allow double spaces at the end of the text
  if (
    result.length > 1 &&
    result[result.length - 1] === ' ' &&
    result[result.length - 2] === ' '
  ) {
    result = result.trimEnd().concat(' ');
  }

  return result;
}

export default validateMessageText;
