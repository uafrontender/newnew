/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useMemo } from 'react';
import styled from 'styled-components';
import textTrim from '../../utils/textTrim';
import UserAvatar from '../molecules/UserAvatar';

interface IFunction {
  keyword: string;
}

export const TopDecisionsResults: React.FC<IFunction> = ({ keyword }) => {
  const posts = useMemo(
    () => [
      {
        uuid: 'Event',
        title: 'Should I go and jump into a Should I go and jump into a',
        type: 'Event',
        username: 'CreatorDisplayName',
        avatar: '/images/mock/test_user_1.jpg',
        timestamp: '00h 00m 00s',
      },
      {
        uuid: 'Superpoll',
        title:
          'This is another title that’s too This is another title that’s too...',
        type: 'Superpoll',
        username: 'CreatorDisplayName',
        avatar: '/images/mock/test_user_1.jpg',
        timestamp: '00h 00m 00s',
      },
      {
        uuid: 'Goal',
        title: 'And one more just for good me And one more just for good me...',
        type: 'Goal',
        username: 'CreatorDisplayName',
        avatar: '/images/mock/test_user_1.jpg',
        timestamp: '00h 00m 00s',
      },
    ],
    []
  );

  return (
    <SContainer>
      <SBlockTitle>Top Decisions</SBlockTitle>
      {posts.map((post) => (
        <SPost key={post.uuid}>
          <SLeftSide>
            <SUserAvatar>
              <UserAvatar avatarUrl={post.avatar} />
            </SUserAvatar>
            <SPostData>
              <SPostTitle>{textTrim(post.title, 28)}</SPostTitle>
              <SCreatorUsername>{post.username}</SCreatorUsername>
            </SPostData>
          </SLeftSide>
          <SPostDetails>
            <SPostType>{post.type}</SPostType>
            <SPostEnded>{post.timestamp}</SPostEnded>
          </SPostDetails>
        </SPost>
      ))}
    </SContainer>
  );
};

export default TopDecisionsResults;

const SContainer = styled.div`
  padding-bottom: 20px;
`;

const SBlockTitle = styled.strong`
  display: block;
  color: #646e81;
  font-size: 16px;
  font-weight: 700;
  line-height: 24px;
  margin-bottom: 16px;
`;

const SPost = styled.div`
  margin-bottom: 16px;
  display: flex;
  font-size: 14px;
  line-height: 20px;
  font-weight: 600;
`;

const SLeftSide = styled.div`
  display: flex;
`;

const SPostData = styled.div`
  display: flex;
  flex-direction: column;
`;

const SUserAvatar = styled.div`
  width: 36px;
  height: 36px;
  flex-shrink: 0;
  border-radius: 6px;
  overflow: hidden;
  margin-right: 6px;
  & > * {
    width: 100%;
    height: 100%;
    min-width: 100%;
    min-height: 100%;
  }
`;

const SPostTitle = styled.span`
  color: ${({ theme }) => theme.colorsThemed.text.primary};
`;

const SCreatorUsername = styled.span`
  color: ${({ theme }) => theme.colorsThemed.text.secondary};
`;

const SPostType = styled.span`
  color: ${({ theme }) => theme.colorsThemed.text.primary};
`;

const SPostEnded = styled.span`
  color: ${({ theme }) => theme.colorsThemed.text.tertiary};
`;

const SPostDetails = styled.div`
  margin-left: auto;
  display: flex;
  flex-direction: column;
  text-align: right;
`;
