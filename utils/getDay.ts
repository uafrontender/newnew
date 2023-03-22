const getLocalizedDay = (idx: number, locale = 'en-US') => {
  const objDate = new Date();
  objDate.setMonth(0);
  objDate.setDate(idx);
  const day = objDate.toLocaleString(locale, { day: 'numeric' });

  return day;
};

export default getLocalizedDay;
