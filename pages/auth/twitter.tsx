/* eslint-disable camelcase */
import React, { useEffect, useState } from 'react';
import type { GetServerSideProps, NextPage } from 'next';
import { useRouter } from 'next/router';
import { newnewapi } from 'newnew-api';
import { useCookies } from 'react-cookie';
import { useUpdateEffect } from 'react-use';

import Lottie from '../../components/atoms/Lottie';

import { signInWithTwitter } from '../../api/endpoints/auth';
import { usePushNotifications } from '../../contexts/pushNotificationsContext';

import logoAnimation from '../../public/animations/logo-loading-blue.json';
import { useAppState } from '../../contexts/appStateContext';
import { useUserData } from '../../contexts/userDataContext';

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
  const { userLoggedIn, handleUserLoggedIn } = useAppState();
  const { updateUserData } = useUserData();
  const [isLoading, setIsLoading] = useState(false);
  const [mounted, setMounted] = useState(false);

  const { resumePushNotification } = usePushNotifications();

  useEffect(() => {
    setMounted(true);
  }, []);

  // TODO: review these useUpdateEffect
  useUpdateEffect(() => {
    if (userLoggedIn) {
      router?.push('/');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mounted]);

  // TODO: review these useUpdateEffect
  useUpdateEffect(() => {
    async function handleAuth() {
      if (isLoading || userLoggedIn) {
        return;
      }

      try {
        setIsLoading(true);

        if (!oauth_token || !oauth_verifier) {
          throw new Error('No token on twitter verification');
        }

        const requestPayload = new newnewapi.TwitterSignInRequest({
          oauthToken: oauth_token,
          oauthVerifier: oauth_verifier,
        });

        const res = await signInWithTwitter(requestPayload);

        if (!res!! || res!!.error || !res.data) {
          throw new Error(res!!.error?.message ?? 'An error occurred');
        }

        const { data } = res!!;

        if (!data || data.status !== newnewapi.SignInResponse.Status.SUCCESS) {
          throw new Error('No data');
        }

        updateUserData({
          username: data.me?.username ?? undefined,
          nickname: data.me?.nickname,
          email: data.me?.email,
          avatarUrl: data.me?.avatarUrl ?? undefined,
          coverUrl: data.me?.coverUrl ?? undefined,
          userUuid: data.me?.userUuid ?? undefined,
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
        });

        // Set credential cookies
        if (data.credential?.expiresAt?.seconds) {
          setCookie('accessToken', data.credential?.accessToken, {
            expires: new Date(
              (data.credential.expiresAt.seconds as number) * 1000
            ),
            path: '/',
          });
        }

        setCookie('refreshToken', data.credential?.refreshToken, {
          // Expire in 10 years
          maxAge: 10 * 365 * 24 * 60 * 60,
          path: '/',
        });

        handleUserLoggedIn(data.me?.options?.isCreator ?? false);
        resumePushNotification();

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
        router?.replace('/');
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
