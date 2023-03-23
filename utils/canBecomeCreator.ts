import { newnewapi } from 'newnew-api';

function canBecomeCreator(
  dateOfBirth: newnewapi.IDateComponents | null | undefined,
  minCreatorAgeYears: number | undefined
) {
  if (
    !dateOfBirth ||
    !dateOfBirth.year ||
    !dateOfBirth.month ||
    !dateOfBirth.day ||
    !minCreatorAgeYears
  ) {
    return true;
  }

  const bornAtMax = new Date();
  bornAtMax.setFullYear(new Date().getFullYear() - minCreatorAgeYears);
  const bornAt = new Date(
    dateOfBirth.year,
    dateOfBirth.month - 1,
    dateOfBirth.day
  );

  return bornAt < bornAtMax;
}

export default canBecomeCreator;
