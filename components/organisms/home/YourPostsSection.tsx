import React, { useState, useEffect, useRef, useCallback } from 'react';
import { newnewapi } from 'newnew-api';
import { useTranslation } from 'next-i18next';
import styled from 'styled-components';
import Link from 'next/link';

import CardsSection from './CardsSection';
import Headline from '../../atoms/Headline';
import Button from '../../atoms/Button';
import FilterButton from '../../atoms/FilterButton';
import Text from '../../atoms/Text';

import { getMyPosts } from '../../../api/endpoints/user';

const YourPostsSection = () => {
  const { t: tCommon } = useTranslation('common');
  const { t } = useTranslation('page-Home');

  const [posts, setPosts] = useState<newnewapi.Post[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);
  const isPostsRequested = useRef(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const [statusFilter, setStatusFilter] =
    useState<newnewapi.GetRelatedToMePostsRequest.StatusFilter | null>(null);

  const prevStatusFilter = useRef(statusFilter);

  const [nextPageToken, setNextPageToken] = useState<
    string | undefined | null
  >();

  const fetchCreatorPosts = useCallback(
    async (abortController?: AbortController) => {
      try {
        setIsError(false);
        setIsLoadingMore(true);
        const payload = new newnewapi.GetRelatedToMePostsRequest({
          relation: newnewapi.GetRelatedToMePostsRequest.Relation.MY_CREATIONS,
          statusFilter:
            statusFilter ||
            newnewapi.GetRelatedToMePostsRequest.StatusFilter.ALL,
          paging: {
            ...(nextPageToken ? { pageToken: nextPageToken } : {}),
            limit: 10,
          },
          // ...(statusFilterValue
          //   ? { sorting: newnewapi.PostSorting.NEWEST_FIRST }
          //   : {}),
        });

        const postsResponse = await getMyPosts(
          payload,
          abortController?.signal
        );

        if (postsResponse.data && postsResponse.data.posts) {
          setPosts((curr) => [
            ...(nextPageToken ? curr : []),
            ...(postsResponse.data?.posts as newnewapi.Post[]),
          ]);
          setNextPageToken(postsResponse.data.paging?.nextPageToken);
        } else if ((postsResponse?.error as any)?.code !== 20) {
          setPosts([]);
          throw new Error('Request failed');
        }
      } catch (err: any) {
        console.error(err);
        setIsError(err.message);
      } finally {
        setIsLoadingMore(false);
        isPostsRequested.current = true;
      }
    },
    [nextPageToken, statusFilter]
  );

  const initialFetch = useCallback(
    async (abortController?: AbortController) => {
      setIsLoading(true);
      await fetchCreatorPosts(abortController);
      setIsLoading(false);
    },
    [fetchCreatorPosts]
  );

  useEffect(() => {
    const abortController = new AbortController();
    if (posts.length === 0 && !isPostsRequested.current) {
      initialFetch(abortController);
    }

    return () => {
      abortController.abort();
    };
  }, [initialFetch, posts.length, nextPageToken]);

  const loadMorePosts = useCallback(() => {
    if (nextPageToken && !isLoadingMore) {
      fetchCreatorPosts();
    }
  }, [fetchCreatorPosts, nextPageToken, isLoadingMore]);

  const handleSetStatusFilter = (
    newStatusFilter: newnewapi.GetRelatedToMePostsRequest.StatusFilter
  ) => {
    if (statusFilter === newStatusFilter) {
      setStatusFilter(null);
    } else {
      setStatusFilter(newStatusFilter);
    }

    setNextPageToken(null);
    setPosts([]);
  };

  useEffect(() => {
    if (prevStatusFilter.current !== statusFilter) {
      initialFetch();
      prevStatusFilter.current = statusFilter;
    }
  }, [statusFilter, initialFetch]);

  if (
    isPostsRequested.current &&
    posts.length === 0 &&
    !statusFilter &&
    !isLoading
  ) {
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
    <SContainer
      style={{ paddingTop: posts.length === 0 && !isLoading ? '62px' : 0 }}
    >
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
      {!isError && (posts.length || isLoading) && (
        <SCardsSection
          category='my-posts'
          collection={posts}
          loading={isLoading}
          onReachEnd={loadMorePosts}
          seeMoreLink='/profile/my-posts'
        />
      )}
      {!isLoading && posts.length === 0 && (
        <SNoPostsView>
          <Headline variant={4}>{t('ooops')}</Headline>
          <SHint variant='subtitle'>{t('noPosts')}</SHint>
          <Link href='/creation'>
            <a>
              <Button>{tCommon('button.createDecision')}</Button>
            </a>
          </Link>
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
