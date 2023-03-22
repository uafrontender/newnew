import React, { ReactElement, useCallback, useEffect, useMemo } from 'react';
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

import { useAppDispatch, useAppSelector } from '../redux-store/store';
import { logoutUserClearCookiesAndRedirect } from '../redux-store/slices/userStateSlice';
import { getMyPosts } from '../api/endpoints/user';
import { TTokenCookie } from '../api/apiConfigs';
import useMyPosts from '../utils/hooks/useMyPosts';
import assets from '../constants/assets';

const HeroSection = dynamic(
  () => import('../components/organisms/home/HeroSection')
);
const CardsSection = dynamic(
  () => import('../components/organisms/home/CardsSection')
);
const TutorialCard = dynamic(
  () => import('../components/molecules/TutorialCard')
);

interface IHome {
  top10posts?: newnewapi.NonPagedPostsResponse;
  assumeLoggedIn?: boolean;
  staticSuperpolls: TStaticPost[];
  staticBids: TStaticPost[];
  initialPageRA?: {
    posts: newnewapi.IPost[];
    paging: newnewapi.PagingResponse | null | undefined;
  };
  initialNextPageTokenRA?: string;
  sessionExpired?: boolean;
}

// No sense to memorize
const Home: NextPage<IHome> = ({
  staticBids,
  staticSuperpolls,
  assumeLoggedIn,
  initialPageRA,
  sessionExpired,
}) => {
  const { t } = useTranslation('page-Home');
  const theme = useTheme();
  const user = useAppSelector((state) => state.user);
  const dispatch = useAppDispatch();

  useEffect(() => {
    if (sessionExpired) {
      dispatch(
        logoutUserClearCookiesAndRedirect('/sign-up?reason=session_expired')
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionExpired]);

  const isUserLoggedIn = useMemo(() => {
    if (user._persist?.rehydrated) {
      return user.loggedIn;
    }

    return assumeLoggedIn;
  }, [user._persist?.rehydrated, user.loggedIn, assumeLoggedIn]);

  // Resent activity
  const {
    data: collectionRAPages,
    hasNextPage: hasNextPageRA,
    fetchNextPage: fetchNextPageRA,
  } = useMyPosts(
    {
      relation: newnewapi.GetRelatedToMePostsRequest.Relation.MY_PURCHASES,
      limit: 6,
    },
    {
      ...(initialPageRA
        ? {
            initialData: {
              pages: [initialPageRA],
              pageParams: [undefined],
            },
          }
        : {}),
      enabled: isUserLoggedIn,
    }
  );

  const collectionRA = useMemo(
    () =>
      collectionRAPages
        ? collectionRAPages.pages.map((page) => page?.posts || []).flat()
        : [],

    [collectionRAPages]
  );

  const loadMoreCollectionRA = useCallback(() => {
    if (hasNextPageRA) {
      fetchNextPageRA();
    }
  }, [fetchNextPageRA, hasNextPageRA]);

  return (
    <>
      <Head>
        <title>{t('meta.title')}</title>
        <meta name='description' content={t('meta.description')} />
        <meta property='og:title' content={t('meta.title')} />
        <meta property='og:description' content={t('meta.description')} />
        <meta property='og:image' content={assets.openGraphImage.common} />
      </Head>
      {!isUserLoggedIn && <HeroSection />}

      {user.userData?.options?.isCreator && (
        <>
          <SHeading style={{ marginBottom: '48px' }}>
            <SHeadline>{t('section.your')}</SHeadline>
          </SHeading>
          <YourPostsSection />
        </>
      )}

      {isUserLoggedIn && (
        <>
          {user.userData?.options?.isCreator && collectionRA?.length > 0 && (
            <SHeading style={{ marginTop: '80px' }}>
              <SHeadline>{t('section.explore')}</SHeadline>
              {/* <SSubtitle variant='subtitle'>
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Proin
                fames nulla dignissim tellus purus. Faucibus ornare.
              </SSubtitle> */}
            </SHeading>
          )}
          {/* Recent activity */}
          {collectionRA?.length > 0 ? (
            <CardsSection
              title={t('cardsSection.title.recent-activity')}
              category='recent-activity'
              collection={collectionRA}
              tutorialCard={
                isUserLoggedIn ? (
                  <STutorialCard
                    image={
                      theme.name === 'dark'
                        ? assets.common.darkLogoAnimated()
                        : assets.common.lightLogoAnimated()
                    }
                    title={t('tutorial.recent-activity.title')}
                    caption={t('tutorial.recent-activity.caption')}
                  />
                ) : undefined
              }
              padding={isUserLoggedIn ? 'small' : 'large'}
              onReachEnd={loadMoreCollectionRA}
              seeMoreLink='/profile/purchases'
            />
          ) : null}
        </>
      )}

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
        // loading={collectionMCInitialLoading}
        padding={isUserLoggedIn ? 'small' : 'large'}
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
        // loading={collectionACInitialLoading}
        padding={isUserLoggedIn ? 'small' : 'large'}
      />

      {/* Greatest of all time posts */}
      {/* {!collectionBiggestError &&
      (collectionBiggestInitialLoading || collectionBiggest?.length > 0) ? (
        <SCardsSection
          title={t('cardsSection.title.biggest')}
          category='biggest'
          collection={collectionBiggest}
          loading={collectionBiggestInitialLoading}
          tutorialCard={
            user.loggedIn ? (
              <STutorialCard
                image={
                  theme.name === 'dark'
                    ? assets.common.darkAnimatedLogo
                    : assets.common.lightAnimatedLogo
                }
                title={t('tutorial.biggest.title')}
                caption={t('tutorial.biggest.caption')}
              />
            ) : undefined
          }
          padding={user.loggedIn ? 'small' : 'large'}
        />
      ) : null} */}

      {(!isUserLoggedIn || !user.userData?.options?.isCreator) && (
        <FaqSection />
      )}

      {!user.userData?.options?.isCreator && <BecomeCreatorSection />}
    </>
  );
};

(Home as NextPageWithLayout).getLayout = (page: ReactElement) => (
  <HomeLayout>{page}</HomeLayout>
);

// const SCardsSection = styled(CardsSection)`
//   ${({ theme }) => theme.media.laptop} {
//     margin-top: 12px;
//   }

//   &:last-child {
//     padding-bottom: 40px;
//   }

//   ${({ theme }) => theme.media.tablet} {
//     &:last-child {
//       padding-bottom: 60px;
//     }
//   }

//   ${({ theme }) => theme.media.laptop} {
//     &:last-child {
//       padding-bottom: 80px;
//     }
//   }
// `;

const SHeading = styled.div`
  margin-bottom: 20px;

  ${(props) => props.theme.media.tablet} {
    margin-bottom: 48px;

    & + section {
      padding-top: 0;
    }
  }

  ${(props) => props.theme.media.laptopM} {
    max-width: 1248px;
    margin-left: auto;
    margin-right: auto;
    margin-top: 40px;
  }
`;

const SHeadline = styled(Headline)`
  margin-bottom: 16px;

  font-size: 36px;
  line-height: 44px;

  ${({ theme }) => theme.media.tablet} {
    margin-bottom: 24px;

    font-size: 40px;
    line-height: 48px;
  }

  ${({ theme }) => theme.media.laptop} {
    margin-bottom: 24px;

    font-size: 52px;
    line-height: 40px;
  }
`;

// const SSubtitle = styled(Text)`
//   max-width: 570px;

//   font-size: 14px;
//   line-height: 24px;
//   font-weight: 600;

//   ${({ theme }) => theme.media.tablet} {
//     font-size: 16px;
//     line-height: 24px;
//   }
// `;

const STutorialCard = styled(TutorialCard)`
  & img {
    width: 152px;
    height: 114px;
  }

  & h4 {
    font-size: 24px;
    line-height: 32px;
  }

  &&& {
    & div {
      padding: 0;
      font-size: 16px;
      line-height: 24px;
    }
  }
`;

export default Home;

export const getServerSideProps: GetServerSideProps<IHome> = async (
  context
) => {
  const { req } = context;
  const accessToken = req.cookies?.accessToken;

  const assumeLoggedIn = !!accessToken && !Array.isArray(accessToken);

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

  // const top10payload = new newnewapi.EmptyRequest({});

  // const resTop10 = await fetchCuratedPosts(top10payload);

  if (assumeLoggedIn) {
    try {
      const payload = new newnewapi.GetRelatedToMePostsRequest({
        relation: newnewapi.GetRelatedToMePostsRequest.Relation.MY_PURCHASES,
        paging: {
          limit: 6,
        },
      });
      const res = await getMyPosts(
        payload,
        undefined,
        {
          accessToken: req.cookies?.accessToken,
          refreshToken: req.cookies?.refreshToken,
        },
        (tokens: TTokenCookie[]) => {
          const parsedTokens = tokens.map(
            (t) =>
              `${t.name}=${t.value}; ${
                t.expires ? `expires=${t.expires}; ` : ''
              } ${t.maxAge ? `max-age=${t.maxAge}; ` : ''}`
          );
          context.res.setHeader('set-cookie', parsedTokens);
        }
      );

      if (res.data && res.data.toJSON().posts) {
        return {
          props: {
            initialPageRA: {
              posts: res.data.toJSON().posts,
              paging: res.data.toJSON().paging || null,
            },
            assumeLoggedIn,
            staticSuperpolls,
            staticBids,
            ...translationContext,
          },
        };
      }
    } catch (err) {
      if ((err as Error).message === 'Refresh token invalid') {
        return {
          props: {
            sessionExpired: true,
            assumeLoggedIn,
            staticSuperpolls,
            staticBids,
            ...translationContext,
          },
        };
      }
    }
  }

  return {
    props: {
      // ...(resTop10.data
      //   ? {
      //       top10posts: resTop10.data.toJSON(),
      //     }
      //   : {}),
      assumeLoggedIn,
      staticSuperpolls,
      staticBids,
      ...translationContext,
    },
  };
};
