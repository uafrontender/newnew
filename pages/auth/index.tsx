/* eslint-disable camelcase */
import React, { useEffect, useState, useRef } from 'react';
import { useCookies } from 'react-cookie';
import type { GetServerSideProps, NextPage } from 'next';
import { useRouter } from 'next/router';
import { newnewapi } from 'newnew-api';
import jsonwebtoken from 'jsonwebtoken';
import getRawBody from 'raw-body';
import qs from 'querystring';
import { useUpdateEffect } from 'react-use';

import Lottie from '../../components/atoms/Lottie';

import {
  signInWithApple,
  signInWithFacebook,
  signInWithGoogle,
} from '../../api/endpoints/auth';
import { APIResponse } from '../../api/apiConfigs';
import { SUPPORTED_AUTH_PROVIDERS } from '../../constants/general';

import { usePushNotifications } from '../../contexts/pushNotificationsContext';

import logoAnimation from '../../public/animations/logo-loading-blue.json';
import { useAppState } from '../../contexts/appStateContext';
import { useUserData } from '../../contexts/userDataContext';

type TAppleResponseBody = {
  state: string;
  code: string;
  id_token: string;
  sub?: string;
  user?: any;
};

interface IAuthRedirectPage {
  provider: string;
  body?: TAppleResponseBody;
}

const AuthRedirectPage: NextPage<IAuthRedirectPage> = ({ provider, body }) => {
  const router = useRouter();
  const [, setCookie] = useCookies();
  const { userLoggedIn, handleUserLoggedIn } = useAppState();
  const { updateUserData } = useUserData();
  const loading = useRef(false);
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
      if (loading.current || userLoggedIn) {
        return;
      }

      try {
        setIsLoading(true);
        loading.current = true;

        if (!provider) {
          throw new Error('No provider');
        }

        let res: APIResponse<newnewapi.SignInResponse>;

        if (provider === 'google') {
          const { code, state } = router.query;

          if (!code || Array.isArray(code)) {
            throw new Error('No code');
          }

          const requestPayload = new newnewapi.GoogleSignInRequest({
            code,
            state: state as string,
          });

          res = await signInWithGoogle(requestPayload);
        } else if (provider === 'fb') {
          const { code, state } = router.query;

          if (!code || Array.isArray(code)) {
            throw new Error('No code');
          }

          const requestPayload = new newnewapi.FacebookSignInRequest({
            code,
            state: state as string,
          });

          res = await signInWithFacebook(requestPayload);
        } else if (provider === 'apple') {
          if (!body) {
            throw new Error('No body receieved');
          }

          const { id_token, sub, state } = body;

          if (!id_token || Array.isArray(id_token)) {
            throw new Error('No code');
          }

          if (!sub || Array.isArray(sub)) {
            throw new Error('No user id');
          }

          const requestPayload = new newnewapi.AppleSignInRequest({
            identityToken: id_token,
            userId: sub,
            state: state as string,
          });

          res = await signInWithApple(requestPayload);
        } else {
          throw new Error('Provider not supported');
        }

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
        resumePushNotification();

        setIsLoading(false);
        loading.current = false;
        if (data.redirectUrl) {
          router?.replace(data.redirectUrl);
        } else if (data.me?.options?.isCreator) {
          router?.replace('/creator/dashboard');
        } else {
          router?.replace('/');
        }
      } catch (err) {
        // NB! Might need an error toast
        console.error(err);
        setIsLoading(false);
        loading.current = false;
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

export default AuthRedirectPage;

export const getServerSideProps: GetServerSideProps<IAuthRedirectPage> = async (
  context
) => {
  try {
    const { provider } = context.query;

    const { req } = context;

    let body: any;
    let bodyStringified: string;
    let bodyParsed: TAppleResponseBody;
    let idTokenDecoded: any;

    if (req.method === 'POST' && provider && provider === 'apple') {
      body = await getRawBody(req, {
        encoding: 'utf-8',
      });

      if (body) {
        body = qs.parse(body);
        if (body.user) {
          body.user = JSON.parse(body.user);
        }

        bodyStringified = JSON.stringify(body);
        bodyParsed = JSON.parse(bodyStringified);
        idTokenDecoded = jsonwebtoken.decode(bodyParsed.id_token);
        if (idTokenDecoded && idTokenDecoded.sub) {
          bodyParsed.sub = idTokenDecoded.sub;
        }
      }
    }

    if (
      !provider ||
      Array.isArray(provider) ||
      SUPPORTED_AUTH_PROVIDERS.indexOf(provider as string) === -1 ||
      (provider === 'apple' && (!bodyParsed!! || !bodyParsed.sub))
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
        ...(bodyParsed! ? { body: bodyParsed } : {}),
      },
    };
  } catch (err) {
    return {
      redirect: {
        destination: '/',
        permanent: false,
      },
    };
  }
};
