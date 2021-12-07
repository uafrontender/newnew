const getLocalizedMonth = (idx: number, locale = 'en-US') => {
  const objDate = new Date();
  objDate.setDate(1);
  objDate.setMonth(idx);
  const month = objDate.toLocaleString(locale, { month: 'long' });

  return month.charAt(0).toUpperCase() + month.slice(1);
};

export default getLocalizedMonth;
