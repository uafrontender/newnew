export interface IAstrologySigns {
  Cake: any,
  Aquarius: any,
  Pisces: any,
  Aries: any,
  Taurus: any,
  Gemini: any,
  Cancer: any,
  Leo: any,
  Virgo: any,
  Libra: any,
  Scorpio: any,
  Sagittarius: any,
  Capricorn: any,
  Invalid: any,
}

const findAstrologySign = (date: Date | undefined): keyof IAstrologySigns => {
  if (!date) return 'Cake';

  // if (date.getFullYear() > new Date().getFullYear() - 18) return 'Invalid';

  const days = [21, 20, 21, 21, 22, 22, 23, 24, 24, 24, 23, 22];
  const signs = ['Aquarius', 'Pisces', 'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 'Libra', 'Scorpio', 'Sagittarius', 'Capricorn'];
  let month = date.getMonth();
  const day = date.getDate();
  if (month === 0 && day <= 20) {
    month = 11;
  } else if (day < days[month]) {
    month -= 1;
  }
  return signs[month] as keyof IAstrologySigns;
};

export default findAstrologySign;
