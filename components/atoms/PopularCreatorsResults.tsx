/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useMemo } from 'react';
import styled from 'styled-components';
import UserAvatar from '../molecules/UserAvatar';

interface IFunction {
  keyword: string;
}

export const PopularCreatorsResults: React.FC<IFunction> = ({ keyword }) => {
  const creators = useMemo(
    () => [
      {
        uuid: 'Event0',
        username: 'CreatorDisplayName',
        avatar: '/images/mock/test_user_1.jpg',
      },
      {
        uuid: 'Event1',
        username: 'CreatorDisplayName',
        avatar: '/images/mock/test_user_1.jpg',
      },
      {
        uuid: 'Event2',
        username: 'CreatorDisplayName',
        avatar: '/images/mock/test_user_1.jpg',
      },
    ],
    []
  );

  return (
    <SContainer>
      <SBlockTitle>Popular Creators</SBlockTitle>
      {creators.map((creator) => (
        <SPost key={creator.uuid}>
          <SLeftSide>
            <SUserAvatar>
              <UserAvatar avatarUrl={creator.avatar} />
            </SUserAvatar>
            <SPostData>
              <SCreatorUsername>{creator.username}</SCreatorUsername>
              <SLink>See decisions</SLink>
            </SPostData>
          </SLeftSide>
        </SPost>
      ))}
    </SContainer>
  );
};

export default PopularCreatorsResults;

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
  border-radius: 50%;
  overflow: hidden;
  margin-right: 6px;
  & > * {
    width: 100%;
    height: 100%;
    min-width: 100%;
    min-height: 100%;
  }
`;

const SCreatorUsername = styled.span`
  color: ${({ theme }) => theme.colorsThemed.text.primary};
`;

const SLink = styled.span`
  color: ${({ theme }) => theme.colorsThemed.text.secondary};
`;
