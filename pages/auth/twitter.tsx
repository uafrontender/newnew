/* eslint-disable camelcase */
import React, { useEffect, useState } from 'react';
import type { GetServerSideProps, NextPage } from 'next';
import { useRouter } from 'next/router';
import { newnewapi } from 'newnew-api';
import { useCookies } from 'react-cookie';
import { useUpdateEffect } from 'react-use';

import Lottie from '../../components/atoms/Lottie';

import { signInWithTwitter } from '../../api/endpoints/auth';

import { useAppDispatch, useAppSelector } from '../../redux-store/store';
import {
  setUserData,
  setUserLoggedIn,
} from '../../redux-store/slices/userStateSlice';

import logoAnimation from '../../public/animations/logo-loading-blue.json';

interface ITwitterAuthRedirectPage {
  oauth_token: string;
  oauth_verifier: string;
}

const TwitterAuthRedirectPage: NextPage<ITwitterAuthRedirectPage> = ({
  oauth_token,
  oauth_verifier,
}) => {
  const router = useRouter();
  const [, setCookie] = useCookies();
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.user);
  const [isLoading, setIsLoading] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useUpdateEffect(() => {
    if (user.loggedIn) router?.push('/');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mounted]);

  useUpdateEffect(() => {
    async function handleAuth() {
      if (isLoading || user.loggedIn) return;
      try {
        setIsLoading(true);

        if (!oauth_token || !oauth_verifier) throw new Error('No token');

        const requestPayload = new newnewapi.TwitterSignInRequest({
          oauthToken: oauth_token,
          oauthVerifier: oauth_verifier,
        });

        const res = await signInWithTwitter(requestPayload);

        if (!res!! || res!!.error || !res.data)
          throw new Error(res!!.error?.message ?? 'An error occurred');

        const { data } = res!!;

        if (!data || data.status !== newnewapi.SignInResponse.Status.SUCCESS)
          throw new Error('No data');

        dispatch(
          setUserData({
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
            options: {
              isActivityPrivate: data.me?.options?.isActivityPrivate,
              isCreator: data.me?.options?.isCreator,
              isVerified: data.me?.options?.isVerified,
              creatorStatus: data.me?.options?.creatorStatus,
            },
          })
        );
        // Set credential cookies
        if (data.credential?.expiresAt?.seconds)
          setCookie('accessToken', data.credential?.accessToken, {
            expires: new Date(
              (data.credential.expiresAt.seconds as number) * 1000
            ),
            path: '/',
          });
        setCookie('refreshToken', data.credential?.refreshToken, {
          // Expire in 10 years
          maxAge: 10 * 365 * 24 * 60 * 60,
          path: '/',
        });

        dispatch(setUserLoggedIn(true));

        setIsLoading(false);
        if (data.redirectUrl) {
          router?.push(data.redirectUrl);
        } else if (data.me?.options?.isCreator) {
          router?.push('/creator/dashboard');
        } else {
          router?.push('/');
        }
      } catch (err) {
        // NB! Might need an error toast
        setIsLoading(false);
        router?.push('/');
      }
    }

    handleAuth();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mounted]);

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

export const getServerSideProps: GetServerSideProps<
  ITwitterAuthRedirectPage
> = async (context) => {
  const { oauth_token, oauth_verifier } = context.query;

  if (
    !oauth_token ||
    !oauth_verifier ||
    Array.isArray(oauth_token) ||
    Array.isArray(oauth_verifier)
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
