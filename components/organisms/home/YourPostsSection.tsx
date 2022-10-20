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

  console.log(nextPageToken, 'nextPageToken');

  const fetchCreatorPosts = useCallback(async () => {
    try {
      const payload = new newnewapi.GetRelatedToMePostsRequest({
        relation: newnewapi.GetRelatedToMePostsRequest.Relation.MY_CREATIONS,
        statusFilter,
        needTotalCount: true,
        paging: {
          ...(nextPageToken ? { pageToken: nextPageToken } : {}),
        },
        // sorting: newnewapi.PostSorting.ACTIVE_FIRST,
      });

      const postsResponse = await getMyPosts(payload);

      console.log(postsResponse, 'postsResponse');

      if (postsResponse.data && postsResponse.data.posts) {
        setPosts((curr) => [
          ...curr,
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

  useEffect(() => {
    const initialFetch = async () => {
      setIsLoading(true);
      await fetchCreatorPosts();
      setIsLoading(false);
    };

    if (posts.length === 0) {
      initialFetch();
    }
  }, [fetchCreatorPosts, posts.length]);

  const loadMorePosts = useCallback(() => {
    if (nextPageToken) {
      fetchCreatorPosts();
    }
  }, [fetchCreatorPosts, nextPageToken]);

  if (isPostsRequested.current && posts.length === 0) {
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
            setStatusFilter(
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
            setStatusFilter(
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
        />
      )}
    </SContainer>
  );
};

const SContainer = styled.div``;

const SCardsSection = styled(CardsSection)`
  margin-bottom: 80px;
  padding: 0;

  & > div > div > div > div {
    border-color: ${({ theme }) => theme.colorsThemed.accent.blue};
  }
`;

const SCreateFirstContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  border: 2px solid ${({ theme }) => theme.colorsThemed.accent.blue};
  border-radius: ${({ theme }) => theme.borderRadius.medium};
  height: 484px;
  margin-bottom: 80px;
`;

const SHeadline = styled(Headline)`
  margin-bottom: 40px;
  max-width: 587px;

  text-align: center;
  font-size: 64px;
  line-height: 72px;
`;

const SFilterContainer = styled.div`
  display: flex;
`;

export default YourPostsSection;
