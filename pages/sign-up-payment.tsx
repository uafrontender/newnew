/* eslint-disable camelcase */
import React, { useEffect, useState } from 'react';
import type { GetServerSideProps, NextPage } from 'next';
import { useRouter } from 'next/router';
import { newnewapi } from 'newnew-api';
import { toast } from 'react-toastify';

import Lottie from '../components/atoms/Lottie';

import { sendVerificationEmail } from '../api/endpoints/auth';

import logoAnimation from '../public/animations/logo-loading-blue.json';
import { setSignupEmailInput } from '../redux-store/slices/userStateSlice';
import { useAppDispatch, useAppSelector } from '../redux-store/store';

interface IEmailAuthRedirectPage {
  session_id: string;
}

const EmailAuthRedirectPage: NextPage<IEmailAuthRedirectPage> = ({
  session_id,
}) => {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.user);
  const [isLoading, setIsLoading] = useState(false);
  const [signInError, setSignInError] = useState(false);

  useEffect(() => {
    if (user.loggedIn) router.push('/');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    async function handleSendEmailRequest() {
      try {
        setIsLoading(true);

        if (!session_id) throw new Error('No token');

        const requestPayload = new newnewapi.SendVerificationEmailRequest({
          stripeSessionUrl: `session_id=${session_id}`,
          useCase:
            newnewapi.SendVerificationEmailRequest.UseCase
              .SIGN_UP_WITH_STRIPE_SESSION,
        });

        const res = await sendVerificationEmail(requestPayload);

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
        router.push('/verify-email');
      } catch (err) {
        setIsLoading(false);
        setSignInError(true);
        toast.error('toastErrors.generic');
        // router.push('/');
      }
    }

    handleSendEmailRequest();
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
  const { session_id } = context.query;

  if (!session_id || Array.isArray(session_id)) {
    return {
      redirect: {
        destination: '/',
        permanent: false,
      },
    };
  }

  return {
    props: {
      session_id,
    },
  };
};
