export const getColorMode = (mode: string) => {
  if (mode !== 'auto') {
    return mode;
  }

  const hours = new Date().getHours();
  const isDayTime = hours > 7 && hours < 18;

  return isDayTime ? 'light' : 'dark';
};

export default getColorMode;
