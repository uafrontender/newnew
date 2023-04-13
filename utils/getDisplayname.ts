import { newnewapi } from 'newnew-api';
import { TUserData } from '../redux-store/slices/userStateSlice';

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
    // TODO: Add translation? Change it?
    return 'Private user';
  }

  if (user?.nickname || user?.username) {
    return user?.nickname || `@${user?.username}`;
  }

  // TODO: Add translation? Change it?
  return 'Private user';
};

export default getDisplayname;
