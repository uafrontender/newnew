/* eslint-disable camelcase */
import React, { useEffect, useState } from 'react';
import type { GetServerSideProps, NextPage } from 'next';
import Lottie from 'react-lottie';
import { useRouter } from 'next/router';
import { newnewapi } from 'newnew-api';

import { signInWithEmail } from '../../api/endpoints/auth';

import { useAppDispatch, useAppSelector } from '../../redux-store/store';
import { setCredentialsData, setUserData, setUserLoggedIn } from '../../redux-store/slices/userStateSlice';

import logoAnimation from '../../public/animations/logo-loading-blue.json';

interface IEmailAuthRedirectPage {
  email_address: string;
  token: string;
}

const EmailAuthRedirectPage: NextPage<IEmailAuthRedirectPage> = ({
  email_address,
  token,
}) => {
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.user);
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [signInError, setSignInError] = useState(false);

  useEffect(() => {
    if (user.loggedIn) router.push('/');
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    async function handleAuth() {
      try {
        setIsLoading(true);

        if (!email_address || !token) throw new Error('No token');

        const requestPayload = new newnewapi.EmailSignInRequest({
          emailAddress: email_address,
          token,
        });

        const res = await signInWithEmail(requestPayload);

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
        setSignInError(true);
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
              An error occured
            </div>
          ) : null}
        </div>
      </main>
    </div>
  );
};

export default EmailAuthRedirectPage;

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { email_address, token } = context.query;

  if (!email_address
    || !token
    || Array.isArray(email_address)
    || Array.isArray(token)
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
