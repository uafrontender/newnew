export const minLength = (t: any, text: string, length: number) => {
  let error = '';

  if (!text || text.length < length) {
    error = t('error.text.min', { value: length });
  }

  return error;
};

export const maxLength = (t: any, text: string, length: number) => {
  let error = '';

  if (!text || text.length > length) {
    error = t('error.text.max', { value: length });
  }

  return error;
};
