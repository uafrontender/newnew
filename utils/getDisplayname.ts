import { newnewapi } from 'newnew-api';

const getDisplayname = (user: newnewapi.IUser) => {
  if (user.options?.isTombstone) return 'Private user';

  if (user?.nickname || user?.username) {
    return user?.nickname ?? `@${user?.username}`;
  }

  return 'Private user';
};

export default getDisplayname;
