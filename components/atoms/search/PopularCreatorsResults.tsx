/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { newnewapi } from 'newnew-api';
import React from 'react';
import { useRouter } from 'next/router';
import styled from 'styled-components';
import UserAvatar from '../../molecules/UserAvatar';

interface IFunction {
  creators: newnewapi.IUser[];
}

const PopularCreatorsResults: React.FC<IFunction> = ({ creators }) => {
  const router = useRouter();
  return (
    <SContainer>
      <SBlockTitle>Popular Creators</SBlockTitle>
      {creators.map((creator) => (
        <SPost
          key={creator.uuid}
          onClick={() => router.push(`/${creator.username}`)}
        >
          <SLeftSide>
            <SUserAvatar>
              <UserAvatar
                avatarUrl={creator.avatarUrl ? creator.avatarUrl : ''}
              />
            </SUserAvatar>
            <SPostData>
              <SCreatorUsername>{creator.nickname}</SCreatorUsername>
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
  /* margin-bottom: 16px; */
  display: flex;
  font-size: 14px;
  line-height: 20px;
  font-weight: 600;
  padding: 8px 16px;
  margin: 0 -16px;
  cursor: pointer;
  &:hover {
    background: ${({ theme }) => theme.colorsThemed.background.secondary};
  }
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
