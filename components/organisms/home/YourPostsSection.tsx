import React, { useState, useEffect, useRef, useCallback } from 'react';
import { newnewapi } from 'newnew-api';
import { useTranslation } from 'next-i18next';
import styled from 'styled-components';
import Link from 'next/link';

import CardsSection from './CardsSection';
import Headline from '../../atoms/Headline';
import Button from '../../atoms/Button';
import FilterButton from '../../atoms/FilterButton';

import { getMyPosts } from '../../../api/endpoints/user';

interface IYourPostsSection {
  onPostOpen: (post: newnewapi.Post) => void;
}

const YourPostsSection = ({ onPostOpen }: IYourPostsSection) => {
  const { t } = useTranslation('common');

  const [posts, setPosts] = useState<newnewapi.Post[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);
  const isPostsRequested = useRef(false);

  const [statusFilter, setStatusFilter] =
    useState<newnewapi.GetRelatedToMePostsRequest.StatusFilter | null>(null);

  const [nextPageToken, setNextPageToken] = useState<
    string | undefined | null
  >();

  const fetchCreatorPosts = useCallback(async () => {
    try {
      const payload = new newnewapi.GetRelatedToMePostsRequest({
        relation: newnewapi.GetRelatedToMePostsRequest.Relation.MY_CREATIONS,
        statusFilter,
        paging: {
          ...(nextPageToken ? { pageToken: nextPageToken } : {}),
        },
        ...(statusFilter
          ? {}
          : { sorting: newnewapi.PostSorting.ACTIVE_FIRST }),
      });

      const postsResponse = await getMyPosts(payload);

      if (postsResponse.data && postsResponse.data.posts) {
        setPosts((curr) => [
          ...(nextPageToken ? curr : []),
          ...(postsResponse.data?.posts as newnewapi.Post[]),
        ]);
        setNextPageToken(postsResponse.data.paging?.nextPageToken);
      } else {
        throw new Error('Request failed');
      }
    } catch (err: any) {
      console.error(err);
      setIsError(err.message);
    } finally {
      isPostsRequested.current = true;
    }
  }, [statusFilter, nextPageToken]);

  const initialFetch = useCallback(async () => {
    setIsLoading(true);
    await fetchCreatorPosts();
    setIsLoading(false);
  }, [fetchCreatorPosts]);

  useEffect(() => {
    if (posts.length === 0) {
      initialFetch();
    }
  }, [initialFetch, posts.length, nextPageToken]);

  const loadMorePosts = useCallback(() => {
    if (nextPageToken) {
      fetchCreatorPosts();
    }
  }, [fetchCreatorPosts, nextPageToken]);

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

  if (
    isPostsRequested.current &&
    posts.length === 0 &&
    !statusFilter &&
    !isLoading
  ) {
    return (
      <SCreateFirstContainer>
        <SHeadline>Post your first Bid or Superpoll</SHeadline>
        <Link href='/creation'>
          <a>
            <Button>{t('button.createDecision')}</Button>
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
            newnewapi.GetRelatedToMePostsRequest.StatusFilter.ACTIVE
          }
          onClick={() =>
            handleSetStatusFilter(
              newnewapi.GetRelatedToMePostsRequest.StatusFilter.ACTIVE
            )
          }
          view='secondary'
        >
          Active
        </FilterButton>
        <FilterButton
          active={
            statusFilter ===
            newnewapi.GetRelatedToMePostsRequest.StatusFilter.ENDED
          }
          onClick={() =>
            handleSetStatusFilter(
              newnewapi.GetRelatedToMePostsRequest.StatusFilter.ENDED
            )
          }
          view='secondary'
        >
          Ended
        </FilterButton>
      </SFilterContainer>
      {!isError && (
        <SCardsSection
          category='biggest'
          collection={posts}
          loading={isLoading}
          handlePostClicked={onPostOpen}
          onReachEnd={loadMorePosts}
          seeMoreLink='/profile/my-posts'
        />
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

    margin-bottom: 80px;
  }

  ${({ theme }) => theme.media.laptop} {
    height: 484px;
  }

  ${(props) => props.theme.media.laptopM} {
    max-width: 1248px;
    margin: 0 auto;
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

  margin-bottom: 8px;

  ${({ theme }) => theme.media.tablet} {
    position: absolute;
    top: -10px;

    margin-bottom: 0;
  }
`;

export default YourPostsSection;
