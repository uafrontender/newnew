/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-unused-vars */
// "newnew-api": "git+https://gitlab+deploy-token-616533:gQyRAxmTQQ-CsD_6rh9J@gitlab.com:newnewinc/newnew-api#master",
import React, { useEffect, useState } from 'react';
import type { GetServerSideProps, NextPage } from 'next';
import Lottie from 'react-lottie';
import { useRouter } from 'next/router';
import { newnewapi } from 'newnew-api';

import {
  signInWithApple, signInWithFacebook, signInWithGoogle, signInWithTwitter,
} from '../api/endpoints/auth';
import { APIResponse } from '../api/apiConfigs';
import { SUPPORTED_AUTH_PROVIDERS } from '../constants/general';

import { useAppDispatch, useAppSelector } from '../redux-store/store';
import { setCredentialsData, setUserData, setUserLoggedIn } from '../redux-store/slices/userStateSlice';

import logoAnimation from '../public/animations/logo-loading-blue.json';

interface IAuthRedirectPage {
  provider: string;
}

const AuthRedirectPage: NextPage<IAuthRedirectPage> = ({
  provider,
}) => {
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.user);
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (user.loggedIn) router.push('/');
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    async function handleAuth() {
      try {
        setIsLoading(true);

        if (!provider) throw new Error('No provider');

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

        if (!res!! || res!!.error || !res.data) throw new Error(res!!.error?.message ?? 'An error occured');

        const { data } = res!!;

        if (!data) throw new Error('No data');

        console.log(data?.toJSON());

        dispatch(setUserData({
          username: data.me?.username,
          displayName: data.me?.displayName,
          email: data.me?.email,
          avatarUrl: data.me?.avatarUrl,
          userUuid: data.me?.userUuid,
          options: data.me?.options,
        }));
        dispatch(setCredentialsData({
          accessToken: data.credential?.accessToken,
          refreshToken: data.credential?.refreshToken,
          expiresAt: data.credential?.expiresAt?.seconds,
        }));
        dispatch(setUserLoggedIn(true));

        setIsLoading(false);
        router.push('/');
      } catch (err) {
        setIsLoading(false);
        console.log('Authentication failed');
        console.log(err);
        router.push('/');
      }
    }

    handleAuth();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div>
      <main>
        <div
          style={{
            width: '100vw',
            height: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Lottie
            width={64}
            height={64}
            options={{
              loop: true,
              autoplay: true,
              animationData: logoAnimation,
            }}
            isStopped={!isLoading}
          />
        </div>
      </main>
    </div>
  );
};

export default AuthRedirectPage;

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { provider } = context.query;

  if (!provider
    || Array.isArray(provider)
    || SUPPORTED_AUTH_PROVIDERS.indexOf(provider as string) === -1
  ) {
    return {
      redirect: {
        destination: '/',
        permanent: false,
      },
    };
  }

  return {
    props: {
      provider,
    },
  };
};
