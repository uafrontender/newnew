import { newnewapi } from 'newnew-api';

function getDeletedUserPlaceholder(): newnewapi.IUser {
  return {
    options: {
      isTombstone: true,
    },
  };
}

export default getDeletedUserPlaceholder;
