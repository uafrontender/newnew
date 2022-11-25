/* eslint-disable no-nested-ternary */
/* eslint-disable no-unused-vars */
import React, { ReactElement, useCallback, useEffect, useState } from 'react';
import styled, { useTheme } from 'styled-components';
import { useInView } from 'react-intersection-observer';
import type { GetServerSideProps, NextPage } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useTranslation } from 'next-i18next';
import { newnewapi } from 'newnew-api';
import Link from 'next/link';

import ProfileLayout from '../../components/templates/ProfileLayout';
import { NextPageWithLayout } from '../_app';
import { getUserByUsername } from '../../api/endpoints/user';
import { fetchUsersPosts } from '../../api/endpoints/post';

import PostList from '../../components/organisms/see-more/PostList';
import InlineSvg from '../../components/atoms/InlineSVG';

import LockIcon from '../../public/images/svg/icons/filled/Lock.svg';
import Text from '../../components/atoms/Text';
import NoContentCard from '../../components/atoms/profile/NoContentCard';
import {
  NoContentDescription,
  NoContentSuggestion,
} from '../../components/atoms/profile/NoContentCommon';
import getDisplayname from '../../utils/getDisplayname';
import Button from '../../components/atoms/Button';

interface IUserPageIndex {
  user: Omit<newnewapi.User, 'toJSON'>;
  pagedPosts?: newnewapi.PagedPostsResponse;
  posts?: newnewapi.Post[];
  postsFilter: newnewapi.Post.Filter;
  nextPageTokenFromServer?: string;
  pageToken: string | null | undefined;
  totalCount: number;
  handleUpdatePageToken: (value: string | null | undefined) => void;
  handleUpdateCount: (value: number) => void;
  handleUpdateFilter: (value: newnewapi.Post.Filter) => void;
  handleSetPosts: React.Dispatch<React.SetStateAction<newnewapi.Post[]>>;
}

const UserPageIndex: NextPage<IUserPageIndex> = ({
  user,
  pagedPosts,
  nextPageTokenFromServer,
  posts,
  postsFilter,
  pageToken,
  totalCount,
  handleUpdatePageToken,
  handleUpdateCount,
  handleUpdateFilter,
  handleSetPosts,
}) => {
  const theme = useTheme();
  const { t } = useTranslation('page-Profile');

  // Loading state
  const [isLoading, setIsLoading] = useState(false);
  const { ref: loadingRef, inView } = useInView();
  const [triedLoading, setTriedLoading] = useState(false);

  const loadPosts = useCallback(
    async (isCreator: boolean, token?: string, needCount?: boolean) => {
      if (isLoading) return;

      try {
        setIsLoading(true);
        setTriedLoading(true);

        const fetchUserPostsPayload = new newnewapi.GetUserPostsRequest({
          userUuid: user.uuid,
          filter: postsFilter,
          relation: isCreator
            ? newnewapi.GetUserPostsRequest.Relation.THEY_CREATED
            : newnewapi.GetUserPostsRequest.Relation.THEY_PURCHASED,
          // relation: newnewapi.GetUserPostsRequest.Relation.UNKNOWN_RELATION,
          paging: {
            ...(token ? { pageToken: token } : {}),
          },
          ...(needCount
            ? {
                needTotalCount: true,
              }
            : {}),
        });

        const postsResponse = await fetchUsersPosts(fetchUserPostsPayload);

        if (postsResponse.data && postsResponse.data.posts) {
          handleSetPosts((curr) => [
            ...curr,
            ...(postsResponse.data?.posts as newnewapi.Post[]),
          ]);
          handleUpdatePageToken(postsResponse.data.paging?.nextPageToken);

          if (postsResponse.data.totalCount) {
            handleUpdateCount(postsResponse.data.totalCount);
          } else if (needCount) {
            handleUpdateCount(0);
          }
        }
        setIsLoading(false);
      } catch (err) {
        setIsLoading(false);
        console.error(err);
      }
    },
    [
      user.uuid,
      handleSetPosts,
      handleUpdatePageToken,
      handleUpdateCount,
      postsFilter,
      isLoading,
    ]
  );

  useEffect(() => {
    if (!user.options) {
      return;
    }

    const isCreator = !!user.options.isCreator;
    const isActivityPrivate = !!user.options.isActivityPrivate;

    if (!isCreator && isActivityPrivate) {
      return;
    }

    if (inView && !isLoading) {
      if (pageToken) {
        loadPosts(isCreator, pageToken);
      } else if (!triedLoading && !pageToken && posts?.length === 0) {
        loadPosts(isCreator, undefined, true);
      }
    } else if (!triedLoading && posts?.length === 0) {
      loadPosts(isCreator, undefined, true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inView, pageToken, isLoading, triedLoading, posts?.length, user.options]);

  return (
    <div>
      {!user.options?.isCreator && user.options?.isActivityPrivate ? (
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
      ) : (
        <SMain>
          <SCardsSection>
            {posts && (
              <PostList
                category=''
                loading={isLoading}
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
                    {t('CreatorsDecisions.noContent.description')}
                  </NoContentDescription>
                </NoContentCard>
              )}
            {user.options &&
              !user.options.isCreator &&
              posts &&
              posts.length === 0 &&
              !isLoading && (
                <NoContentCard>
                  <NoContentDescription>
                    {t('UserProfile.noContent.description', {
                      username: getDisplayname(user),
                    })}
                  </NoContentDescription>
                  <NoContentSuggestion>
                    {t('UserProfile.noContent.suggestion')}
                  </NoContentSuggestion>
                  <Link href='/'>
                    <SButton view='primaryGrad'>
                      {t('UserProfile.noContent.button')}
                    </SButton>
                  </Link>
                </NoContentCard>
              )}
          </SCardsSection>
          <div ref={loadingRef} />
        </SMain>
      )}
    </div>
  );
};

(UserPageIndex as NextPageWithLayout).getLayout = function getLayout(
  page: ReactElement
) {
  const renderedPage = page.props.user?.options?.isCreator
    ? 'creatorsDecisions'
    : page.props.user?.options?.isActivityPrivate
    ? 'activityHidden'
    : 'activity';

  return (
    <ProfileLayout
      key={page.props.user.uuid}
      renderedPage={renderedPage}
      user={page.props.user}
      {...{
        ...(renderedPage === 'creatorsDecisions'
          ? {
              postsCachedCreatorDecisions: page.props.pagedPosts.posts,
              postsCachedActivelyBiddingOnFilter: newnewapi.Post.Filter.ALL,
              postsCachedCreatorDecisionsPageToken:
                page.props.nextPageTokenFromServer,
              postsCachedCreatorDecisionsCount:
                page.props.pagedPosts.totalCount,
            }
          : renderedPage !== 'activityHidden'
          ? {
              postsCachedActivity: page.props.pagedPosts.posts,
              postsCachedActivityFilter: newnewapi.Post.Filter.ALL,
              postsCachedActivityPageToken: page.props.nextPageTokenFromServer,
              postsCachedActivityCount: page.props.pagedPosts.totalCount,
            }
          : {
              postsCachedActivity: [],
              postsCachedActivityFilter: newnewapi.Post.Filter.ALL,
              postsCachedActivityPageToken: undefined,
              postsCachedActivityCount: undefined,
            }),
      }}
    >
      {page}
    </ProfileLayout>
  );
};

export default UserPageIndex;

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { username } = context.query;
  const translationContext = await serverSideTranslations(context.locale!!, [
    'common',
    'page-Profile',
    'component-PostCard',
    'page-Post',
    'modal-PaymentModal',
    'modal-ResponseSuccessModal',
  ]);

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

  if (!res.data || res.error) {
    return {
      redirect: {
        destination: '/404',
        permanent: false,
      },
    };
  }

  // const isCreator = res.data.options?.isCreator;
  // const isActivityPrivate = res.data.options?.isActivityPrivate;
  // // const isCreator = true;
  // // const isActivityPrivate = false;

  // // will fetch only for creators
  // if (isCreator && !context.req.url?.startsWith('/_next')) {
  //   const fetchUserPostsPayload = new newnewapi.GetUserPostsRequest({
  //     userUuid: res.data.uuid,
  //     filter: newnewapi.Post.Filter.ALL,
  //     // relation: newnewapi.GetUserPostsRequest.Relation.THEY_PURCHASED,
  //     relation: newnewapi.GetUserPostsRequest.Relation.THEY_CREATED,
  //     needTotalCount: true,
  //     paging: {
  //       limit: 10,
  //     },
  //   });

  //   const postsResponse = await fetchUsersPosts(fetchUserPostsPayload);

  //   if (postsResponse.data) {
  //     return {
  //       props: {
  //         user: res.data.toJSON(),
  //         pagedPosts: postsResponse.data.toJSON(),
  //         ...(postsResponse.data.paging?.nextPageToken ? {
  //           nextPageTokenFromServer: postsResponse.data.paging?.nextPageToken,
  //         } : {}),
  //         ...translationContext,
  //       },
  //     };
  //   }
  // }

  // if (!isCreator && !isActivityPrivate && !context.req.url?.startsWith('/_next')) {
  //   const fetchUserPostsPayload = new newnewapi.GetUserPostsRequest({
  //     userUuid: res.data.uuid,
  //     filter: newnewapi.Post.Filter.ALL,
  //     relation: newnewapi.GetUserPostsRequest.Relation.UNKNOWN_RELATION,
  //     needTotalCount: true,
  //     paging: {
  //       limit: 10,
  //     },
  //   });

  //   const postsResponse = await fetchUsersPosts(fetchUserPostsPayload);

  //   if (postsResponse.data) {
  //     return {
  //       props: {
  //         user: res.data.toJSON(),
  //         pagedPosts: postsResponse.data.toJSON(),
  //         ...(postsResponse.data.paging?.nextPageToken ? {
  //           nextPageTokenFromServer: postsResponse.data.paging?.nextPageToken,
  //         } : {}),
  //         ...translationContext,
  //       },
  //     };
  //   }
  // }

  return {
    props: {
      user: res.data.toJSON(),
      pagedPosts: {},
      ...translationContext,
    },
  };
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

// Account private
const SAccountPrivate = styled.div``;

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
`;
