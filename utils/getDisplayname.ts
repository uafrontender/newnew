import { newnewapi } from 'newnew-api';
import { TUserData } from '../contexts/userDataContext';

const getDisplayname = (
  user: newnewapi.IUser | newnewapi.ITinyUser | TUserData | null | undefined
) => {
  if (!user) {
    return '';
  }

  if (
    'options' in user &&
    user.options &&
    'isTombstone' in user.options &&
    user.options?.isTombstone
  ) {
    // Only visible when BE fails to provide a user (which is a bug)
    // Can't translate without passing translations as prop
    return 'Private user';
  }

  if (user?.nickname || user?.username) {
    return user?.nickname || `@${user?.username}`;
  }

  // Only visible when BE fails to provide a user (which is a bug)
  // Can't translate without passing translations as prop
  return 'Private user';
};

export default getDisplayname;
