/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useState, useMemo, useCallback, useEffect, useContext } from 'react';
import dynamic from 'next/dynamic';
import styled, { css, useTheme } from 'styled-components';
import moment from 'moment';
import { useTranslation } from 'next-i18next';
import { newnewapi } from 'newnew-api';
import { toNumber } from 'lodash';

import UserAvatar from '../UserAvatar';
import textTrim from '../../../utils/textTrim';

import { IChatData } from '../../interfaces/ichat';

import {
  SChatItemContainer,
  SChatItem,
  SChatItemCenter,
  SChatItemText,
  SChatItemLastMessage,
  SChatItemRight,
  SChatItemTime,
  SChatSeparator,
  SUserAvatar,
} from '../../atoms/chat/styles';
import randomID from '../../../utils/randomIdGenerator';
import { getMyRooms, markRoomAsRead } from '../../../api/endpoints/chat';
import { SocketContext } from '../../../contexts/socketContext';
import { ChannelsContext } from '../../../contexts/channelsContext';
import { useGetSubscriptions } from '../../../contexts/subscriptionsContext';
import { useAppSelector } from '../../../redux-store/store';
import megaphone from '../../../public/images/svg/icons/filled/Megaphone.svg';
import InlineSVG from '../../atoms/InlineSVG';

const EmptyInbox = dynamic(() => import('../../atoms/chat/EmptyInbox'));

interface IFunctionProps {
  openChat: (arg: IChatData) => void;
  gotNewMessage: (newMessage: newnewapi.IChatMessage | null | undefined) => void;
  searchText: string;
}

interface IUnreadChatRoom {
  id: number;
  count: number;
}

export const ChatList: React.FC<IFunctionProps> = ({ openChat, gotNewMessage, searchText }) => {
  const { t } = useTranslation('chat');
  const theme = useTheme();
  const user = useAppSelector((state) => state.user);
  const { newSubscriber } = useGetSubscriptions();
  const [activeChatIndex, setActiveChatIndex] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string>('chatRooms');

  const [loadingRooms, setLoadingRooms] = useState<boolean>(false);
  const [chatRooms, setChatRooms] = useState<newnewapi.IChatRoom[] | null>(null);
  const [parsingRooms, setParsingRooms] = useState<boolean | null>(null);
  const [chatRoomsCreators, setChatRoomsCreators] = useState<newnewapi.IChatRoom[]>([]);
  const [chatRoomsSubs, setChatRoomsSubs] = useState<newnewapi.IChatRoom[]>([]);

  const [searchedRooms, setSearchedRooms] = useState<newnewapi.IChatRoom[] | null>(null);

  const [unreadChatRooms, setUnreadChatRooms] = useState<IUnreadChatRoom[]>([]);
  const [chatRoomsUnreadCount, setChatRoomsUnreadCount] = useState<number>(0);
  const [chatRoomsCreatorsUnreadCount, setChatRoomsCreatorsUnreadCount] = useState<number>(0);
  const [chatRoomsSubsUnreadCount, setChatRoomsSubsUnreadCount] = useState<number>(0);

  const [newSubscriberLocal, setNewSubscriberLocal] = useState<newnewapi.ICreatorSubscriptionChanged>({});

  const tabTypes = useMemo(
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

  // Socket
  const socketConnection = useContext(SocketContext);
  const { addChannel, removeChannel } = useContext(ChannelsContext);

  async function markChatAsRead(id: number) {
    try {
      const payload = new newnewapi.MarkRoomAsReadRequest({
        roomId: id,
      });
      const res = await markRoomAsRead(payload);
      if (!res.data || res.error) throw new Error(res.error?.message ?? 'Request failed');
    } catch (err) {
      console.error(err);
    }
  }

  useEffect(() => {
    async function fetchMyRooms() {
      try {
        setLoadingRooms(true);
        const payload = new newnewapi.GetMyRoomsRequest({ paging: { limit: 20 } });
        const res = await getMyRooms(payload);
        if (!res.data || res.error) throw new Error(res.error?.message ?? 'Request failed');
        setChatRooms(res.data.rooms);
        console.log(res.data.rooms);

        setLoadingRooms(false);
      } catch (err) {
        console.error(err);
        setLoadingRooms(false);
      }
    }
    if (!chatRooms && !loadingRooms) {
      fetchMyRooms();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Cleanup
  useEffect(() => () => {
    if (chatRooms) {
      chatRooms.forEach((chat) => {
        if (chat.id) removeChannel(`chat_${chat.id.toString()}`);
      });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chatRooms]);

  useEffect(() => {
    if (searchText) {
      if (chatRooms) {
        setSearchedRooms(null);
        const arr = [] as newnewapi.IChatRoom[];
        chatRooms.forEach((chat) => {
          if (chat.visavis?.nickname?.startsWith(searchText) || chat.visavis?.username?.startsWith(searchText)) {
            arr.push(chat);
          }
        });
        setSearchedRooms(arr);
      }
    } else {
      setSearchedRooms(null);
    }
  }, [searchText, chatRooms, searchedRooms]);

  useEffect(() => {
    if (chatRooms && parsingRooms === null && socketConnection) {
      if (chatRooms[0]) {
        setActiveChatIndex(chatRooms[0].id!!.toString());

        setParsingRooms(true);
        const subsArr: newnewapi.IChatRoom[] = [];
        const creatorsArr: newnewapi.IChatRoom[] = [];
        const unreadChats: IUnreadChatRoom[] = [];
        let unreadCount = chatRoomsUnreadCount;
        let unreadCreatorsCount = chatRoomsCreatorsUnreadCount;
        let unreadSubsCount = chatRoomsSubsUnreadCount;

        chatRooms.forEach((chat, index) => {
          if (chat.unreadMessageCount) {
            if (index !== 0) {
              unreadCount += chat.unreadMessageCount;
              unreadChats.push({
                id: toNumber(chat.id),
                count: chat.unreadMessageCount,
              });
            } else {
              markChatAsRead(toNumber(chat.id));
            }
          }
          if (chat.id) {
            addChannel(`chat_${chat.id.toString()}`, {
              chatRoomUpdates: {
                chatRoomId: chat.id,
              },
            });
          }

          // I am a creator
          if (chat.myRole === 2) {
            subsArr.push(chat);
            if (index !== 0 && !!chat.unreadMessageCount) unreadSubsCount += chat.unreadMessageCount;
          }
          // I am a subscriber
          if (chat.myRole === 1) {
            if (index !== 0 && !!chat.unreadMessageCount) unreadCreatorsCount += chat.unreadMessageCount;
            creatorsArr.push(chat);
          }
        });

        openChat({ chatRoom: chatRooms[0], showChatList: null });
        setChatRoomsUnreadCount(unreadCount);
        setChatRoomsCreatorsUnreadCount(unreadCreatorsCount);
        setChatRoomsSubsUnreadCount(unreadSubsCount);

        setUnreadChatRooms(unreadChats);
        setChatRoomsSubs(subsArr);
        setChatRoomsCreators(creatorsArr);
        setParsingRooms(false);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chatRooms, socketConnection, addChannel]);

  useEffect(() => {
    const socketHandlerMessageCreated = (data: any) => {
      const arr = new Uint8Array(data);
      const decoded = newnewapi.ChatMessageCreated.decode(arr);
      if (decoded) {
        const senderId = decoded.newMessage?.sender?.uuid;
        const roomId = decoded.newMessage?.roomId!!.toString();
        if (roomId === activeChatIndex) {
          gotNewMessage(decoded.newMessage);
        } else {
          /*
           * update counts of unread messages in not opened rooms
           * and update count of unread messages in tabs headers
           */
          /* eslint-disable no-lonely-if */
          if (senderId !== user.userData?.userUuid) {
            const unreadTemp = [...unreadChatRooms];
            const isUnreadMessages = unreadTemp.findIndex((item) => item.id === toNumber(decoded.roomId));

            if (isUnreadMessages > -1) {
              unreadTemp[isUnreadMessages].count += 1;
            } else {
              unreadTemp.push({ id: toNumber(decoded.roomId), count: 1 });
            }

            setChatRoomsUnreadCount((prevQty) => prevQty + 1);
            setUnreadChatRooms([...unreadTemp]);

            const isMessageFromCreator = chatRoomsCreators.findIndex((item) => item.id === toNumber(decoded.roomId));

            if (isMessageFromCreator > -1) {
              setChatRoomsCreatorsUnreadCount((prevQty) => prevQty + 1);
            } else {
              setChatRoomsSubsUnreadCount((prevQty) => prevQty + 1);
            }
          }
        }
      }
    };
    if (socketConnection && activeChatIndex) {
      socketConnection.on('ChatMessageCreated', socketHandlerMessageCreated);
    }

    return () => {
      if (socketConnection && socketConnection.connected) {
        socketConnection.off('ChatMessageCreated', socketHandlerMessageCreated);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [socketConnection, activeChatIndex, unreadChatRooms]);

  // observe messages from new subscribers
  useEffect(() => {
    if (newSubscriber !== newSubscriberLocal && socketConnection) {
      setNewSubscriberLocal(newSubscriber);
      if (newSubscriber.status?.oneToOneChatRoomId)
        addChannel(`chat_${newSubscriber.status?.oneToOneChatRoomId.toString()}`, {
          chatRoomUpdates: {
            chatRoomId: newSubscriber.status?.oneToOneChatRoomId,
          },
        });
      if (newSubscriber.status?.massUpdateChatRoomId)
        addChannel(`chat_${newSubscriber.status?.massUpdateChatRoomId.toString()}`, {
          chatRoomUpdates: {
            chatRoomId: newSubscriber.status?.massUpdateChatRoomId,
          },
        });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [newSubscriber]);

  const isActiveChat = useCallback(
    (chat: newnewapi.IChatRoom) => activeChatIndex === chat.id!!.toString(),
    [activeChatIndex]
  );

  const renderChatItem = useCallback(
    (chat: newnewapi.IChatRoom) => {
      const handleItemClick = async () => {
        if (searchedRooms) setSearchedRooms(null);
        setActiveChatIndex(chat.id!!.toString());
        openChat({ chatRoom: chat, showChatList: null });
        const unreadChat = unreadChatRooms.find((i) => toNumber(chat.id) === i.id);
        if (unreadChat) {
          await markChatAsRead(toNumber(chat.id));

          setUnreadChatRooms(unreadChatRooms.filter((item) => item.id !== chat.id));
          setChatRoomsUnreadCount((val) => val - unreadChat.count);

          switch (chat.myRole) {
            // I am a creator
            case 2: {
              return setChatRoomsSubsUnreadCount((val) => val - unreadChat.count);
            }
            // I am a subscriber
            default: {
              return setChatRoomsCreatorsUnreadCount((val) => val - unreadChat.count);
            }
          }
        }
        return null;
      };

      const emptyMassUpdateFromCreator = chat.kind === 4 && chat.myRole === 1 && !chat.lastMessage;
      let avatar = (
        <SUserAvatar>
          <UserAvatar avatarUrl={chat.visavis?.avatarUrl ? chat.visavis?.avatarUrl : ''} />
        </SUserAvatar>
      );
      let chatName = chat.visavis?.nickname ? chat.visavis?.nickname : chat.visavis?.username;

      if (chat.kind === 4 && chat.myRole === 2) {
        avatar = (
          <SMyAvatar>
            <SUserAvatar>
              <UserAvatar avatarUrl={user.userData?.avatarUrl!!} />
            </SUserAvatar>
            <SInlineSVG
              svg={megaphone}
              fill={theme.name === 'light' ? theme.colors.black : theme.colors.white}
              width="26px"
              height="26px"
            />
          </SMyAvatar>
        );
        chatName = `${user.userData?.nickname ? user.userData?.nickname : user.userData?.username} ${t(
          'announcement.title'
        )}`;
      }
      if (chat.kind === 4 && chat.myRole === 1) {
        chatName = `${chat.visavis?.nickname ? chat.visavis?.nickname : chat.visavis?.username} ${t(
          'announcement.title'
        )}`;
      }

      return (
        !emptyMassUpdateFromCreator && (
          <SChatItemContainer key={randomID()}>
            <SChatItem onClick={handleItemClick} className={isActiveChat(chat) ? 'active' : ''}>
              {avatar}
              <SChatItemCenter>
                <SChatItemText variant={3} weight={600}>
                  {chatName}
                </SChatItemText>
                <SChatItemLastMessage variant={3} weight={600}>
                  {
                    // eslint-disable-next-line no-nested-ternary
                    !chat.lastMessage?.content?.text
                      ? chat.kind === 4 && chat.myRole === 2
                        ? textTrim(t('new-announcement.created'))
                        : textTrim(t('chat.default-first-message'))
                      : textTrim(chat.lastMessage.content?.text)
                  }
                </SChatItemLastMessage>
              </SChatItemCenter>
              <SChatItemRight>
                <SChatItemTime variant={3} weight={600}>
                  {chat.updatedAt && moment((chat.updatedAt?.seconds as number) * 1000).fromNow()}
                </SChatItemTime>
                {unreadChatRooms.find((i) => toNumber(chat.id) === i.id) && (
                  <SUnreadCount>{unreadChatRooms.find((i) => toNumber(chat.id) === i.id)?.count}</SUnreadCount>
                )}
              </SChatItemRight>
            </SChatItem>
            <SChatSeparator />
          </SChatItemContainer>
        )
      );
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      activeChatIndex,
      chatRoomsUnreadCount,
      chatRoomsCreatorsUnreadCount,
      chatRoomsSubsUnreadCount,
      unreadChatRooms,
      searchedRooms,
    ]
  );

  const unreadCountTab = useCallback(
    (e) => {
      switch (e) {
        case 'chatRooms':
          return chatRoomsUnreadCount !== 0 && chatRoomsUnreadCount;
        case 'chatRoomsSubs':
          return chatRoomsSubsUnreadCount !== 0 && chatRoomsSubsUnreadCount;
        // chatRoomsCreators
        default:
          return chatRoomsCreatorsUnreadCount !== 0 && chatRoomsCreatorsUnreadCount;
      }
    },
    [chatRoomsUnreadCount, chatRoomsCreatorsUnreadCount, chatRoomsSubsUnreadCount]
  );

  const Tabs = useCallback(
    () => (
      <STabs>
        {tabTypes.map((item) => (
          <STab active={activeTab === item.id} key={randomID()} onClick={() => setActiveTab(item.id)}>
            {item.title} {unreadCountTab(item.id) && <SUnreadCount>{unreadCountTab(item.id)}</SUnreadCount>}
          </STab>
        ))}
      </STabs>
    ),
    [activeTab, tabTypes, unreadCountTab]
  );
  /* eslint-disable no-eval */
  return (
    <>
      <SSectionContent>
        {chatRooms && chatRooms.length > 0 ? (
          <>
            {chatRoomsCreators.length > 0 && chatRoomsSubs.length > 0 && !searchedRooms && <Tabs />}
            {!searchedRooms ? eval(activeTab).map(renderChatItem) : searchedRooms.map(renderChatItem)}
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

const SUnreadCount = styled.span`
  background: ${({ theme }) => theme.colorsThemed.accent.pink};
  border-radius: 50%;
  color: ${({ theme }) => theme.colors.white};
  padding: 0 6px;
  min-width: 20px;
  text-align: center;
  line-height: 20px;
  font-weight: 700;
  font-size: 10px;
  margin-left: 6px;
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

const SInlineSVG = styled(InlineSVG)`
  min-width: 24px;
  min-height: 24px;
  margin-right: 14px;
`;

const SMyAvatar = styled.div`
  position: relative;
  height: 48px;
  ${SInlineSVG} {
    margin-right: 0;
    position: absolute;
    left: calc(50% - 13px);
    top: calc(50% - 13px);
  }
  ${SUserAvatar} {
    opacity: ${(props) => (props.theme.name === 'light' ? '1' : '0.5')};
  }
`;
