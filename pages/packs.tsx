import React from 'react';
import { useTranslation } from 'next-i18next';
import { NextPageContext } from 'next';
import Head from 'next/head';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import styled from 'styled-components';
import { useRouter } from 'next/router';
import { newnewapi } from 'newnew-api';

import { NextPageWithLayout } from './_app';

import HomeLayout from '../components/templates/HomeLayout';
import assets from '../constants/assets';
import GoBackButton from '../components/molecules/GoBackButton';

import dateToTimestamp from '../utils/dateToTimestamp';
import UserAvatar from '../components/molecules/UserAvatar';
import { useAppSelector } from '../redux-store/store';

export const Packs = () => {
  const router = useRouter();
  const { t } = useTranslation('page-Packs');
  const { resizeMode } = useAppSelector((state) => state.ui);

  const isMobile = ['mobile', 'mobileS', 'mobileM', 'mobileL'].includes(
    resizeMode
  );
  const isTablet = ['tablet'].includes(resizeMode);

  const currentPacks: newnewapi.Pack[] = [
    new newnewapi.Pack({
      creator: new newnewapi.User({
        avatarUrl: 'https://www.w3schools.com/howto/img_avatar.png',
        nickname: 'CreatorDisplayName',
        username: 'username',
      }),
      createdAt: dateToTimestamp(new Date()),
      subscriptionExpiresAt: dateToTimestamp(new Date(Date.now() + 5356800000)),
      votesLeft: 4,
    }),
    new newnewapi.Pack({
      creator: new newnewapi.User({
        avatarUrl: 'https://www.w3schools.com/howto/img_avatar.png',
        nickname: 'CreatorDisplayName',
        username: 'username',
      }),
      createdAt: dateToTimestamp(new Date()),
      subscriptionExpiresAt: dateToTimestamp(new Date(Date.now() + 8356800000)),
      votesLeft: 4500,
    }),
    /* new newnewapi.Pack({
      creator: new newnewapi.User({
        avatarUrl: 'https://www.w3schools.com/howto/img_avatar.png',
        nickname: 'CreatorDisplayName',
        username: 'username',
      }),
      createdAt: dateToTimestamp(new Date()),
      subscriptionExpiresAt: dateToTimestamp(new Date(Date.now() + 5356800000)),
      votesLeft: 231,
    }),
    new newnewapi.Pack({
      creator: new newnewapi.User({
        avatarUrl: 'https://www.w3schools.com/howto/img_avatar.png',
        nickname: 'CreatorDisplayName',
        username: 'username',
      }),
      createdAt: dateToTimestamp(new Date()),
      subscriptionExpiresAt: dateToTimestamp(new Date(Date.now() + 7356800000)),
      votesLeft: 19465,
    }), */
  ];

  return (
    <>
      <Head>
        <title>{t('meta.title')}</title>
        <meta name='description' content={t('meta.description')} />
        <meta property='og:title' content={t('meta.title')} />
        <meta property='og:description' content={t('meta.description')} />
        <meta property='og:image' content={assets.openGraphImage.common} />
      </Head>
      <Container>
        <SubNavigation>
          <GoBackButton longArrow onClick={() => router.back()}>
            {t('button.back')}
          </GoBackButton>
        </SubNavigation>
        <SHeader>
          <STitle>{t('header.title')}</STitle>
          <SDescription>{t('header.description')}</SDescription>
        </SHeader>
        <SPacksTitle>
          <SectionTitle>{t('packs.title')}</SectionTitle>
          {/* TODO: add proper button */}
          <div>See all</div>
        </SPacksTitle>
        <SPacksContainer>
          {currentPacks.map((pack) => {
            const expiresAtTime =
              (pack.subscriptionExpiresAt!.seconds as number) * 1000;
            const timeLeft = expiresAtTime - Date.now();
            const daysLeft = timeLeft / 1000 / 60 / 60 / 24;
            const monthsLeft = Math.floor(daysLeft / 30);

            return (
              <SPackContainer>
                <SUserInfo>
                  <UserAvatar
                    avatarUrl={pack.creator?.avatarUrl || undefined}
                  />
                  <SUserData>
                    <SDisplayName>{pack.creator?.nickname}</SDisplayName>
                    <SUserName>{pack.creator?.username}</SUserName>
                  </SUserData>
                </SUserInfo>
                {/* TODO: add Trans */}
                <SVotesLeft>
                  {t('packs.votesLeft', { amount: pack.votesLeft })}
                </SVotesLeft>
                <SSubscriptionLeft>
                  {t('packs.chatAccessLeft', { amount: monthsLeft })}
                </SSubscriptionLeft>
              </SPackContainer>
            );
          })}

          {!isMobile &&
            Array.from(
              'x'.repeat((isTablet ? 3 : 4) - currentPacks.length)
            ).map(() => <SPackContainer holder />)}
        </SPacksContainer>
        <SectionTitle>{t('search.title')}</SectionTitle>
      </Container>
    </>
  );
};

(Packs as NextPageWithLayout).getLayout = (page: React.ReactElement) => (
  <HomeLayout>{page}</HomeLayout>
);

export default Packs;

export const getServerSideProps = async (context: NextPageContext) => {
  const translationContext = await serverSideTranslations(context.locale!!, [
    'common',
    'page-Packs',
  ]);

  return {
    props: {
      ...translationContext,
    },
  };
};

const Container = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  padding-top: 4px;

  ${({ theme }) => theme.media.tablet} {
    padding-top: 4px;
  }

  ${({ theme }) => theme.media.laptop} {
    padding-top: 12px;
  }
`;

const SubNavigation = styled.div`
  display: flex;
  flex-direction: row;
  align-items: flex-start;
  width: 100%;
  margin-bottom: 96px;
`;

const SHeader = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  margin-bottom: 84px;

  ${({ theme }) => theme.media.laptop} {
    max-width: 60%;
  }
`;

const STitle = styled.h1`
  font-weight: 600;
  color: ${({ theme }) => theme.colorsThemed.text.primary};

  font-size: 72px;
  line-height: 86px;
  margin-bottom: 16px;

  ${({ theme }) => theme.media.tablet} {
    font-size: 56px;
    line-height: 64px;
  }

  ${({ theme }) => theme.media.laptop} {
    font-size: 72px;
    line-height: 86px;
  }
`;

const SDescription = styled.h2`
  font-weight: 500;
  color: ${({ theme }) => theme.colorsThemed.text.tertiary};

  font-size: 24px;
  line-height: 32px;
`;

const SPacksTitle = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  width: 100%;
`;

const SectionTitle = styled.h3`
  color: ${(props) => props.theme.colorsThemed.text.primary};
  font-weight: 700;
  font-size: 32px;
  line-height: 40px;
  text-align: 'start';
  margin-bottom: 32px;
`;

const SPacksContainer = styled.div`
  display: flex;
  justify-content: space-between;
  width: 100%;
  gap: 16px;
  margin-bottom: 84px;
`;

const SPackContainer = styled.div<{ holder?: boolean }>`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  width: 100%;
  border-radius: 16px;
  padding: 24px;
  max-width: 300px;
  background-color: ${(props) => props.theme.colorsThemed.background.secondary};
  opacity: ${({ holder }) => (holder ? '0' : '1')};
`;

const SUserInfo = styled.div`
  display: flex;
  flex-direction: row;
`;

const SUserData = styled.div`
  display: flex;
  flex-direction: column;
  margin-bottom: 35px;
  margin-left: 12px;
`;

const SDisplayName = styled.p`
  font-weight: 600;
  color: ${({ theme }) => theme.colorsThemed.text.primary};

  font-size: 14px;
  line-height: 20px;

  margin-bottom: 5px;
`;

const SUserName = styled.p`
  font-weight: 700;
  color: ${({ theme }) => theme.colorsThemed.text.secondary};

  font-size: 12px;
  line-height: 16px;
`;

const SVotesLeft = styled.p`
  font-weight: 700;
  color: ${({ theme }) => theme.colorsThemed.text.primary};

  font-size: 28px;
  line-height: 36px;
`;

const SSubscriptionLeft = styled.p`
  font-weight: 600;
  color: ${({ theme }) => theme.colorsThemed.text.secondary};

  font-size: 14px;
  line-height: 20px;
`;
