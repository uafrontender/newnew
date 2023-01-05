import React, { useState, useCallback, useMemo } from 'react';
import { newnewapi } from 'newnew-api';
import { useTranslation } from 'next-i18next';
import styled from 'styled-components';
import Link from 'next/link';
import { useInfiniteQuery } from 'react-query';

import CardsSection from './CardsSection';
import Headline from '../../atoms/Headline';
import Button from '../../atoms/Button';
import FilterButton from '../../atoms/FilterButton';
import Text from '../../atoms/Text';
import Lottie from '../../atoms/Lottie';

import { getMyPosts } from '../../../api/endpoints/user';

import logoAnimation from '../../../public/animations/mobile_logo.json';

const YourPostsSection = () => {
  const { t: tCommon } = useTranslation('common');
  const { t } = useTranslation('page-Home');

  const [statusFilter, setStatusFilter] =
    useState<newnewapi.GetRelatedToMePostsRequest.StatusFilter | null>(null);

  const {
    data,
    isLoading: loading,
    hasNextPage,
    fetchNextPage,
    isFetched: initialLoadDone,
  } = useInfiniteQuery(
    [
      'getMyPosts',
      newnewapi.GetRelatedToMePostsRequest.Relation.MY_CREATIONS,
      statusFilter,
    ],
    async ({ pageParam }) => {
      const payload = new newnewapi.GetRelatedToMePostsRequest({
        relation: newnewapi.GetRelatedToMePostsRequest.Relation.MY_CREATIONS,
        statusFilter:
          statusFilter || newnewapi.GetRelatedToMePostsRequest.StatusFilter.ALL,
        paging: {
          pageToken: pageParam,
          limit: 10,
        },
      });
      const postsResponse = await getMyPosts(payload);

      if (!postsResponse.data || postsResponse.error) {
        throw new Error('Request failed');
      }

      return {
        posts: postsResponse?.data?.posts || [],
        paging: postsResponse?.data?.paging,
      };
    },
    {
      getNextPageParam: (lastPage) => lastPage.paging?.nextPageToken,
      onError: (error) => {
        console.error(error);
      },
    }
  );

  const posts = useMemo(
    () => (data ? data.pages.map((page) => page.posts).flat() : []),
    [data]
  );

  const loadMore = useCallback(() => {
    if (hasNextPage) {
      fetchNextPage();
    }
  }, [fetchNextPage, hasNextPage]);

  const handleSetStatusFilter = (
    newStatusFilter: newnewapi.GetRelatedToMePostsRequest.StatusFilter
  ) => {
    if (statusFilter === newStatusFilter) {
      setStatusFilter(null);
    } else {
      setStatusFilter(newStatusFilter);
    }
  };

  // Create you first post block
  if (posts.length === 0 && !statusFilter && !loading && initialLoadDone) {
    return (
      <SCreateFirstContainer>
        <SHeadline>{t('createFirstPost.title')}</SHeadline>
        <Link href='/creation'>
          <a>
            <Button>{tCommon('button.createDecision')}</Button>
          </a>
        </Link>
      </SCreateFirstContainer>
    );
  }

  return (
    <SContainer>
      <SFilterContainer>
        <FilterButton
          active={
            statusFilter ===
            newnewapi.GetRelatedToMePostsRequest.StatusFilter?.ACTIVE
          }
          onClick={() =>
            handleSetStatusFilter(
              newnewapi.GetRelatedToMePostsRequest.StatusFilter?.ACTIVE
            )
          }
          view='secondary'
        >
          {t('createFirstPost.filter.active')}
        </FilterButton>
        <FilterButton
          active={
            statusFilter ===
            newnewapi.GetRelatedToMePostsRequest.StatusFilter?.ENDED
          }
          onClick={() =>
            handleSetStatusFilter(
              newnewapi.GetRelatedToMePostsRequest.StatusFilter?.ENDED
            )
          }
          view='secondary'
        >
          {t('createFirstPost.filter.ended')}
        </FilterButton>
      </SFilterContainer>
      {(posts.length || loading) && (
        <SCardsSection
          category='my-posts'
          collection={posts}
          loading={loading && !initialLoadDone}
          onReachEnd={loadMore}
          seeMoreLink='/profile/my-posts'
        />
      )}
      {!loading && posts.length === 0 && (
        <SNoPostsView>
          {initialLoadDone ? (
            <>
              <Headline variant={4}>{t('ooops')}</Headline>
              <SHint variant='subtitle'>{t('noPosts')}</SHint>
              <Link href='/creation'>
                <a>
                  <Button>{tCommon('button.createDecision')}</Button>
                </a>
              </Link>
            </>
          ) : (
            <Lottie
              width={64}
              height={64}
              options={{
                loop: true,
                autoplay: true,
                animationData: logoAnimation,
              }}
            />
          )}
        </SNoPostsView>
      )}
    </SContainer>
  );
};

const SContainer = styled.section`
  position: relative;

  ${(props) => props.theme.media.laptopM} {
    max-width: 1248px;
    margin: 0 auto;
  }
`;

const SCardsSection = styled(CardsSection)`
  margin-bottom: 40px;
  padding: 0;

  & > div > div > div > div {
    border-color: ${({ theme }) => theme.colorsThemed.accent.blue};
  }

  ${({ theme }) => theme.media.tablet} {
    margin-bottom: 80px;
  }
`;

const SCreateFirstContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  border: 2px solid ${({ theme }) => theme.colorsThemed.accent.blue};
  border-radius: ${({ theme }) => theme.borderRadius.medium};
  height: 198px;
  margin-bottom: 40px;

  ${({ theme }) => theme.media.tablet} {
    height: 280px;

    margin-bottom: 70px;
  }

  ${({ theme }) => theme.media.laptop} {
    height: 484px;
  }

  ${(props) => props.theme.media.laptopM} {
    max-width: 1248px;
    margin: 0 auto 80px;
  }
`;

const SHeadline = styled(Headline)`
  margin-bottom: 16px;
  max-width: 587px;

  text-align: center;

  font-size: 24px;
  line-height: 32px;

  ${({ theme }) => theme.media.tablet} {
    margin-bottom: 24px;
    max-width: 320px;

    font-size: 36px;
    line-height: 44px;
  }

  ${({ theme }) => theme.media.laptop} {
    margin-bottom: 40px;
    max-width: 520px;

    font-size: 64px;
    line-height: 72px;
  }
`;

const SFilterContainer = styled.div`
  display: flex;
  z-index: 1;

  margin-bottom: 8px;

  ${({ theme }) => theme.media.tablet} {
    /* position: absolute;
    top: -10px; */

    margin-bottom: 0;
  }
`;

const SNoPostsView = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 198px;
  margin-top: 32px;
  margin-bottom: 40px;

  border: 2px solid
    ${({ theme }) =>
      theme.name === 'dark'
        ? theme.colors.darkGray
        : theme.colorsThemed.background.outlines2};
  border-radius: ${({ theme }) => theme.borderRadius.large};

  ${({ theme }) => theme.media.tablet} {
    height: 280px;
    margin-top: 24px;
    margin-bottom: 70px;
  }

  ${({ theme }) => theme.media.laptop} {
    height: 364px;
    margin-top: 32px;
    margin-bottom: 80px;
  }
`;

const SHint = styled(Text)`
  margin-bottom: 16px;
  margin-top: 8px;

  font-weight: 600;
  font-size: 16px;
  line-height: 24px;

  ${({ theme }) => theme.media.tablet} {
    margin-bottom: 32px;
  }
`;

export default YourPostsSection;
