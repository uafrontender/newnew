import React, { useState, useMemo, useCallback, useEffect } from 'react';
import dynamic from 'next/dynamic';
import styled from 'styled-components';
import moment from 'moment';

import UserAvatar from '../UserAvatar';
import textTrim from '../../../utils/textTrim';

import { IChatData, IUser, IMessage } from '../../interfaces/ichat';

import { useAppSelector } from '../../../redux-store/store';
import {
  SChatItemContainer,
  SChatItem,
  SChatItemCenter,
  SChatItemText,
  SChatItemLastMessage,
  SChatItemRight,
  SChatItemTime,
  SChatItemIndicator,
  SChatSeparator,
} from '../../atoms/chat/styles';

const EmptyInbox = dynamic(() => import('../../atoms/chat/EmptyInbox'));

interface IFunctionProps {
  openChat: (arg: IChatData) => void;
}

export const ChatList: React.FC<IFunctionProps> = ({ openChat }) => {
  const user = useAppSelector((state) => state.user);
  const [activeChatIndex, setActiveChatIndex] = useState<string | null>(null);

  const collection = useMemo(
    () => [
      {
        id: '1',
        time: '30 min',
        userData: {
          userName: '🦄Unicornbabe',
          userAlias: 'unicornbabe',
          blockedUser: true,
          avatar: '/images/mock/test_user_1.jpg',
        },
        messages: [
          {
            id: '1',
            message: 'Yeah, I know🙈 But I think it’s awesome idea!',
            mine: true,
            date: moment(),
          },
          {
            id: '2',
            message: 'Hiii, Lance 😃',
            mine: true,
            date: moment(),
          },
          {
            id: '3',
            message: 'I don’t beleive...',
            mine: false,
            date: moment(),
          },
          {
            id: '4',
            message: "Your new decision of getting a tattoo on your face is crazy. I'm shocked! 😱",
            mine: false,
            date: moment(),
          },
          {
            id: '5',
            message: 'Hey, Annie 👋',
            mine: false,
            date: moment(),
          },
          {
            id: '6',
            message: 'Hey there, Ya, me too 😏',
            mine: false,
            date: moment().subtract(2, 'days'),
          },
          {
            id: '7',
            message: 'Weeelcome 🎉 Happy that you joined NewNew!',
            mine: true,
            date: moment().subtract(2, 'days'),
          },
          {
            id: '8',
            message: 'Yeah, I know🙈 But I think it’s awesome idea!',
            mine: true,
            date: moment().subtract(3, 'days'),
          },
          {
            id: '9',
            message: 'Hiii, Lance 😃',
            mine: true,
            date: moment().subtract(3, 'days'),
          },
          {
            id: '10',
            message: 'I don’t beleive...',
            mine: false,
            date: moment().subtract(3, 'days'),
          },
          {
            id: '11',
            message: "Your new decision of getting a tattoo on your face is crazy. I'm shocked! 😱",
            mine: false,
            date: moment().subtract(3, 'days'),
          },
          {
            id: '12',
            message: 'Hey, Annie 👋',
            mine: false,
            date: moment().subtract(3, 'days'),
          },
          {
            id: '13',
            message: 'Hey there, Ya, me too 😏',
            mine: false,
            date: moment().subtract(3, 'days'),
          },
          {
            id: '14',
            message: 'Weeelcome 🎉 Happy that you joined NewNew!',
            mine: true,
            date: moment().subtract(3, 'days'),
          },
        ],
        unread: false,
      },
      {
        id: '6',
        time: '30 min',
        userData: {
          userName: '🦄Unicornbabe1',
          userAlias: 'unicornbabe1',
          avatar: '/images/mock/test_user_3.jpg',
        },
        messages: [
          {
            id: '1',
            message: 'Yeah, I know🙈 But I think it’s awesome idea!',
            mine: true,
            date: moment(),
          },
          {
            id: '2',
            message: 'Hiii, Lance 😃',
            mine: true,
            date: moment(),
          },
          {
            id: '3',
            message: 'I don’t beleive...',
            mine: false,
            date: moment(),
          },
          {
            id: '4',
            message: "Your new decision of getting a tattoo on your face is crazy. I'm shocked! 😱",
            mine: false,
            date: moment(),
          },
          {
            id: '5',
            message: 'Hey, Annie 👋',
            mine: false,
            date: moment(),
          },
          {
            id: '6',
            message: 'Hey there, Ya, me too 😏',
            mine: false,
            date: moment().subtract(2, 'days'),
          },
          {
            id: '7',
            message: 'Weeelcome 🎉 Happy that you joined NewNew!',
            mine: true,
            date: moment().subtract(2, 'days'),
          },
          {
            id: '8',
            message: 'Yeah, I know🙈 But I think it’s awesome idea!',
            mine: true,
            date: moment().subtract(3, 'days'),
          },
          {
            id: '9',
            message: 'Hiii, Lance 😃',
            mine: true,
            date: moment().subtract(3, 'days'),
          },
          {
            id: '10',
            message: 'I don’t beleive...',
            mine: false,
            date: moment().subtract(3, 'days'),
          },
          {
            id: '11',
            message: "Your new decision of getting a tattoo on your face is crazy. I'm shocked! 😱",
            mine: false,
            date: moment().subtract(3, 'days'),
          },
          {
            id: '12',
            message: 'Hey, Annie 👋',
            mine: false,
            date: moment().subtract(3, 'days'),
          },
          {
            id: '13',
            message: 'Hey there, Ya, me too 😏',
            mine: false,
            date: moment().subtract(3, 'days'),
          },
          {
            id: '14',
            message: 'Weeelcome 🎉 Happy that you joined NewNew!',
            mine: true,
            date: moment().subtract(3, 'days'),
          },
        ],
        unread: false,
      },
      {
        id: '2',
        time: '30 min',
        userData: {
          userName: 'Caramella🍬',
          userAlias: 'caramella',
          avatar: '/images/mock/test_user_2.jpg',
          subscriptionExpired: true,
        },
        messages: [
          {
            id: '1',
            message: 'Deal 🤝',
            mine: true,
            date: moment(),
          },
          {
            id: '2',
            message: 'Hiii, Lance 😃',
            mine: true,
            date: moment(),
          },
          {
            id: '3',
            message: 'I don’t beleive...',
            mine: false,
            date: moment(),
          },
          {
            id: '4',
            message: "Your new decision of getting a tattoo on your face is crazy. I'm shocked! 😱",
            mine: false,
            date: moment(),
          },
          {
            id: '5',
            message: 'Hey, Annie 👋',
            mine: false,
            date: moment(),
          },
          {
            id: '6',
            message: 'Hey there, Ya, me too 😏',
            mine: false,
            date: moment().subtract(2, 'days'),
          },
          {
            id: '7',
            message: 'Weeelcome 🎉 Happy that you joined NewNew!',
            mine: true,
            date: moment().subtract(2, 'days'),
          },
          {
            id: '8',
            message: 'Yeah, I know🙈 But I think it’s awesome idea!',
            mine: true,
            date: moment().subtract(3, 'days'),
          },
          {
            id: '9',
            message: 'Hiii, Lance 😃',
            mine: true,
            date: moment().subtract(3, 'days'),
          },
          {
            id: '10',
            message: 'I don’t beleive...',
            mine: false,
            date: moment().subtract(3, 'days'),
          },
          {
            id: '11',
            message: "Your new decision of getting a tattoo on your face is crazy. I'm shocked! 😱",
            mine: false,
            date: moment().subtract(3, 'days'),
          },
          {
            id: '12',
            message: 'Hey, Annie 👋',
            mine: false,
            date: moment().subtract(3, 'days'),
          },
          {
            id: '13',
            message: 'Hey there, Ya, me too 😏',
            mine: false,
            date: moment().subtract(3, 'days'),
          },
          {
            id: '14',
            message: 'Weeelcome 🎉 Happy that you joined NewNew!',
            mine: true,
            date: moment().subtract(3, 'days'),
          },
        ],
        unread: true,
        unreadCount: 10,
      },
      {
        id: '3',
        time: '50 min',
        userData: {
          userName: 'Girly👧',
          userAlias: 'girly',
          justSubscribed: true,
          avatar: '/images/mock/test_user_3.jpg',
        },
        messages: [
          {
            id: '1',
            message: '👋 Hey, thank you for subscribing to my channel, I look forward to talking to you',
            mine: false,
            date: moment(),
          },
        ],
        unread: false,
      },
      {
        id: '4',
        time: '30 min',
        userData: {
          userName: 'Dolly🪆',
          userAlias: 'dolly',
          avatar: '/images/mock/test_user_4.jpg',
          messagingDisabled: true,
        },
        messages: [
          {
            id: '1',
            message: 'Yeah, I know🙈 But I think it’s awesome idea!',
            mine: true,
            date: moment(),
          },
          {
            id: '2',
            message: 'Hiii, Lance 😃',
            mine: true,
            date: moment(),
          },
          {
            id: '3',
            message: 'I don’t beleive...',
            mine: false,
            date: moment(),
          },
          {
            id: '4',
            message: "Your new decision of getting a tattoo on your face is crazy. I'm shocked! 😱",
            mine: false,
            date: moment(),
          },
          {
            id: '5',
            message: 'Hey, Annie 👋',
            mine: false,
            date: moment(),
          },
          {
            id: '6',
            message: 'Hey there, Ya, me too 😏',
            mine: false,
            date: moment().subtract(2, 'days'),
          },
          {
            id: '7',
            message: 'Weeelcome 🎉 Happy that you joined NewNew!',
            mine: true,
            date: moment().subtract(2, 'days'),
          },
          {
            id: '8',
            message: 'Yeah, I know🙈 But I think it’s awesome idea!',
            mine: true,
            date: moment().subtract(3, 'days'),
          },
          {
            id: '9',
            message: 'Hiii, Lance 😃',
            mine: true,
            date: moment().subtract(3, 'days'),
          },
          {
            id: '10',
            message: 'I don’t beleive...',
            mine: false,
            date: moment().subtract(3, 'days'),
          },
          {
            id: '11',
            message: "Your new decision of getting a tattoo on your face is crazy. I'm shocked! 😱",
            mine: false,
            date: moment().subtract(3, 'days'),
          },
          {
            id: '12',
            message: 'Hey, Annie 👋',
            mine: false,
            date: moment().subtract(3, 'days'),
          },
          {
            id: '13',
            message: 'Hey there, Ya, me too 😏',
            mine: false,
            date: moment().subtract(3, 'days'),
          },
          {
            id: '14',
            message: 'Weeelcome 🎉 Happy that you joined NewNew!',
            mine: true,
            date: moment().subtract(3, 'days'),
          },
        ],
        unread: false,
      },
      {
        id: '5',
        time: '2 min',
        userData: {
          userName: 'Cuttie🍰Pie',
          userAlias: 'cuttiepie',
          avatar: '/images/mock/test_user_1.jpg',
          accountDeleted: true,
        },
        messages: [
          {
            id: '1',
            message: "Your new decision of getting a tattoo on your face is crazy. I'm shocked! 😱",
            mine: false,
            date: moment(),
          },
          {
            id: '2',
            message: 'Hiii, Lance 😃',
            mine: true,
            date: moment(),
          },
          {
            id: '3',
            message: 'I don’t beleive...',
            mine: false,
            date: moment(),
          },
          {
            id: '4',
            message: "Your new decision of getting a tattoo on your face is crazy. I'm shocked! 😱",
            mine: false,
            date: moment(),
          },
          {
            id: '5',
            message: 'Hey, Annie 👋',
            mine: false,
            date: moment(),
          },
          {
            id: '6',
            message: 'Hey there, Ya, me too 😏',
            mine: false,
            date: moment().subtract(2, 'days'),
          },
          {
            id: '7',
            message: 'Weeelcome 🎉 Happy that you joined NewNew!',
            mine: true,
            date: moment().subtract(2, 'days'),
          },
          {
            id: '8',
            message: 'Yeah, I know🙈 But I think it’s awesome idea!',
            mine: true,
            date: moment().subtract(3, 'days'),
          },
          {
            id: '9',
            message: 'Hiii, Lance 😃',
            mine: true,
            date: moment().subtract(3, 'days'),
          },
          {
            id: '10',
            message: 'I don’t beleive...',
            mine: false,
            date: moment().subtract(3, 'days'),
          },
          {
            id: '11',
            message: "Your new decision of getting a tattoo on your face is crazy. I'm shocked! 😱",
            mine: false,
            date: moment().subtract(3, 'days'),
          },
          {
            id: '12',
            message: 'Hey, Annie 👋',
            mine: false,
            date: moment().subtract(3, 'days'),
          },
          {
            id: '13',
            message: 'Hey there, Ya, me too 😏',
            mine: false,
            date: moment().subtract(3, 'days'),
          },
          {
            id: '14',
            message: 'Weeelcome 🎉 Happy that you joined NewNew!',
            mine: true,
            date: moment().subtract(3, 'days'),
          },
        ],
        unread: false,
      },
    ],
    []
  );

  /* eslint-disable react-hooks/exhaustive-deps */
  useEffect(() => {
    if (collection && collection.length > 0) {
      openChat({ userData: collection[0].userData, messages: collection[0].messages });
      setActiveChatIndex(collection[0].id);
    }
  }, []);

  interface IItem {
    id: string;
    time: string;
    userData: IUser;
    messages: IMessage[];
    unread: boolean;
    unreadCount?: number;
  }

  const renderChatItem = useCallback(
    (item: IItem, index: number) => {
      const handleItemClick = () => {
        openChat({ userData: item.userData, messages: item.messages });
        setActiveChatIndex(item.id);
      };

      return (
        <SChatItemContainer key={`chat-item-${item.id}`}>
          <SChatItem onClick={handleItemClick} className={activeChatIndex === item.id ? 'active' : ''}>
            <UserAvatar avatarUrl={item.userData.avatar} />
            <SChatItemCenter>
              <SChatItemText variant={3} weight={600}>
                {item.userData.userName}
              </SChatItemText>
              <SChatItemLastMessage variant={3} weight={600}>
                {textTrim(item.messages[0].message)}
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
    [collection.length, user.userData?.avatarUrl, openChat]
  );
  return (
    <>
      <SSectionContent>{collection.length > 0 ? collection.map(renderChatItem) : <EmptyInbox />}</SSectionContent>
    </>
  );
};

export default ChatList;

const SSectionContent = styled.div`
  height: calc(100% - 74px);
  display: flex;
  position: relative;
  overflow-y: auto;
  flex-direction: column;
`;
