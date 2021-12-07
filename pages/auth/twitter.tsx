/* eslint-disable camelcase */
import React, { useEffect, useState } from 'react';
import type { GetServerSideProps, NextPage } from 'next';
import Lottie from 'react-lottie';
import { useRouter } from 'next/router';
import { newnewapi } from 'newnew-api';

import { signInWithTwitter } from '../../api/endpoints/auth';

import { useAppDispatch, useAppSelector } from '../../redux-store/store';
import { setCredentialsData, setUserData, setUserLoggedIn } from '../../redux-store/slices/userStateSlice';

import logoAnimation from '../../public/animations/logo-loading-blue.json';

interface ITwitterAuthRedirectPage {
  oauth_token: string;
  oauth_verifier: string;
}

const TwitterAuthRedirectPage: NextPage<ITwitterAuthRedirectPage> = ({
  oauth_token,
  oauth_verifier,
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

        if (!oauth_token || !oauth_verifier) throw new Error('No token');

        const requestPayload = new newnewapi.TwitterSignInRequest({
          oauthToken: oauth_token,
          oauthVerifier: oauth_verifier,
        });

        const res = await signInWithTwitter(requestPayload);

        if (!res!! || res!!.error || !res.data) throw new Error(res!!.error?.message ?? 'An error occured');

        const { data } = res!!;

        if (!data) throw new Error('No data');

        dispatch(setUserData({
          username: data.me?.username,
          nickname: data.me?.nickname,
          email: data.me?.email,
          avatarUrl: data.me?.avatarUrl,
          coverUrl: data.me?.coverUrl,
          userUuid: data.me?.userUuid,
          bio: data.me?.bio,
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
        // NB! Might need an error toast
        setIsLoading(false);
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

export default TwitterAuthRedirectPage;

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { oauth_token, oauth_verifier } = context.query;

  if (!oauth_token
    || !oauth_verifier
    || Array.isArray(oauth_token)
    || Array.isArray(oauth_verifier)
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
      oauth_token,
      oauth_verifier,
    },
  };
};
