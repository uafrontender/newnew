import { newnewapi } from 'newnew-api';
import genderPronouns from '../constants/genderPronouns';

const getGenderPronouns = (keyOrValue?: string | number | null) => {
  if (!keyOrValue) {
    return genderPronouns.find(
      (genderP) => genderP.value === newnewapi.User.GenderPronouns.NONE
    )!!;
  }

  const unknownGenderPronouns = genderPronouns.find(
    (genderP) => genderP.value === newnewapi.User.GenderPronouns.UNKNOWN
  )!!;

  // in case of key
  if (typeof keyOrValue === 'string') {
    return (
      genderPronouns.find((genderP) => genderP.key === keyOrValue) ??
      unknownGenderPronouns
    );
  }

  // in case of value
  if (typeof keyOrValue === 'number') {
    return (
      genderPronouns.find((genderP) => genderP.value === keyOrValue) ??
      unknownGenderPronouns
    );
  }

  return unknownGenderPronouns;
};

export const isGenderPronounsDefined = (
  keyOrValue?: string | number | null
) => {
  if (!keyOrValue) {
    return false;
  }

  if (
    getGenderPronouns(keyOrValue).value ===
      newnewapi.User.GenderPronouns.UNKNOWN ||
    getGenderPronouns(keyOrValue).value === newnewapi.User.GenderPronouns.NONE
  ) {
    return false;
  }

  return true;
};

export default getGenderPronouns;
