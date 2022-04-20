import { newnewapi } from 'newnew-api';
import React from 'react';
import styled from 'styled-components';
import Image from 'next/image';
import UserAvatar from '../UserAvatar';

interface ICreatorCard {
  creator: newnewapi.IUser;
}

export const CreatorCard: React.FC<ICreatorCard> = ({ creator }) => (
  <SCard>
    <SUserAvatar>
      <UserAvatar avatarUrl={creator.avatarUrl!!} />
    </SUserAvatar>
    <SDisplayName>{creator.nickname}</SDisplayName>
    <SUserName>@{creator.username}</SUserName>
    <SBackground>
      <Image src={creator.coverUrl!!} layout="fill" />
    </SBackground>
  </SCard>
);

export default CreatorCard;

const SCard = styled.div`
  padding: 10px;
  display: flex;
  flex-direction: column;
  border: 1.5px solid ${({ theme }) => theme.colorsThemed.background.outlines1};
  border-radius: ${({ theme }) => theme.borderRadius.medium};
  position: relative;
  height: 160px;
  cursor: pointer;
  transition: 0.2s linear;
  &:hover {
    transform: translateY(-8px);
  }
`;

const SBackground = styled.div`
  height: 68px;
  position: absolute;
  left: 10px;
  right: 10px;
  top: 10px;
  border-radius: ${({ theme }) => theme.borderRadius.medium};
  overflow: hidden;
`;

const SUserAvatar = styled.div`
  width: 72px;
  height: 72px;
  margin: 17px auto 5px;
  flex-shrink: 0;
  border-radius: 50%;
  overflow: hidden;
  border: 3px solid ${({ theme }) => theme.colorsThemed.background.primary};
  position: relative;
  z-index: 1;
  & > * {
    width: 100%;
    height: 100%;
    min-width: 100%;
    min-height: 100%;
  }
`;

const SDisplayName = styled.p`
  text-align: center;
  font-weight: 600;
  font-size: 14px;
  line-height: 20px;
  color: ${({ theme }) => theme.colorsThemed.text.primary};
  margin: 0 0 5px;
`;

const SUserName = styled.p`
  text-align: center;
  font-weight: 700;
  font-size: 12px;
  line-height: 16px;
  color: ${({ theme }) => theme.colorsThemed.text.secondary};
`;
