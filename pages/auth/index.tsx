/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable camelcase */
import React, { useEffect, useState } from 'react';
import type { GetServerSideProps, NextPage } from 'next';
import Lottie from 'react-lottie';
import { useRouter } from 'next/router';
import { newnewapi } from 'newnew-api';
import jsonwebtoken from 'jsonwebtoken';
import getRawBody from 'raw-body';
import qs from 'querystring';

import {
  signInWithApple,
  signInWithFacebook, signInWithGoogle,
} from '../../api/endpoints/auth';
import { APIResponse } from '../../api/apiConfigs';
import { SUPPORTED_AUTH_PROVIDERS } from '../../constants/general';

import { useAppDispatch, useAppSelector } from '../../redux-store/store';
import { setCredentialsData, setUserData, setUserLoggedIn } from '../../redux-store/slices/userStateSlice';

import logoAnimation from '../../public/animations/logo-loading-blue.json';

type TAppleResponseBody = {
  state: string;
  code: string;
  id_token: string;
  sub?: string;
  user?: any
}

interface IAuthRedirectPage {
  provider: string;
  body?: TAppleResponseBody;
}

const AuthRedirectPage: NextPage<IAuthRedirectPage> = ({
  provider,
  body,
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

          console.log(requestPayload);

          res = await signInWithGoogle(requestPayload);
        } else if (provider === 'fb') {
          const { code } = router.query;

          if (!code || Array.isArray(code)) throw new Error('No code');

          const requestPayload = new newnewapi.FacebookSignInRequest({
            code,
          });

          console.log(requestPayload);

          res = await signInWithFacebook(requestPayload);
        } else if (provider === 'apple') {
          console.log(body);

          if (!body) throw new Error('No body receieved');

          const {
            id_token, sub,
          } = body;

          if (!id_token || Array.isArray(id_token)) throw new Error('No code');
          if (!sub || Array.isArray(sub)) throw new Error('No user id');

          const requestPayload = new newnewapi.AppleSignInRequest({
            identityToken: id_token,
            userId: sub,
          });

          console.log(requestPayload);

          res = await signInWithApple(requestPayload);
        } else {
          console.log(`${provider} not supported.`);
          throw new Error('Provider not supported');
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
        // Temp!
        // router.push('/');
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

  if (!provider
    || Array.isArray(provider)
    || SUPPORTED_AUTH_PROVIDERS.indexOf(provider as string) === -1
    || (provider === 'apple' && (!bodyParsed!! || !bodyParsed.sub))
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
      body: bodyParsed! ?? undefined,
    },
  };
};
