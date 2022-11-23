/* eslint-disable camelcase */
import React, { useEffect, useState } from 'react';
import type { GetServerSideProps, NextPage } from 'next';
import { useRouter } from 'next/router';
import { newnewapi } from 'newnew-api';

import Lottie from '../components/atoms/Lottie';

import useErrorToasts from '../utils/hooks/useErrorToasts';
import { sendVerificationEmail } from '../api/endpoints/auth';
import { useAppDispatch, useAppSelector } from '../redux-store/store';
import { setSignupEmailInput } from '../redux-store/slices/userStateSlice';

import logoAnimation from '../public/animations/logo-loading-blue.json';

interface IEmailAuthRedirectPage {
  stripe_setup_intent_client_secret: string;
}

const EmailAuthRedirectPage: NextPage<IEmailAuthRedirectPage> = ({
  stripe_setup_intent_client_secret,
}) => {
  const router = useRouter();
  const dispatch = useAppDispatch();

  const { showErrorToastPredefined } = useErrorToasts();

  const user = useAppSelector((state) => state.user);
  const [isLoading, setIsLoading] = useState(false);
  const [signInError, setSignInError] = useState(false);

  useEffect(() => {
    if (user.loggedIn) router.push('/');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const controller = new AbortController();

    async function handleSendEmailRequest() {
      try {
        setIsLoading(true);

        if (!stripe_setup_intent_client_secret)
          throw new Error('No setup intent');

        const requestPayload = new newnewapi.SendVerificationEmailRequest({
          stripeSetupIntentClientSecret: stripe_setup_intent_client_secret,
          useCase:
            newnewapi.SendVerificationEmailRequest.UseCase
              .SIGN_UP_WITH_STRIPE_SESSION,
        });

        const res = await sendVerificationEmail(
          requestPayload,
          controller.signal
        );

        if (!res!! || res!!.error || !res.data)
          throw new Error(res!!.error?.message ?? 'An error occurred');

        const { data } = res!!;

        if (
          !data ||
          data.status !== newnewapi.SendVerificationEmailResponse.Status.SUCCESS
        )
          throw new Error('No data');

        dispatch(setSignupEmailInput(data.emailAddress));

        setIsLoading(false);
        router.replace('/verify-email');
      } catch (err: any) {
        setIsLoading(false);
        setSignInError(true);

        console.log(err.message, 'error');

        // check if request wasn't aborted
        if (err.message !== 'The user aborted a request.') {
          showErrorToastPredefined(undefined);
        }

        // router.push('/');
      }
    }

    handleSendEmailRequest();

    return () => {
      controller.abort();
    };
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
              An error occurred
            </div>
          ) : null}
        </div>
      </main>
    </div>
  );
};

export default EmailAuthRedirectPage;

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { stripe_setup_intent_client_secret } = context.query;

  if (
    !stripe_setup_intent_client_secret ||
    Array.isArray(stripe_setup_intent_client_secret)
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
      stripe_setup_intent_client_secret,
    },
  };
};
