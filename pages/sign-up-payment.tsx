/* eslint-disable camelcase */
import React, { useEffect, useState } from 'react';
import type { GetServerSideProps, NextPage } from 'next';
import { useRouter } from 'next/router';
import { newnewapi } from 'newnew-api';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';

import Lottie from '../components/atoms/Lottie';

import useErrorToasts from '../utils/hooks/useErrorToasts';
import { sendVerificationEmail } from '../api/endpoints/auth';
import logoAnimation from '../public/animations/logo-loading-blue.json';
import { SUPPORTED_LANGUAGES } from '../constants/general';
import useGoBackOrRedirect from '../utils/useGoBackOrRedirect';
import { useAppState } from '../contexts/appStateContext';
import { useSignup } from '../contexts/signUpContext';

interface IEmailAuthRedirectPage {
  stripe_setup_intent_client_secret: string;
}

const EmailAuthRedirectPage: NextPage<IEmailAuthRedirectPage> = ({
  stripe_setup_intent_client_secret,
}) => {
  const router = useRouter();
  const { goBackOrRedirect } = useGoBackOrRedirect();
  const { setSignupEmailInput, setSignupTimerValue } = useSignup();

  const { showErrorToastPredefined } = useErrorToasts();
  const { userLoggedIn } = useAppState();
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (userLoggedIn) {
      router.replace('/');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const controller = new AbortController();

    async function handleSendEmailRequest() {
      try {
        setIsLoading(true);

        if (!stripe_setup_intent_client_secret) {
          throw new Error('No setup intent');
        }

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

        if (!res || res.error || !res.data) {
          throw new Error(res!!.error?.message ?? 'An error occurred');
        }

        const { data } = res;

        if (
          data.status !==
            newnewapi.SendVerificationEmailResponse.Status.SUCCESS &&
          data.status !==
            newnewapi.SendVerificationEmailResponse.Status.SHOULD_RETRY_AFTER
        ) {
          throw new Error('No data');
        }

        setSignupEmailInput(data.emailAddress);
        setSignupTimerValue(data.retryAfter);

        setIsLoading(false);
        router.replace('/verify-email');
      } catch (err: any) {
        setIsLoading(false);

        // check if request wasn't aborted
        if (err.message === 'The user aborted a request.') {
          return;
        }

        showErrorToastPredefined(undefined);
        console.error(err.message, 'error');
        goBackOrRedirect('/');
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
        </div>
      </main>
    </div>
  );
};

export default EmailAuthRedirectPage;

export const getServerSideProps: GetServerSideProps<
  IEmailAuthRedirectPage
> = async (context) => {
  const { stripe_setup_intent_client_secret } = context.query;

  const translationContext = await serverSideTranslations(
    context.locale!!,
    ['common', 'page-SignUp'],
    null,
    SUPPORTED_LANGUAGES
  );

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
      ...translationContext,
    },
  };
};
