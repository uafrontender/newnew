import { newnewapi } from 'newnew-api';

const genderPronouns = [
  {
    name: 'unknown',
    value: newnewapi.User.GenderPronouns.UNKNOWN,
    key: newnewapi.User.GenderPronouns[newnewapi.User.GenderPronouns.UNKNOWN],
  },
  {
    name: 'none',
    value: newnewapi.User.GenderPronouns.NONE,
    key: newnewapi.User.GenderPronouns[newnewapi.User.GenderPronouns.NONE],
  },
  {
    name: 'feminine',
    value: newnewapi.User.GenderPronouns.SHE_HER,
    key: newnewapi.User.GenderPronouns[newnewapi.User.GenderPronouns.SHE_HER],
  },
  {
    name: 'masculine',
    value: newnewapi.User.GenderPronouns.HE_HIM,
    key: newnewapi.User.GenderPronouns[newnewapi.User.GenderPronouns.HE_HIM],
  },
  {
    name: 'neutral',
    value: newnewapi.User.GenderPronouns.THEY_THEM,
    key: newnewapi.User.GenderPronouns[newnewapi.User.GenderPronouns.THEY_THEM],
  },
];

export default genderPronouns;
