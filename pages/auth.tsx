/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-unused-vars */
// "newnew-api": "git+https://gitlab+deploy-token-616533:gQyRAxmTQQ-CsD_6rh9J@gitlab.com:newnewinc/newnew-api#master",
import React, { useEffect, useState } from 'react';
import type { NextPage } from 'next';
import { useRouter } from 'next/router';
import { newnewapi } from 'newnew-api';

import {
  BASE_URL_AUTH,
  signInWithApple, signInWithFacebook, signInWithGoogle, signInWithTwitter,
} from '../api/endpoints/auth';
import { APIResponse } from '../api/apiConfigs';
import { SUPPORTED_AUTH_PROVIDERS } from '../constants/general';
import { useAppDispatch } from '../redux-store/store';
import { setCredentialsData, setUserData, setUserLoggedIn } from '../redux-store/slices/userStateSlice';

const AuthRedirectPage: NextPage = () => {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    async function handleAuth() {
      try {
        setIsLoading(true);

        const { provider } = router.query;

        if (!provider
          || Array.isArray(provider)
          || SUPPORTED_AUTH_PROVIDERS.indexOf(provider as string) === -1
        ) throw new Error('Wrong provider');

        let res: APIResponse<newnewapi.SignInResponse>;

        if (provider === 'google') {
          const { code } = router.query;

          if (!code || Array.isArray(code)) throw new Error('No code');

          const requestPayload = new newnewapi.GoogleSignInRequest({
            code,
          });

          res = await signInWithGoogle(requestPayload);
        } else {
          console.log(`${provider} to be done.`);
          return;
        }

        console.log(res!!);
        console.log(res!!.data);

        if (!res!! || res!!.error || !res.data) throw new Error(res!!.error?.message ?? 'An error occured');

        const { data } = res!!;

        if (!data) throw new Error('No data');

        console.log(data?.toJSON());

        dispatch(setUserData(data.me));
        dispatch(setCredentialsData({
          accessToken: data.credential?.accessToken,
          refreshToken: data.credential?.refreshToken,
          expiresAt: data.credential?.expiresAt?.seconds,
        }));
        dispatch(setUserLoggedIn(true));

        setIsLoading(false);
        // router.push('/');
      } catch (err) {
        setIsLoading(false);
        console.log('Authentication failed');
        console.log(err);
        // router.push('/');
      }
    }

    handleAuth();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div>
      <main>
        <h1>
          Redirect page
        </h1>
        {isLoading ? <div>Loading...</div> : null}
      </main>
    </div>
  );
};

export default AuthRedirectPage;
