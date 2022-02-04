/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { ReactElement, useState } from 'react';
import { newnewapi } from 'newnew-api';
import { useTranslation } from 'next-i18next';
import type { GetServerSideProps, NextPage } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';

import { getUserByUsername } from '../../../api/endpoints/user';

import { NextPageWithLayout } from '../../_app';
import HomeLayout from '../../../components/templates/HomeLayout';
import Button from '../../../components/atoms/Button';
import PaymentModal from '../../../components/molecules/checkout/PaymentModal';
import { subscribeToCreator } from '../../../api/endpoints/payments';

interface ISubscribeToUserPage {
  user: Omit<newnewapi.User, 'toJSON'>;
}

const SubscribeToUserPage: NextPage<ISubscribeToUserPage> = ({
  user,
}) => {
  const { t } = useTranslation();

  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);

  const handlePayWithCard = async () => {
    try {
      const payload = new newnewapi.SubscribeToCreatorRequest({
        creatorUuid: user.uuid,
        successUrl: `${process.env.NEXT_PUBLIC_APP_URL}/subscription-redirect-success`,
        cancelUrl: `${process.env.NEXT_PUBLIC_APP_URL}/subscription-redirect-failure`,
      });

      const res = await subscribeToCreator(payload);

      if (!res.data || res.error) throw new Error(res.error?.message ?? 'Request failed');

      const url = res.data.checkoutUrl;
      window.location.href = url;
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <>
      <div>
        <main>
          <h1>
            I am subscribe to
            {' '}
            {user.username}
            {' '}
            page
          </h1>
          <Button
            view="primaryGrad"
            onClick={() => setIsPaymentModalOpen(true)}
          >
            Subscribe now
          </Button>
        </main>
      </div>
      <PaymentModal
        isOpen={isPaymentModalOpen}
        zIndex={10}
        onClose={() => setIsPaymentModalOpen(false)}
        handlePayWithCardStripeRedirect={handlePayWithCard}
      >
        You are going subscribe to
        {' '}
        {user.username}
      </PaymentModal>
    </>
  );
};

(SubscribeToUserPage as NextPageWithLayout).getLayout = (page: ReactElement) => (
  <HomeLayout>
    {page}
  </HomeLayout>
);

export default SubscribeToUserPage;

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { username } = context.query;
  const translationContext = await serverSideTranslations(
    context.locale!!,
    ['common', 'home', 'subscribe-to-user', 'payment-modal'],
  );

  if (!username || Array.isArray(username)) {
    return {
      redirect: {
        destination: '/',
        permanent: false,
      },
    };
  }

  const getUserRequestPayload = new newnewapi.GetUserRequest({
    username,
  });

  const res = await getUserByUsername(getUserRequestPayload);

  if (!res.data || !res.data.options?.isCreator || res.error) {
    return {
      redirect: {
        destination: '/',
        permanent: false,
      },
    };
  }

  return {
    props: {
      user: res.data.toJSON(),
      ...translationContext,
    },
  };
};
