/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { ReactElement, useState } from 'react';
import { newnewapi } from 'newnew-api';
import { useTranslation } from 'next-i18next';
import type { GetServerSideProps, NextPage } from 'next';
import styled from 'styled-components';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';

import { getUserByUsername } from '../../../api/endpoints/user';

import { NextPageWithLayout } from '../../_app';
import HomeLayout from '../../../components/templates/HomeLayout';
import Button from '../../../components/atoms/Button';
import PaymentModal from '../../../components/molecules/checkout/PaymentModal';
import { subscribeToCreator } from '../../../api/endpoints/subscription';
import Text from '../../../components/atoms/Text';
import Headline from '../../../components/atoms/Headline';
import ProfileBackground from '../../../components/molecules/profile/ProfileBackground';
import InlineSvg from '../../../components/atoms/InlineSVG';
import ProfileImage from '../../../components/molecules/profile/ProfileImage';
import General from '../../../components/templates/General';

interface ISubscribeToUserPage {
  user: Omit<newnewapi.User, 'toJSON'>;
}

const SubscribeToUserPage: NextPage<ISubscribeToUserPage> = ({ user }) => {
  const { t } = useTranslation('subscribe-to-user');

  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);

  const handlePayWithCard = async () => {
    try {
      const payload = new newnewapi.SubscribeToCreatorRequest({
        creatorUuid: user.uuid,
        successUrl: `${process.env.NEXT_PUBLIC_APP_URL}/subscription-success?userId=${user.uuid}&`,
        cancelUrl: window.location.href,
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
      <SGeneral>
        <div>
          <main>
            <SProfileLayout>
              <ProfileBackground
                // Temp
                pictureURL={user.coverUrl ?? '../public/images/mock/profile-bg.png'}
              />
              <ProfileImage src={user.avatarUrl ?? ''} />
              <div
                style={{
                  position: 'relative',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                }}
              >
                <SUsername variant={4}>{user.nickname}</SUsername>
                <Button
                  withShadow
                  view="primaryGrad"
                  style={{
                    marginBottom: '16px',
                  }}
                  onClick={() => setIsPaymentModalOpen(true)}
                >
                  {/* @ts-ignore */}
                  {t('subscribeBtn', { amount: user.subscriptionPrice ?? 5 })}
                </Button>
              </div>
            </SProfileLayout>
          </main>
        </div>
      </SGeneral>
      <PaymentModal
        isOpen={isPaymentModalOpen}
        zIndex={10}
        // amount="$5"
        showTocApply
        onClose={() => setIsPaymentModalOpen(false)}
        handlePayWithCardStripeRedirect={handlePayWithCard}
      >
        <SPaymentModalHeader>
          <SPaymentModalTitle variant={3}>{t('paymenModalHeader.subtitle')}</SPaymentModalTitle>
          <SPaymentModalCreatorInfo>
            <SAvatar>
              <img src={user.avatarUrl} alt={user.username} />
            </SAvatar>
            <SCreatorInfo>
              <SCreatorUsername>{`@${user.username}`}</SCreatorUsername>{' '}
              <SSubscriberInfo>
                {/* @ts-ignore */}
                {user.numSubscribers ?? 20} {t('paymenModalHeader.numSubscribers')}
              </SSubscriberInfo>
            </SCreatorInfo>
          </SPaymentModalCreatorInfo>
        </SPaymentModalHeader>
      </PaymentModal>
    </>
  );
};

// (SubscribeToUserPage as NextPageWithLayout).getLayout = (page: ReactElement) => (
//   <HomeLayout>
//     {page}
//   </HomeLayout>
// );

export default SubscribeToUserPage;

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { username } = context.query;
  const translationContext = await serverSideTranslations(context.locale!!, [
    'common',
    'home',
    'subscribe-to-user',
    'payment-modal',
  ]);

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

const SGeneral = styled(General)`
  position: relative;

  header {
    z-index: 6;
  }

  @media (max-width: 768px) {
    main {
      div:first-child {
        padding-left: 0;
        padding-right: 0;

        div:first-child {
          margin-left: 0;
          margin-right: 0;
        }
      }
    }
  }
`;

const SUsername = styled(Headline)`
  text-align: center;

  margin-bottom: 12px;
`;

const SShareDiv = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;

  gap: 12px;

  margin-bottom: 16px;
`;

const SUsernameButtonText = styled(Text)`
  font-weight: 500;
  font-size: 14px;
  line-height: 20px;
  color: ${({ theme }) => theme.colorsThemed.text.tertiary};
`;

const SBioText = styled(Text)`
  text-align: center;
  overflow-wrap: break-word;

  padding-left: 16px;
  padding-right: 16px;
  margin-bottom: 54px;

  max-width: 480px;

  color: ${({ theme }) => theme.colorsThemed.text.tertiary};
`;

const SFavoritesButton = styled(Button)`
  position: absolute;
  top: 164px;
  right: 4px;

  background: none;

  color: ${({ theme }) => theme.colorsThemed.text.primary};

  span {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
  }

  ${(props) => props.theme.media.tablet} {
    top: 204px;
    right: calc(4px + 56px);
  }

  ${(props) => props.theme.media.laptop} {
    top: 244px;
  }
`;

const SMoreButton = styled(Button)`
  position: absolute;
  top: 164px;
  left: 4px;

  background: none;

  color: ${({ theme }) => theme.colorsThemed.text.primary};

  span {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
  }

  ${(props) => props.theme.media.tablet} {
    top: 204px;
    left: initial;
    right: 4px;
  }

  ${(props) => props.theme.media.laptop} {
    top: 244px;
  }
`;

const SProfileLayout = styled.div`
  position: relative;
  overflow: hidden;

  margin-top: -28px;
  margin-bottom: 24px;

  background-color: ${({ theme }) => theme.colorsThemed.background.secondary};

  ${(props) => props.theme.media.tablet} {
    margin-top: -8px;

    border-radius: ${({ theme }) => theme.borderRadius.medium};
  }

  ${(props) => props.theme.media.laptop} {
    margin-top: -16px;
  }
`;

const SPaymentModalHeader = styled.div``;

const SPaymentModalTitle = styled(Text)`
  color: ${({ theme }) => theme.colorsThemed.text.tertiary};
  margin-bottom: 6px;
`;

const SPaymentModalCreatorInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const SAvatar = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;

  overflow: hidden;
  position: relative;

  grid-area: avatar;
  justify-self: left;

  width: 36px;
  height: 36px;
  border-radius: 50%;

  img {
    display: block;
    width: 36px;
    height: 36px;
  }
`;

const SCreatorInfo = styled.div``;

const SCreatorUsername = styled.span`
  color: ${({ theme }) => theme.colorsThemed.text.primary};
  font-weight: 600;
  font-size: 14px;
  line-height: 20px;
`;

const SSubscriberInfo = styled.span`
  color: ${({ theme }) => theme.colorsThemed.text.tertiary};
  font-weight: 600;
  font-size: 14px;
  line-height: 20px;
`;
