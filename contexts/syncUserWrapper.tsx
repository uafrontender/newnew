import { newnewapi } from 'newnew-api';
import React, { useEffect } from 'react';
import { getMe } from '../api/endpoints/user';
import { logoutUserClearCookiesAndRedirect, setUserData, TUserData } from '../redux-store/slices/userStateSlice';

import { useAppDispatch, useAppSelector } from '../redux-store/store';

const SyncUserWrapper: React.FunctionComponent = ({ children }) => {
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.user);

  useEffect(() => {
    async function syncUserData () {
      // console.log('Sync user data');
      try {
        const payload = new newnewapi.EmptyRequest({});

        const { data } = await getMe(payload);

        if (data?.me) {
          dispatch(setUserData({
            username: data.me?.username,
            nickname: data.me?.nickname,
            email: data.me?.email,
            avatarUrl: data.me?.avatarUrl,
            coverUrl: data.me?.coverUrl,
            userUuid: data.me?.userUuid,
            bio: data.me?.bio,
            dateOfBirth: {
              day: data.me?.dateOfBirth?.day,
              month: data.me?.dateOfBirth?.month,
              year: data.me?.dateOfBirth?.year,
            },
            countryCode: data.me?.countryCode,
            usernameChangedAt: data.me.usernameChangedAt,

            options: {
              isActivityPrivate: data.me?.options?.isActivityPrivate,
              isCreator: data.me?.options?.isCreator,
              isVerified: data.me?.options?.isVerified,
              creatorStatus: data.me?.options?.creatorStatus,
              birthDateUpdatesLeft: data.me?.options?.birthDateUpdatesLeft,
              canChangeUsername: data.me?.options?.canChangeUsername,
              isOfferingSubscription: data.me.options?.isOfferingSubscription,
            },
          } as TUserData))
        }
      } catch (err) {
        console.error(err);
        if ((err as Error).message === 'No token') {
          dispatch(logoutUserClearCookiesAndRedirect());
        }
        // Refresh token was present, session probably expired
        // Redirect to sign up page
        if ((err as Error).message === 'Refresh token invalid') {
          dispatch(logoutUserClearCookiesAndRedirect('sign-up?reason=session_expired'));
        }
      }
    }

    if (user.loggedIn) {
      syncUserData();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      {children}
    </>
  );
};

export default SyncUserWrapper;
