import React, { ReactElement, useContext, useEffect, useState } from 'react';
import Head from 'next/head';
import type { GetServerSideProps, NextPage } from 'next';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { newnewapi } from 'newnew-api';
import dynamic from 'next/dynamic';
import styled, { useTheme } from 'styled-components';

import { NextPageWithLayout } from './_app';
import HomeLayout from '../components/templates/HomeLayout';
import FaqSection from '../components/organisms/home/FaqSection';
import PostTypeSection from '../components/organisms/home/PostTypeSection';
import BecomeCreatorSection from '../components/organisms/home/BecomeCreatorSection';
import YourPostsSection from '../components/organisms/home/YourPostsSection';
import Headline from '../components/atoms/Headline';
import { TStaticPost } from '../components/molecules/home/StaticPostCard';

import { SUPPORTED_LANGUAGES } from '../constants/general';
import { useAppSelector } from '../redux-store/store';
import { getCuratedPosts } from '../api/endpoints/post';
import canBecomeCreator from '../utils/canBecomeCreator';
import { useGetAppConstants } from '../contexts/appConstantsContext';

import assets from '../constants/assets';
import { SocketContext } from '../contexts/socketContext';
import { ChannelsContext } from '../contexts/channelsContext';
import { useAppState } from '../contexts/appStateContext';

const HeroSection = dynamic(
  () => import('../components/organisms/home/HeroSection')
);
const CardsSection = dynamic(
  () => import('../components/organisms/home/CuratedCardsSection')
);

interface IHome {
  top10posts?: newnewapi.NonPagedPostsResponse;
  staticSuperpolls: TStaticPost[];
  staticBids: TStaticPost[];
  initialNextPageTokenRA?: string;
  popularPosts?: newnewapi.NonPagedPostsResponse;
}

// No sense to memorize
const Home: NextPage<IHome> = ({
  staticBids,
  staticSuperpolls,
  popularPosts,
}) => {
  const { t } = useTranslation('page-Home');
  const theme = useTheme();
  const user = useAppSelector((state) => state.user);
  const { appConstants } = useGetAppConstants();
  const { userLoggedIn, userIsCreator } = useAppState();

  const [popularPostsArr, setPopularPostsAdd] = useState(popularPosts?.posts);

  // Socket
  const { socketConnection, isSocketConnected } = useContext(SocketContext);
  const { addChannel, removeChannel } = useContext(ChannelsContext);

  useEffect(() => {
    if (isSocketConnected) {
      addChannel(newnewapi.CuratedListType.POPULAR.toString(), {
        curatedListUpdates: {
          type: newnewapi.CuratedListType.POPULAR,
        },
      });
    }

    return () => {
      removeChannel(newnewapi.CuratedListType.POPULAR.toString());
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSocketConnected]);

  useEffect(() => {
    const handlerSocketCuratedListUpdated = (data: any) => {
      const arr = new Uint8Array(data);
      const decoded = newnewapi.CuratedListUpdated.decode(arr);

      if (decoded && decoded.posts) {
        setPopularPostsAdd(decoded.posts);
      }
    };

    if (socketConnection) {
      socketConnection?.on(
        'CuratedListUpdated',
        handlerSocketCuratedListUpdated
      );
    }

    return () => {
      if (socketConnection && socketConnection?.connected) {
        socketConnection?.off(
          'CuratedListUpdated',
          handlerSocketCuratedListUpdated
        );
      }
    };
  }, [socketConnection]);

  return (
    <>
      <Head>
        <title>{t('meta.title')}</title>
        <meta name='description' content={t('meta.description')} />
        <meta property='og:title' content={t('meta.title')} />
        <meta property='og:description' content={t('meta.description')} />
        <meta property='og:image' content={assets.openGraphImage.common} />
      </Head>
      {!userLoggedIn && <HeroSection />}

      {userIsCreator && (
        <>
          <SHeading>
            <SHeadline>{t('section.your')}</SHeadline>
          </SHeading>
          <YourPostsSection />
        </>
      )}

      {/* Recent activity */}
      {popularPostsArr && popularPostsArr?.length > 0 ? (
        <SCardsSection
          title={t('section.popular')}
          category='popular'
          collection={popularPostsArr}
          padding={userLoggedIn ? 'small' : 'large'}
          // onReachEnd={loadMoreCollectionRA}
          // seeMoreLink='/profile/purchases'
        />
      ) : null}

      {/* MC posts example */}
      <PostTypeSection
        headingPosition='right'
        title={t('tutorial.mc.title')}
        caption={t('tutorial.mc.caption')}
        iconSrc={
          theme.name === 'light'
            ? assets.common.mc.lightMcAnimated()
            : assets.common.mc.darkMcAnimated()
        }
        posts={staticSuperpolls}
        isStatic
        padding={userLoggedIn ? 'small' : 'large'}
      />

      {/* AC posts example */}
      <PostTypeSection
        headingPosition='left'
        title={t('tutorial.ac.title')}
        caption={t('tutorial.ac.caption')}
        iconSrc={
          theme.name === 'light'
            ? assets.common.ac.lightAcAnimated()
            : assets.common.ac.darkAcAnimated()
        }
        posts={staticBids}
        isStatic
        padding={userLoggedIn ? 'small' : 'large'}
      />

      {(!userLoggedIn || !userIsCreator) && <FaqSection />}

      {!userIsCreator &&
        canBecomeCreator(
          user.userData?.dateOfBirth,
          appConstants.minCreatorAgeYears
        ) && <BecomeCreatorSection />}
    </>
  );
};

(Home as NextPageWithLayout).getLayout = (page: ReactElement) => (
  <HomeLayout>{page}</HomeLayout>
);

const SCardsSection = styled(CardsSection)`
  &:first-child {
    padding-top: 0;
  }

  ${(props) => props.theme.media.tablet} {
    &:first-child {
      padding-top: 8px;
    }
  }
`;

const SHeading = styled.div`
  margin-bottom: 24px;

  ${(props) => props.theme.media.tablet} {
    & + section {
      padding-top: 0;
    }
  }

  ${(props) => props.theme.media.laptopM} {
    max-width: 1248px;
    margin-left: auto;
    margin-right: auto;
    margin-top: 40px;
    margin-bottom: 32px;
  }
`;

const SHeadline = styled(Headline)`
  font-size: 24px;
  line-height: 32px;

  ${({ theme }) => theme.media.tablet} {
    font-size: 28px;
    line-height: 36px;
  }

  ${({ theme }) => theme.media.laptop} {
    font-size: 40px;
    line-height: 48px;
  }
`;

export default Home;

export const getServerSideProps: GetServerSideProps<IHome> = async (
  context
) => {
  const translationContext = await serverSideTranslations(
    context.locale!!,
    [
      'common',
      'page-Home',
      'component-PostCard',
      'page-Post',
      'modal-PaymentModal',
      'modal-ResponseSuccessModal',
      'page-Chat',
    ],
    null,
    SUPPORTED_LANGUAGES
  );

  const staticSuperpolls = [
    {
      username: '☀️Sunny Claire',
      title: 'We give up...help pick our daughter’s name 🐣',
      totalVotes: 102558,
      postType: 'mc',
      coverImageUrl: assets.home.mcExampleThumb1,
      avatarUrl: assets.home.mcExampleAvatar1,
    },
    {
      username: 'julieberns',
      title: 'Should I quit my job and move to Paris to find 💗?',
      totalVotes: 44173,
      postType: 'mc',
      coverImageUrl: assets.home.mcExampleThumb2,
      avatarUrl: assets.home.mcExampleAvatar2,
    },
    {
      username: 'GTmarkis',
      title: 'Getting my first sports car... YOU CHOOSE IT. I BUY IT!',
      totalVotes: 23425,
      postType: 'mc',
      coverImageUrl: assets.home.mcExampleThumb3,
      avatarUrl: assets.home.mcExampleAvatar3,
    },
  ] as TStaticPost[];

  const staticBids = [
    {
      username: 'ambervz',
      title: 'Need ideas on how to breakup w/ my cheating bf',
      totalAmount: 3812,
      postType: 'ac',
      coverImageUrl: assets.home.acExampleThumb1,
      avatarUrl: assets.home.acExampleAvatar1,
    },
    {
      username: 'Jenna B⚡️',
      title: 'I want a new tat! Tell me where to put it👀',
      totalAmount: 4261,
      postType: 'ac',
      coverImageUrl: assets.home.acExampleThumb2,
      avatarUrl: assets.home.acExampleAvatar2,
    },
    {
      username: 'superstacked+',
      title: '😱What should I spend my $250K on???',
      totalAmount: 12482,
      postType: 'ac',
      coverImageUrl: assets.home.acExampleThumb3,
      avatarUrl: assets.home.acExampleAvatar3,
    },
  ] as TStaticPost[];

  try {
    const popularPostsPayload = new newnewapi.GetCuratedPostsRequest({
      curatedListType: newnewapi.CuratedListType.POPULAR,
    });

    const popularPosts = await getCuratedPosts(popularPostsPayload);

    return {
      props: {
        ...(popularPosts.data && popularPosts.data.toJSON().posts
          ? {
              popularPosts:
                popularPosts.data.toJSON() as newnewapi.NonPagedPostsResponse,
            }
          : {}),
        staticSuperpolls,
        staticBids,
        ...translationContext,
      },
    };
  } catch (err) {
    return {
      props: {
        staticSuperpolls,
        staticBids,
        ...translationContext,
      },
    };
  }
};
