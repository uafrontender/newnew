import { newnewapi } from 'newnew-api';

const getDisplayname = (user: newnewapi.IUser) => (
  user.nickname ?? `@${user.username}`
);

export default getDisplayname;
