/* eslint-disable camelcase */
import React, { useEffect, useState } from 'react';
import type { GetServerSideProps, NextPage } from 'next';
import Router from 'next/router';
import { newnewapi } from 'newnew-api';

import Lottie from '../components/atoms/Lottie';

import { setMyEmail } from '../api/endpoints/user';

import logoAnimation from '../public/animations/logo-loading-blue.json';
import { useAppState } from '../contexts/appStateContext';
import { useUserData } from '../contexts/userDataContext';

interface IEmailUpdateRedirectPage {
  email_address: string;
  token: string;
}

const EmailUpdateRedirectPage: NextPage<IEmailUpdateRedirectPage> = ({
  email_address,
  token,
}) => {
  const { userIsCreator } = useAppState();
  const { updateUserData } = useUserData();
  const [isLoading, setIsLoading] = useState(false);
  const [signInError, setSignInError] = useState(false);

  useEffect(
    () => {
      async function handleAuth() {
        try {
          setIsLoading(true);

          if (!email_address || !token) {
            throw new Error('No token on change email');
          }

          const requestPayload = new newnewapi.SetMyEmailRequest({
            emailAddress: email_address,
            token,
          });

          const res = await setMyEmail(requestPayload);

          if (!res || res.error || !res.data) {
            throw new Error(res!!.error?.message ?? 'An error occurred');
          }

          const { data } = res;

          if (data.status !== newnewapi.SetMyEmailResponse.Status.SUCCESS) {
            throw new Error('Request failed');
          }

          if (userIsCreator) {
            updateUserData({
              email: email_address,
            });
          }

          Router.push('/');
        } catch (err) {
          // NB! Might need an error toast
          console.log(err);
          setIsLoading(false);
          setSignInError(true);
          // Router.push('/');
        }
      }

      handleAuth();
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      // email_address, - reason unknown
      // token, - reason unknown
      // updateUserData, - reason unknown
      // userIsCreator, - reason unknown
    ]
  );

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

export default EmailUpdateRedirectPage;

export const getServerSideProps: GetServerSideProps<
  IEmailUpdateRedirectPage
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
