import React, { useMemo, useCallback, useEffect } from 'react';
import styled from 'styled-components';
import moment from 'moment';
import Text from '../../atoms/Text';
import Indicator from '../../atoms/Indicator';
import UserAvatar from '../UserAvatar';

import { IChatData, IUser, IMessage } from '../../interfaces/chat';

import { useAppSelector } from '../../../redux-store/store';

interface IFunctionProps {
  openChat: (arg: IChatData) => void;
}

export const ChatList: React.FC<IFunctionProps> = ({ openChat }) => {
  const user = useAppSelector((state) => state.user);
  // const scrollRef: any = useRef();

  const lastMessageTrim = (str: string): string => {
    if (str.length > 35) {
      return `${str.substring(0, 35)} ...`;
    }
    return str;
  };

  const collection = useMemo(
    () => [
      {
        id: '1',
        time: '30 min',
        userData: {
          userName: '🦄Unicornbabe',
          userAlias: 'unicornbabe',
          justSubscribed: false,
          blockedUser: false,
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
        id: '2',
        time: '30 min',
        userData: {
          userName: 'Caramella🍬',
          userAlias: 'caramella',
          justSubscribed: false,
          blockedUser: false,
          avatar: '/images/mock/test_user_2.jpg',
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
        time: '30 min',
        userData: {
          userName: 'Girly👧',
          userAlias: 'girly',
          justSubscribed: true,
          blockedUser: false,
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
          justSubscribed: true,
          blockedUser: false,
          avatar: '/images/mock/test_user_4.jpg',
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
        time: '30 min',
        userData: {
          userName: 'Cuttie🍰Pie',
          userAlias: 'cuttiepie',
          justSubscribed: true,
          blockedUser: false,
          avatar: '/images/mock/test_user_1.jpg',
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
    openChat({ userData: collection[0].userData, messages: collection[0].messages });
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
      };

      return (
        <SChatItemContainer key={`chat-item-${item.id}`}>
          <SChatItem onClick={handleItemClick}>
            <UserAvatar avatarUrl={item.userData.avatar} />
            <SChatItemCenter>
              <SChatItemText variant={3} weight={600}>
                {item.userData.userName}
              </SChatItemText>
              <SChatItemLastMessage variant={3} weight={600}>
                {lastMessageTrim(item.messages[0].message)}
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
      <SSectionContent>{collection.map(renderChatItem)}</SSectionContent>
    </>
  );
};

export default ChatList;

const SSectionContent = styled.div`
  height: 100%;
  display: flex;
  position: relative;
  overflow-y: auto;
  flex-direction: column;
`;

const SChatItem = styled.div`
  cursor: pointer;
  display: flex;
  padding: 12px;
  &:hover {
    background: ${(props) => props.theme.colorsThemed.background.secondary};
    border-radius: ${(props) => props.theme.borderRadius.medium};
  }
`;

const SChatItemCenter = styled.div`
  width: 100%;
  display: flex;
  padding: 2px 12px;
  flex-direction: column;
`;

const SChatItemText = styled(Text)`
  margin-bottom: 4px;
  max-width: 228px;
  overflow: hidden;
`;

const SChatItemLastMessage = styled(Text)`
  white-space: nowrap;
  max-width: 228px;
  color: ${(props) => props.theme.colorsThemed.text.tertiary};
`;

const SChatItemRight = styled.div`
  display: flex;
  padding: 2px 0;
  align-items: flex-end;
  flex-direction: column;
  margin-left: -12px;
`;

const SChatItemTime = styled(Text)`
  color: ${(props) => props.theme.colorsThemed.text.tertiary};
  white-space: nowrap;
  margin-bottom: 4px;
`;

const SChatItemIndicator = styled(Indicator)``;

const SChatSeparator = styled.div`
  border-top: 1px solid ${(props) => props.theme.colorsThemed.background.outlines1};
  margin-left: 72px;
  border-radius: 2px;
  margin-right: 15px;
`;

const SChatItemContainer = styled.div``;
