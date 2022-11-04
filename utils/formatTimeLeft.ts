function formatTimeLeft(timeLeft: number): {
  value: number;
  unit: 'day' | 'days' | 'month' | 'months';
} {
  const daysLeft = Math.ceil(timeLeft / 1000 / 60 / 60 / 24);
  const monthsLeft = Math.floor(daysLeft / 30);

  if (monthsLeft > 1) {
    return { value: monthsLeft, unit: 'months' };
  }

  if (monthsLeft === 1) {
    return { value: 1, unit: 'month' };
  }

  if (daysLeft > 1) {
    return { value: daysLeft, unit: 'days' };
  }

  return { value: 1, unit: 'day' };
}

export default formatTimeLeft;
