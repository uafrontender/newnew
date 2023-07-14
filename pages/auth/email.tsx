/* eslint-disable camelcase */
import React, { useEffect, useState } from 'react';
import type { GetServerSideProps, NextPage } from 'next';
import { useRouter } from 'next/router';
import { newnewapi } from 'newnew-api';
import { useCookies } from 'react-cookie';
import { useUpdateEffect } from 'react-use';

import Lottie from '../../components/atoms/Lottie';

import { signInWithEmail } from '../../api/endpoints/auth';
import { usePushNotifications } from '../../contexts/pushNotificationsContext';

import { useSignup } from '../../contexts/signUpContext';
import { useUserData } from '../../contexts/userDataContext';

import logoAnimation from '../../public/animations/logo-loading-blue.json';
import { useAppState } from '../../contexts/appStateContext';

interface IEmailAuthRedirectPage {
  email_address: string;
  token: string;
}

const EmailAuthRedirectPage: NextPage<IEmailAuthRedirectPage> = ({
  email_address,
  token,
}) => {
  const router = useRouter();
  const [, setCookie] = useCookies();
  const { userLoggedIn, handleUserLoggedIn } = useAppState();
  const { updateUserData } = useUserData();
  const { setSignupEmailInput, setSignupTimerValue } = useSignup();
  const [isLoading, setIsLoading] = useState(false);
  const [signInError, setSignInError] = useState(false);
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
      if (isLoading) return;
      try {
        setIsLoading(true);

        if (!email_address || !token) {
          throw new Error('No token on email verification');
        }

        const requestPayload = new newnewapi.EmailSignInRequest({
          emailAddress: email_address,
          token,
        });

        const res = await signInWithEmail(requestPayload);

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
          coverUrl: data.me?.coverUrl,
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
        setSignupEmailInput('');
        setSignupTimerValue(0);

        resumePushNotification();

        setIsLoading(false);
        if (data.redirectUrl) {
          router?.replace(data.redirectUrl);
        } else if (data.me?.options?.isCreator) {
          router?.replace('/creator/dashboard');
        } else {
          router?.replace('/');
        }
      } catch (err) {
        // NB! Might need an error toast
        setIsLoading(false);
        setSignInError(true);
        // router.replace('/');
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
            flexWrap: 'wrap',
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
          {/* Temp */}
          {signInError ? (
            <div
              style={{
                position: 'absolute',
                top: 'calc(50% + 48px)',
              }}
            >
              An error occurred
            </div>
          ) : null}
        </div>
      </main>
    </div>
  );
};

export default EmailAuthRedirectPage;

export const getServerSideProps: GetServerSideProps<
  IEmailAuthRedirectPage
> = async (context) => {
  const { email_address, token } = context.query;

  if (
    !email_address ||
    !token ||
    Array.isArray(email_address) ||
    Array.isArray(token)
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
      email_address,
      token,
    },
  };
};
