interface FormattedTimeLeft {
  value: number;
  unit: 'day' | 'days' | 'month' | 'months' | 'year' | 'years';
}

// This is a very specific formatter to display bundle time left
// A month here is always 30 days
// And it is done the way it is, to fit the format requirements
function formatTimeLeft(timeLeft: number): FormattedTimeLeft[] | undefined {
  const daysLeft = Math.ceil(timeLeft / 1000 / 60 / 60 / 24);
  const monthsLeft = Math.floor(daysLeft / 30);
  const yearsLeft = Math.floor(monthsLeft / 12);

  if (yearsLeft > 0) {
    const remainingMonths = monthsLeft - yearsLeft * 12;
    const months: FormattedTimeLeft[] =
      remainingMonths === 0
        ? []
        : remainingMonths === 1
        ? [{ value: 1, unit: 'month' }]
        : [{ value: remainingMonths, unit: 'months' }];

    if (yearsLeft === 1) {
      return [{ value: 1, unit: 'year' }, ...months];
    }

    return [{ value: yearsLeft, unit: 'years' }, ...months];
  }

  if (monthsLeft > 1) {
    return [{ value: monthsLeft, unit: 'months' }];
  }

  if (monthsLeft === 1) {
    return [{ value: 1, unit: 'month' }];
  }

  if (daysLeft > 1) {
    return [{ value: daysLeft, unit: 'days' }];
  }

  if (daysLeft === 1) {
    return [{ value: 1, unit: 'day' }];
  }

  return undefined;
}

export default formatTimeLeft;
