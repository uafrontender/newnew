/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useState, useMemo, useCallback, useEffect } from 'react';
import dynamic from 'next/dynamic';
import styled, { css } from 'styled-components';
import moment from 'moment';
import { useTranslation } from 'next-i18next';
import { newnewapi } from 'newnew-api';
import { getSubscriptions } from '../../../contexts/subscriptionsContext';

import UserAvatar from '../UserAvatar';
import textTrim from '../../../utils/textTrim';

import { IChatData, IMessage } from '../../interfaces/ichat';

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
  SUserAvatar,
} from '../../atoms/chat/styles';
import randomID from '../../../utils/randomIdGenerator';
import { getMyRooms } from '../../../api/endpoints/chat';

const EmptyInbox = dynamic(() => import('../../atoms/chat/EmptyInbox'));

interface IFunctionProps {
  openChat: (arg: IChatData) => void;
}

export const ChatList: React.FC<IFunctionProps> = ({ openChat }) => {
  const user = useAppSelector((state) => state.user);
  const { t } = useTranslation('chat');
  const [activeChatIndex, setActiveChatIndex] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string>('allUsers');

  const [allUsers, setAllUsers] = useState<newnewapi.IUser[]>([]);

  const [chatRoomsLoading, setChatRoomsLoading] = useState(false);
  const [chatRooms, setChatRooms] = useState<newnewapi.IChatRoom[] | null>(null);
  const [chatRoomsCreators, setChatRoomsCreators] = useState<newnewapi.IChatRoom[]>([]);
  const [chatRoomsSubs, setChatRoomsSubs] = useState<newnewapi.IChatRoom[]>([]);

  const userTypes = useMemo(
    () => [
      {
        id: 'chatRooms',
        title: t('usertypes.all'),
      },
      {
        id: 'chatRoomsSubs',
        title: t('usertypes.subscribers'),
      },
      {
        id: 'chatRoomsCreators',
        title: t('usertypes.subscribing'),
      },
    ],
    [t]
  );

  const { mySubscribers, creatorsImSubscribedTo } = getSubscriptions();

  useEffect(() => {
    async function fetchMyRooms() {
      try {
        const payload = new newnewapi.GetMyRoomsRequest({ paging: { limit: 20 }, roomKind: 1 });
        const res = await getMyRooms(payload);

        if (!res.data || res.error) throw new Error(res.error?.message ?? 'Request failed');
        setChatRooms(res.data.rooms);
        setChatRoomsLoading(false);
      } catch (err) {
        console.error(err);
      }
    }
    if (!chatRooms) {
      setChatRoomsLoading(true);
      fetchMyRooms();
    } else {
      // if (creatorsImSubscribedTo.length > 0 && chatRoomsCreators.length < 1) {
      console.log(creatorsImSubscribedTo);

      // chatRooms.forEach(chat =>{
      //   if (chat.visavis){
      //     console.log(chat.visavis?.uuid);

      //     console.log(creatorsImSubscribedTo.find((cuser) => { cuser.uuid === chat.visavis?.uuid }));

      //     if (creatorsImSubscribedTo.find((cuser) => { cuser.uuid === chat.visavis?.uuid })){
      //       setChatRoomsCreators([...chatRoomsCreators, chat]);
      //     }
      //   }
      // })
      // }

      // if(mySubscribers.length > 0 && chatRoomsSubs.length < 1){
      //   chatRooms.forEach(chat =>{
      //     if (chat.visavis){
      //       if (mySubscribers.find((cuser) => { cuser.uuid === chat.visavis?.uuid })){
      //         setChatRoomsSubs([...chatRoomsSubs, chat])
      //       }
      //     }
      //   })
      // }
    }
  }, [chatRooms, creatorsImSubscribedTo, mySubscribers, chatRoomsCreators.length]);

  useEffect(() => {
    console.log(chatRooms, chatRoomsCreators, chatRoomsSubs);
  }, [chatRooms, chatRoomsCreators, chatRoomsSubs]);
  // useEffect(() => {
  //   setAllUsers([...creatorsImSubscribedTo, ...mySubscribers]);
  // }, [creatorsImSubscribedTo,mySubscribers]);

  // useEffect(() => {
  //   if (allUsers.length > 0 && allUsers[0].uuid) {
  //     openChat({
  //       chatUser: allUsers[0],
  //       showChatList: null,
  //     });
  //     setActiveChatIndex(allUsers[0].uuid);
  //   }
  // }, [allUsers]);

  const collection = useMemo(
    () => [
      {
        id: '0',
        time: '30 min',
        userData: {
          userName: '🦄Unicornbabe',
          userAlias: 'unicornbabe',
          avatar: '/images/mock/test_user_1.jpg',
        },
        messages: [
          {
            id: '1',
            message: 'Yeah, I know🙈 But I think it’s awesome idea!',
            mine: false,
            date: moment(),
          },
          {
            id: '2',
            message: 'Hiii, Lance 😃',
            mine: false,
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
            mine: false,
            date: moment().subtract(2, 'days'),
          },
          {
            id: '8',
            message: 'Yeah, I know🙈 But I think it’s awesome idea!',
            mine: false,
            date: moment().subtract(3, 'days'),
          },
          {
            id: '9',
            message: 'Hiii, Lance 😃',
            mine: false,
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
            mine: false,
            date: moment().subtract(3, 'days'),
          },
          {
            id: '15',
            message: '🦄Unicornbabe created the announcement.\nYou and 499 others joined it',
            mine: false,
            date: moment().subtract(3, 'days'),
          },
        ],
        unread: false,
        isAnnouncement: true,
      },
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
          uuid: '7375607e-3175-4789-a12a-2db3ec60cbf8',
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

  // interface IItem {
  //   id: string;
  //   time: string;
  //   userData: IUser;
  //   messages: IMessage[];
  //   unread: boolean;
  //   unreadCount?: number;
  // }

  const renderChatItem = useCallback(
    (item: newnewapi.IUser, index: number) => {
      const handleItemClick = () => {
        if (item.uuid) {
          openChat({ chatUser: item, showChatList: null });
          setActiveChatIndex(item.uuid);
        }
      };

      return (
        <SChatItemContainer key={randomID()}>
          <SChatItem onClick={handleItemClick} className={activeChatIndex === item.uuid ? 'active' : ''}>
            <SUserAvatar>
              <UserAvatar avatarUrl={item.avatarUrl ? item.avatarUrl : ''} />
            </SUserAvatar>
            <SChatItemCenter>
              <SChatItemText variant={3} weight={600}>
                {item.nickname}
              </SChatItemText>
              {/* <SChatItemLastMessage variant={3} weight={600}>
                {textTrim(item.messages[0].message)}
              </SChatItemLastMessage> */}
            </SChatItemCenter>
            {/* <SChatItemRight>
              <SChatItemTime variant={3} weight={600}>
                {item.time}
              </SChatItemTime>
              {!!item.unread && <SChatItemIndicator counter={item.unreadCount} />}
            </SChatItemRight> */}
          </SChatItem>
          {index !== collection.length - 1 && <SChatSeparator />}
        </SChatItemContainer>
      );
    },
    [collection.length, openChat, activeChatIndex]
  );

  const Tabs = useCallback(
    () => (
      <STabs>
        {userTypes.map((item) => (
          <STab active={activeTab === item.id} key={randomID()} onClick={() => setActiveTab(item.id)}>
            {item.title}
          </STab>
        ))}
      </STabs>
    ),
    [activeTab, userTypes]
  );
  /* eslint-disable no-eval */
  return (
    <>
      <SSectionContent>
        {allUsers.length > 0 ? (
          <>
            {creatorsImSubscribedTo.length > 0 && mySubscribers.length > 0 && <Tabs />}
            {eval(activeTab).map(renderChatItem)}
          </>
        ) : (
          <EmptyInbox />
        )}
      </SSectionContent>
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

const STabs = styled.div`
  display: flex;
  text-align: center;
  align-items: stretch;
  align-content: stretch;
  justify-content: stretch;
  margin-bottom: 16px;
  font-size: 14px;
`;

interface ISTab {
  active: boolean;
}
const STab = styled.div<ISTab>`
  width: calc(100% / 3);
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  ${(props) => {
    if (props.active) {
      return css`
        font-weight: bold;
        position: relative;
        &:after {
          content: '';
          position: absolute;
          bottom: -4px;
          left: 0;
          width: 100%;
          height: 4px;
          background: ${({ theme }) => theme.gradients.blueHorizontal};
          border-top-left-radius: ${({ theme }) => theme.borderRadius.medium};
          border-top-right-radius: ${({ theme }) => theme.borderRadius.medium};
        }
      `;
    }
    return css`
      font-weight: normal;
    `;
  }}
`;
