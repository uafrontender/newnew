/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useState, useMemo, useCallback, useEffect } from 'react';
import dynamic from 'next/dynamic';
import styled, { css, useTheme } from 'styled-components';
import moment from 'moment';
import { useTranslation } from 'next-i18next';
import { newnewapi } from 'newnew-api';
import { toNumber } from 'lodash';
import { useInView } from 'react-intersection-observer';
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
import { getMyRooms, markRoomAsRead } from '../../../api/endpoints/chat';
import { useAppSelector } from '../../../redux-store/store';
import megaphone from '../../../public/images/svg/icons/filled/Megaphone.svg';
import InlineSVG from '../../atoms/InlineSVG';
import { useGetChats } from '../../../contexts/chatContext';

const EmptyInbox = dynamic(() => import('../../atoms/chat/EmptyInbox'));

interface IFunctionProps {
  openChat: (arg: IChatData) => void;
  searchText: string;
}

export const ChatList: React.FC<IFunctionProps> = ({ openChat, searchText }) => {
  const { t } = useTranslation('chat');
  const theme = useTheme();
  const user = useAppSelector((state) => state.user);
  const { unreadCount, unreadCountForCreator, unreadCountForUser } = useGetChats();
  const { ref: scrollRef, inView } = useInView();
  const [activeChatIndex, setActiveChatIndex] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string>('chatRooms');

  const [loadingRooms, setLoadingRooms] = useState<boolean>(false);
  const [chatRooms, setChatRooms] = useState<newnewapi.IChatRoom[] | null>(null);
  const [chatRoomsNextPageToken, setChatRoomsNextPageToken] = useState<string | undefined | null>('');
  const [parsingRooms, setParsingRooms] = useState<boolean | null>(null);
  const [chatRoomsCreators, setChatRoomsCreators] = useState<newnewapi.IChatRoom[]>([]);
  const [chatRoomsSubs, setChatRoomsSubs] = useState<newnewapi.IChatRoom[]>([]);
  const [searchedRooms, setSearchedRooms] = useState<newnewapi.IChatRoom[] | null>(null);
  const [updatedChat, setUpdatedChat] = useState<newnewapi.IChatRoom | null>(null);

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

  const fetchMyRooms = useCallback(
    async (pageToken?: string) => {
      if (loadingRooms) return;
      try {
        if (!pageToken) setChatRooms([]);
        setLoadingRooms(true);
        const payload = new newnewapi.GetMyRoomsRequest({
          paging: {
            limit: 10,
            pageToken,
          },
        });
        const res = await getMyRooms(payload);

        if (!res.data || res.error) throw new Error(res.error?.message ?? 'Request failed');
        if (res.data && res.data.rooms.length > 0) {
          setChatRooms((curr) => {
            const arr = [...curr!!];
            res.data?.rooms.forEach((chat) => {
              const emptyMassUpdateFromCreator = chat.kind === 4 && chat.myRole === 1 && !chat.lastMessage;
              if (!emptyMassUpdateFromCreator) arr.push(chat);
            });
            return arr;
          });
          setChatRoomsNextPageToken(res.data.paging?.nextPageToken);
        }
        if (!res.data.paging?.nextPageToken && chatRoomsNextPageToken) setChatRoomsNextPageToken(null);
        setLoadingRooms(false);
      } catch (err) {
        console.error(err);
        setLoadingRooms(false);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [loadingRooms]
  );

  const fetchLastActiveRoom = async () => {
    try {
      const payload = new newnewapi.GetMyRoomsRequest({
        paging: {
          limit: 1,
        },
      });
      const res = await getMyRooms(payload);

      if (!res.data || res.error) throw new Error(res.error?.message ?? 'Request failed');
      if (res.data && res.data.rooms.length > 0) {
        setUpdatedChat(res.data.rooms[0]);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (!chatRooms) {
      fetchMyRooms();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (chatRooms && !searchedRooms) {
      fetchLastActiveRoom();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [unreadCount, searchedRooms]);

  useEffect(() => {
    if (updatedChat) {
      const isAlreadyAdded = chatRooms?.findIndex((chat) => chat.id === updatedChat.id);
      if (isAlreadyAdded !== undefined) {
        const arr = chatRooms;
        arr?.splice(isAlreadyAdded, 1);
        if (updatedChat.id!!.toString() === activeChatIndex) {
          arr?.splice(0, 0, updatedChat);
        } else {
          arr?.splice(1, 0, updatedChat);
        }
        setChatRooms(arr);
        setUpdatedChat(null);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [updatedChat]);

  useEffect(() => {
    if (inView && !loadingRooms && chatRoomsNextPageToken) {
      fetchMyRooms(chatRoomsNextPageToken);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inView, loadingRooms, chatRoomsNextPageToken]);

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
    if (chatRooms && parsingRooms === null) {
      if (chatRooms[0]) {
        if (activeChatIndex !== chatRooms[0].id!!.toString()) {
          setActiveChatIndex(chatRooms[0].id!!.toString());
          openChat({ chatRoom: chatRooms[0], showChatList: null });
        }

        setParsingRooms(true);
        const subsArr: newnewapi.IChatRoom[] = [];
        const creatorsArr: newnewapi.IChatRoom[] = [];
        chatRooms.forEach((chat) => {
          // I am a creator
          if (chat.myRole === 2) {
            subsArr.push(chat);
          }
          // I am a subscriber
          if (chat.myRole === 1) {
            creatorsArr.push(chat);
          }
        });

        setChatRoomsSubs(subsArr);
        setChatRoomsCreators(creatorsArr);
        setParsingRooms(false);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chatRooms]);

  const isActiveChat = useCallback(
    (chat: newnewapi.IChatRoom) => activeChatIndex === chat.id!!.toString(),
    [activeChatIndex]
  );

  const renderChatItem = useCallback(
    (chat: newnewapi.IChatRoom) => {
      const localChat = chat;
      const handleItemClick = async () => {
        if (searchedRooms) setSearchedRooms(null);
        setActiveChatIndex(chat.id!!.toString());
        openChat({ chatRoom: chat, showChatList: null });
        if (chat.unreadMessageCount) {
          localChat.unreadMessageCount = 0;
          await markChatAsRead(toNumber(chat.id));
        }
        return null;
      };

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

      let lastMsg = chat.lastMessage?.content?.text;

      if (chat.myRole === 2 && !lastMsg) {
        if (chat.kind === 4) {
          lastMsg = textTrim(t('new-announcement.created'));
        } else {
          lastMsg = textTrim(t('chat.no-messages-first-line'));
        }
      }

      const unreadMessageCount =
        localChat.unreadMessageCount && localChat.unreadMessageCount > 0 ? localChat.unreadMessageCount : 0;

      return (
        <SChatItemContainer key={chat.id?.toString()}>
          <SChatItem onClick={handleItemClick} className={isActiveChat(chat) ? 'active' : ''}>
            {avatar}
            <SChatItemCenter>
              <SChatItemText variant={3} weight={600}>
                {chatName}
              </SChatItemText>
              <SChatItemLastMessage variant={3} weight={600}>
                {lastMsg}
              </SChatItemLastMessage>
            </SChatItemCenter>
            <SChatItemRight>
              <SChatItemTime variant={3} weight={600}>
                {chat.updatedAt && moment((chat.updatedAt?.seconds as number) * 1000).fromNow()}
              </SChatItemTime>
              {unreadMessageCount > 0 && <SUnreadCount>{unreadMessageCount}</SUnreadCount>}
            </SChatItemRight>
          </SChatItem>
          <SChatSeparator />
        </SChatItemContainer>
      );
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [activeChatIndex, searchedRooms, chatRooms, updatedChat]
  );

  const unreadCountTab = useCallback(
    (e) => {
      switch (e) {
        case 'chatRooms':
          return unreadCount !== 0 && unreadCount;
        case 'chatRoomsSubs':
          return unreadCountForCreator !== 0 && unreadCountForCreator;
        // chatRoomsCreators
        default:
          return unreadCountForUser !== 0 && unreadCountForUser;
      }
    },
    [unreadCount, unreadCountForUser, unreadCountForCreator]
  );

  const Tabs = useCallback(
    () => (
      <STabs>
        {tabTypes.map((item) => (
          <STab active={activeTab === item.id} key={item.id} onClick={() => setActiveTab(item.id)}>
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
            {chatRoomsNextPageToken && !searchedRooms && <SRef ref={scrollRef}>Loading...</SRef>}
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

const SRef = styled.span`
  text-indent: -9999px;
`;
