import React, { useState, useEffect } from 'react';
import { newnewapi } from 'newnew-api';
// import { useTranslation } from 'next-i18next';
import styled from 'styled-components';

import CardsSection from './CardsSection';

import { getMyPosts } from '../../../api/endpoints/user';

interface IYourPostsSection {
  onPostOpen: (post: newnewapi.Post) => void;
}

const YourPostsSection = ({ onPostOpen }: IYourPostsSection) => {
  // const { t } = useTranslation('page-Home');

  const [posts, setPosts] = useState<newnewapi.Post[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);

  useEffect(() => {
    async function fetchBiggest() {
      try {
        setIsLoading(true);
        const payload = new newnewapi.GetRelatedToMePostsRequest({
          relation: newnewapi.GetRelatedToMePostsRequest.Relation.MY_CREATIONS,
          // filter: postsFilter,
        });
        const postsResponse = await getMyPosts(payload);

        if (postsResponse.data && postsResponse.data.posts) {
          setPosts((curr) => [
            ...curr,
            ...(postsResponse.data?.posts as newnewapi.Post[]),
          ]);
        } else {
          throw new Error('Request failed');
        }
      } catch (err) {
        setIsError(true);
      } finally {
        setIsLoading(false);
      }
    }

    fetchBiggest();
  }, []);

  return (
    <SContainer>
      {!isError && (
        <SCardsSection
          category='biggest'
          collection={posts}
          loading={isLoading}
          handlePostClicked={onPostOpen}
        />
      )}
    </SContainer>
  );
};

const SContainer = styled.div``;

const SCardsSection = styled(CardsSection)`
  & > div > div > div > div {
    border-color: ${({ theme }) => theme.colorsThemed.accent.blue};
  }
`;

export default YourPostsSection;
