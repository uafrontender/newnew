/* eslint-disable no-nested-ternary */
import React, { ReactElement, useEffect, useMemo } from 'react';
import styled /* , { useTheme } */ from 'styled-components';
import { useInView } from 'react-intersection-observer';
import type { GetServerSideProps, NextPage } from 'next';
import Head from 'next/head';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useTranslation } from 'next-i18next';
import { newnewapi } from 'newnew-api';
// import Link from 'next/link';

import ProfileLayout from '../../components/templates/ProfileLayout';
import { NextPageWithLayout } from '../_app';
import { getUserByUsername } from '../../api/endpoints/user';
import useUserPosts from '../../utils/hooks/useUserPosts';

import PostList from '../../components/organisms/see-more/PostList';
// import InlineSvg from '../../components/atoms/InlineSVG';

// import LockIcon from '../../public/images/svg/icons/filled/Lock.svg';
// import Text from '../../components/atoms/Text';
import NoContentCard from '../../components/atoms/profile/NoContentCard';
import {
  NoContentDescription,
  // NoContentSuggestion,
} from '../../components/atoms/profile/NoContentCommon';
import getDisplayname from '../../utils/getDisplayname';
// import Button from '../../components/atoms/Button';
import { SUPPORTED_LANGUAGES } from '../../constants/general';
import assets from '../../constants/assets';
import useBuyBundleAfterStripeRedirect from '../../utils/hooks/useBuyBundleAfterStripeRedirect';
import { useAppState } from '../../contexts/appStateContext';

interface IUserPageIndex {
  user: newnewapi.IUser;
  postsFilter: newnewapi.Post.Filter;
  stripeSetupIntentClientSecretFromRedirect?: string;
  saveCardFromRedirect?: boolean;
}

const UserPageIndex: NextPage<IUserPageIndex> = ({
  user,
  postsFilter,
  stripeSetupIntentClientSecretFromRedirect,
  saveCardFromRedirect,
}) => {
  // const theme = useTheme();
  const { t } = useTranslation('page-Profile');
  const { userLoggedIn } = useAppState();
  useBuyBundleAfterStripeRedirect(
    stripeSetupIntentClientSecretFromRedirect,
    saveCardFromRedirect
  );
  // NOTE: activity is temporarily disabled
  /* const isCreator = useMemo(
    () => !!userIsCreator,
    [userIsCreator]
  );
  const isActivityPrivate = useMemo(
    () => !!user?.options?.isActivityPrivate,
    [user?.options?.isActivityPrivate]
  ); */

  // NOTE: activity is temporarily disabled
  const { data, hasNextPage, fetchNextPage, isLoading, isFetchingNextPage } =
    useUserPosts(
      {
        userUuid: user.uuid as string,
        loggedInUser: userLoggedIn,
        relation:
          /* isCreator
          ? */ newnewapi.GetUserPostsRequest.Relation.THEY_CREATED,
        /*: newnewapi.GetUserPostsRequest.Relation.THEY_PURCHASED */ postsFilter,
      }
      /* !isCreator
        ? {
            enabled: !isActivityPrivate,
          }
        : {} */
    );

  const posts = useMemo(
    () => data?.pages.map((page) => page.posts).flat(),
    [data]
  );

  // Loading state
  const { ref: loadingRef, inView } = useInView();

  useEffect(() => {
    if (inView) {
      fetchNextPage();
    }
  }, [inView, fetchNextPage]);

  const bioWithTrailingDot = useMemo(() => {
    if (!user.bio || user.bio?.length === 0) {
      return '';
    }

    if (user.bio[user.bio.length - 1] === '.') {
      return user.bio;
    }

    return user.bio.concat('.');
  }, [user.bio]);

  return (
    <>
      <Head>
        <title>
          {t('Profile.meta.title', {
            displayname: getDisplayname(user),
            username: user.username,
          })}
        </title>
        <meta
          name='description'
          content={t('Profile.meta.description', {
            bio: bioWithTrailingDot,
          })}
        />
        <meta
          property='og:title'
          content={t('Profile.meta.title', {
            displayname: getDisplayname(user),
            username: user.username,
          })}
        />
        <meta
          name='og:description'
          content={t('Profile.meta.description', {
            bio: bioWithTrailingDot,
          })}
        />
        <meta property='og:image' content={assets.openGraphImage.common} />
      </Head>
      <div>
        {
          // NOTE: activity is temporarily disabled
          /* !isCreator && isActivityPrivate ? (
          <SMain>
            <SAccountPrivate>
              <SPrivateLock>
                <InlineSvg
                  svg={LockIcon}
                  width='24px'
                  height='24px'
                  fill={theme.colorsThemed.text.secondary}
                />
              </SPrivateLock>
              <SAccountPrivateText variant={1}>
                {t('accountPrivate', {
                  username: getDisplayname(user),
                })}
              </SAccountPrivateText>
            </SAccountPrivate>
          </SMain>
        ) : */ <SMain>
            <SCardsSection>
              {user.options?.isCreator && posts && (
                <PostList
                  category=''
                  loading={isLoading || isFetchingNextPage}
                  collection={posts}
                  wrapperStyle={{
                    left: 0,
                  }}
                />
              )}
              {user.options?.isCreator &&
                posts &&
                posts.length === 0 &&
                !isLoading && (
                  <NoContentCard>
                    <NoContentDescription>
                      {t('Profile.creator.noContent.description')}
                    </NoContentDescription>
                  </NoContentCard>
                )}
              {
                // NOTE: activity is temporarily disabled
                /* user.options &&
                !user.options?.isCreator &&
                posts &&
                posts.length === 0 &&
                !isLoading && (
                  <NoContentCard>
                    <NoContentDescription>
                      {t('Profile.user.noContent.description', {
                        username: getDisplayname(user),
                      })}
                    </NoContentDescription>
                    <NoContentSuggestion>
                      {t('Profile.user.noContent.suggestion')}
                    </NoContentSuggestion>
                    <Link href='/'>
                      <SButton view='primaryGrad'>
                        {t('Profile.user.noContent.button')}
                      </SButton>
                    </Link>
                  </NoContentCard>
                    ) */
              }
            </SCardsSection>
            {hasNextPage && <div ref={loadingRef} />}
          </SMain>
        }
      </div>
    </>
  );
};

(UserPageIndex as NextPageWithLayout).getLayout = function getLayout(
  page: ReactElement
) {
  return (
    <ProfileLayout key={page.props.user.uuid} user={page.props.user}>
      {page}
    </ProfileLayout>
  );
};

export default UserPageIndex;

export const getServerSideProps: GetServerSideProps<
  Partial<IUserPageIndex>
> = async (context) => {
  // TODO: implement granular cache-control (likely in newer version of Next.js)
  // context.res.setHeader(
  //   'Cache-Control',
  //   'public, s-maxage=15, stale-while-revalidate=20, stale-if-error=5'
  // );

  try {
    // eslint-disable-next-line camelcase
    const { username, setup_intent_client_secret, save_card } = context.query;

    const translationContext = await serverSideTranslations(
      context.locale!!,
      [
        'common',
        'page-Profile',
        'component-PostCard',
        'page-Post',
        'modal-PaymentModal',
        'modal-ResponseSuccessModal',
      ],
      null,
      SUPPORTED_LANGUAGES
    );

    if (!username || Array.isArray(username)) {
      return {
        redirect: {
          destination: '/404',
          permanent: false,
        },
      };
    }

    const getUserRequestPayload = new newnewapi.GetUserRequest({
      username,
    });

    const res = await getUserByUsername(getUserRequestPayload);

    if (!res?.data || res.error) {
      return {
        redirect: {
          destination: '/404',
          permanent: false,
        },
      };
    }

    return {
      props: {
        user: res.data.toJSON(),
        // setup intent on this page is always for bundles
        // eslint-disable-next-line camelcase, object-shorthand
        ...(setup_intent_client_secret &&
        !Array.isArray(setup_intent_client_secret)
          ? {
              stripeSetupIntentClientSecretFromRedirect:
                // eslint-disable-next-line camelcase
                setup_intent_client_secret,
            }
          : {}),
        // eslint-disable-next-line camelcase, object-shorthand
        ...(save_card && !Array.isArray(save_card)
          ? {
              // eslint-disable-next-line camelcase
              saveCardFromRedirect: save_card === 'true',
            }
          : {}),
        ...translationContext,
      },
    };
  } catch (err) {
    return {
      redirect: {
        destination: '/404',
        permanent: false,
      },
    };
  }
};

const SMain = styled.main`
  min-height: 60vh;
`;

const SCardsSection = styled.div`
  display: flex;
  flex-wrap: wrap;

  ${(props) => props.theme.media.tablet} {
    margin-right: -32px !important;
  }
`;

// NOTE: activity is temporarily disabled
// Account private
/* const SAccountPrivate = styled.div``;

const SPrivateLock = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;

  width: 48px;
  height: 48px;

  margin-bottom: 8px;

  background-color: ${({ theme }) => theme.colorsThemed.background.secondary};

  border-radius: 50%;

  margin-left: auto !important;
  margin-right: auto !important;
`;

const SAccountPrivateText = styled(Text)`
  color: ${({ theme }) => theme.colorsThemed.text.tertiary};
  text-align: center;
`;

const SButton = styled(Button)`
  margin: auto;
  width: 100%;
  margin-bottom: 16px;

  ${({ theme }) => theme.media.tablet} {
    width: 164px;
    margin-bottom: 0px;
  }

  ${({ theme }) => theme.media.laptop} {
    width: 224px;
  }
`; */
