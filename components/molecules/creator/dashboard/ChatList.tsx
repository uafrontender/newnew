import React, { useMemo, useCallback, useRef } from 'react';
import styled from 'styled-components';
import { useRouter } from 'next/router';

import Text from '../../../atoms/Text';
import Indicator from '../../../atoms/Indicator';
import GradientMask from '../../../atoms/GradientMask';
import UserAvatar from '../../UserAvatar';

import { useAppSelector } from '../../../../redux-store/store';
import useScrollGradients from '../../../../utils/hooks/useScrollGradients';

export const ChatList = () => {
  const router = useRouter();
  const user = useAppSelector((state) => state.user);
  const scrollRef: any = useRef();

  const collection = useMemo(
    () => [
      {
        id: '1',
        time: '30 min',
        title: 'Dark Moon 🌚',
        lastMessage: 'Yeah, I know🙈 But I think it’s awe…',
        unread: false,
      },
      {
        id: '2',
        time: '30 min',
        title: 'Dark Moon 🌚',
        lastMessage: 'Yeah, I know🙈 But I think it’s awe…',
        unread: true,
        unreadCount: 10,
      },
      {
        id: '3',
        time: '30 min',
        title: 'Dark Moon 🌚',
        lastMessage: 'Yeah, I know🙈 But I think it’s awe…',
        unread: true,
        unreadCount: 2,
      },
      {
        id: '4',
        time: '30 min',
        title: 'Dark Moon 🌚',
        lastMessage: 'Yeah, I know🙈 But I think it’s awe…',
        unread: false,
      },
      {
        id: '5',
        time: '30 min',
        title: 'Dark Moon 🌚',
        lastMessage: 'Yeah, I know🙈 But I think it’s awe…',
        unread: false,
      },
      {
        id: '6',
        time: '30 min',
        title: 'Dark Moon 🌚',
        lastMessage: 'Yeah, I know🙈 But I think it’s awe…',
        unread: false,
      },
      {
        id: '7',
        time: '30 min',
        title: 'Dark Moon 🌚',
        lastMessage: 'Yeah, I know🙈 But I think it’s awe…',
        unread: true,
        unreadCount: 1,
      },
      {
        id: '8',
        time: '30 min',
        title: 'Dark Moon 🌚',
        lastMessage: 'Yeah, I know🙈 But I think it’s awe…',
        unread: false,
      },
      {
        id: '9',
        time: '30 min',
        title: 'Dark Moon 🌚',
        lastMessage: 'Yeah, I know🙈 But I think it’s awe…',
        unread: true,
        unreadCount: 6,
      },
      {
        id: '10',
        time: '30 min',
        title: 'Dark Moon 🌚',
        lastMessage: 'Yeah, I know🙈 But I think it’s awe…',
        unread: true,
        unreadCount: 11,
      },
      {
        id: '11',
        time: '30 min',
        title: 'Dark Moon 🌚',
        lastMessage: 'Yeah, I know🙈 But I think it’s awe…',
        unread: true,
        unreadCount: 15,
      },
      {
        id: '12',
        time: '30 min',
        title: 'Dark Moon 🌚',
        lastMessage: 'Yeah, I know🙈 But I think it’s awe…',
        unread: true,
        unreadCount: 6,
      },
      {
        id: '13',
        time: '30 min',
        title: 'Dark Moon 🌚',
        lastMessage: 'Yeah, I know🙈 But I think it’s awe…',
        unread: true,
        unreadCount: 12,
      },
      {
        id: '14',
        time: '30 min',
        title: 'Dark Moon 🌚',
        lastMessage: 'Yeah, I know🙈 But I think it’s awe…',
        unread: true,
        unreadCount: 14,
      },
      {
        id: '15',
        time: '30 min',
        title: 'Dark Moon 🌚',
        lastMessage: 'Yeah, I know🙈 But I think it’s awe…',
        unread: true,
        unreadCount: 15,
      },
      {
        id: '16',
        time: '30 min',
        title: 'Dark Moon 🌚',
        lastMessage: 'Yeah, I know🙈 But I think it’s awe…',
        unread: true,
        unreadCount: 1,
      },
      {
        id: '17',
        time: '30 min',
        title: 'Dark Moon 🌚',
        lastMessage: 'Yeah, I know🙈 But I think it’s awe…',
        unread: true,
        unreadCount: 16,
      },
      {
        id: '18',
        time: '30 min',
        title: 'Dark Moon 🌚',
        lastMessage: 'Yeah, I know🙈 But I think it’s awe…',
        unread: true,
        unreadCount: 20,
      },
      {
        id: '19',
        time: '30 min',
        title: 'Dark Moon 🌚',
        lastMessage: 'Yeah, I know🙈 But I think it’s awe…',
        unread: true,
        unreadCount: 100,
      },
    ],
    []
  );

  const renderChatItem = useCallback(
    (item, index) => {
      const handleUserClick = () => {};
      const handleItemClick = () => {
        router.push('/creator/dashboard?tab=direct-messages');
      };

      return (
        <SChatItemContainer key={`chat-item-${item.id}`}>
          <SChatItem onClick={handleItemClick}>
            <SChatItemAvatar withClick onClick={handleUserClick} avatarUrl={user.userData?.avatarUrl} />
            <SChatItemCenter>
              <SChatItemText variant={3} weight={600}>
                {item.title}
              </SChatItemText>
              <SChatItemLastMessage variant={3} weight={600}>
                {item.lastMessage}
              </SChatItemLastMessage>
            </SChatItemCenter>
            <SChatItemRight>
              <SChatItemTime variant={3} weight={600}>
                {item.time}
              </SChatItemTime>
              {!!item.unread && <SChatItemIndicator counter={item.unreadCount} />}
            </SChatItemRight>
          </SChatItem>
          {index !== collection.length - 1 && <SChatSeparator />}
        </SChatItemContainer>
      );
    },
    [router, collection.length, user.userData?.avatarUrl]
  );

  const { showTopGradient, showBottomGradient } = useScrollGradients(scrollRef);

  return (
    <>
      <SSectionContent ref={scrollRef}>{collection.map(renderChatItem)}</SSectionContent>
      <GradientMask positionTop active={showTopGradient} />
      <GradientMask active={showBottomGradient} />
    </>
  );
};

export default ChatList;

const SSectionContent = styled.div`
  height: calc(100% - 48px);
  padding: 0 24px;
  display: flex;
  position: relative;
  overflow-y: auto;
  flex-direction: column;
`;

const SChatItem = styled.div`
  cursor: pointer;
  display: flex;
  padding: 8px 0;
`;

const SChatItemAvatar = styled(UserAvatar)``;

const SChatItemCenter = styled.div`
  width: 100%;
  display: flex;
  padding: 2px 12px;
  flex-direction: column;
`;

const SChatItemText = styled(Text)`
  margin-bottom: 4px;
`;

const SChatItemLastMessage = styled(Text)`
  color: ${(props) => props.theme.colorsThemed.text.tertiary};
`;

const SChatItemRight = styled.div`
  display: flex;
  padding: 2px 0;
  align-items: flex-end;
  flex-direction: column;
`;

const SChatItemTime = styled(Text)`
  color: ${(props) => props.theme.colorsThemed.text.tertiary};
  white-space: nowrap;
  margin-bottom: 4px;
`;

const SChatItemIndicator = styled(Indicator)``;

const SChatSeparator = styled.div`
  border: 1px solid ${(props) => props.theme.colorsThemed.background.outlines1};
  margin-left: 60px;
  border-radius: 2px;
`;

const SChatItemContainer = styled.div``;
