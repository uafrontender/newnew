/* eslint-disable no-nested-ternary */
/* eslint-disable no-unused-expressions */
import React, {
  useState,
  useMemo,
  useCallback,
  useEffect,
  useRef,
} from 'react';
import dynamic from 'next/dynamic';
import styled, { css, useTheme } from 'styled-components';
import moment from 'moment';
import { useTranslation } from 'next-i18next';
import { newnewapi } from 'newnew-api';
import { useInView } from 'react-intersection-observer';
import { useEffectOnce, useUpdateEffect } from 'react-use';
import UserAvatar from '../UserAvatar';
import Lottie from '../../atoms/Lottie';
import InlineSVG from '../../atoms/InlineSVG';

import {
  SChatItemContainer,
  SChatItem,
  SChatItemContent,
  SChatItemContentWrapper,
  SChatItemLastMessage,
  SChatItemRight,
  SChatItemTime,
  SChatSeparator,
  SUserAvatar,
} from '../../atoms/chat/styles';
import { getMyRooms, markRoomAsRead } from '../../../api/endpoints/chat';
import { useAppSelector } from '../../../redux-store/store';
import textTrim from '../../../utils/textTrim';
import { IChatData } from '../../interfaces/ichat';
import { useGetChats } from '../../../contexts/chatContext';
import megaphone from '../../../public/images/svg/icons/filled/Megaphone.svg';
import loadingAnimation from '../../../public/animations/logo-loading-blue.json';
import usePageVisibility from '../../../utils/hooks/usePageVisibility';
import isBrowser from '../../../utils/isBrowser';

const ChatName = dynamic(() => import('../../atoms/chat/ChatName'));
const EmptyInbox = dynamic(() => import('../../atoms/chat/EmptyInbox'));
const NoResults = dynamic(() => import('../../atoms/chat/NoResults'));

interface IFunctionProps {
  openChat: (arg: IChatData) => void;
  searchText: string;
  username?: string;
  switchedTab?: () => void;
  newLastMessage?: {
    chatId: number | Long.Long | null | undefined;
  } | null;
}

const ChatList: React.FC<IFunctionProps> = ({
  openChat,
  searchText,
  username,
  switchedTab,
  newLastMessage,
}) => {
  const { t } = useTranslation('page-Chat');
  const theme = useTheme();
  const user = useAppSelector((state) => state.user);
  const { resizeMode } = useAppSelector((state) => state.ui);
  const isMobileOrTablet = [
    'mobile',
    'mobileS',
    'mobileM',
    'mobileL',
    'tablet',
  ].includes(resizeMode);
  const { unreadCountForCreator, unreadCountForUser } = useGetChats();
  const { ref: scrollRef, inView } = useInView();
  const [activeChatIndex, setActiveChatIndex] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string>('chatRoomsSubs');

  const [isInitialLoaded, setIsInitialLoaded] = useState<boolean>(false);
  const [loadingRooms, setLoadingRooms] = useState<boolean>(false);
  const [chatRooms, setChatRooms] = useState<newnewapi.IChatRoom[] | null>(
    null
  );
  const [chatRoomsNextPageToken, setChatRoomsNextPageToken] = useState<
    string | undefined | null
  >('');
  const [chatRoomsCreators, setChatRoomsCreators] = useState<
    newnewapi.IChatRoom[]
  >([]);
  const [chatRoomsSubs, setChatRoomsSubs] = useState<newnewapi.IChatRoom[]>([]);
  const [displayAllRooms, setDisplayAllRooms] = useState(false); // if there are only subs or only creators
  const [searchedRooms, setSearchedRooms] = useState<
    newnewapi.IChatRoom[] | null
  >(null);
  const [updatedChat, setUpdatedChat] = useState<newnewapi.IChatRoom | null>(
    null
  );
  const [prevSearchText, setPrevSearchText] = useState<string>('');
  const [searchedRoomsLoading, setSearchedRoomsLoading] =
    useState<boolean>(false);

  const [updateTimer, setUpdateTimer] = useState<boolean>(false);

  const tabTypes = useMemo(
    () => [
      {
        id: 'chatRoomsSubs',
        title: t('userTypes.subscribers'),
      },
      {
        id: 'chatRoomsCreators',
        title: t('userTypes.subscribing'),
      },
    ],
    [t]
  );

  const elContainer =
    typeof window !== 'undefined' ? document.getElementById('chatlist') : null;

  const markChatAsRead = useCallback(
    async (room: newnewapi.IChatRoom) => {
      try {
        const payload = new newnewapi.MarkRoomAsReadRequest({
          roomId: room.id as number,
        });
        const res = await markRoomAsRead(payload);
        if (!res.data || res.error)
          throw new Error(res.error?.message ?? 'Request failed');

        const tmpArr = room.myRole === 1 ? chatRoomsCreators : chatRoomsSubs;
        const chatIndex = tmpArr.findIndex(
          (item) => (item.id as number) === (room.id as number)
        );

        if (chatIndex > -1) {
          tmpArr[chatIndex].unreadMessageCount = 0;
          room.myRole === 1
            ? setChatRoomsCreators(tmpArr)
            : setChatRoomsSubs(tmpArr);
        }
      } catch (err) {
        console.error(err);
      }
    },
    [chatRoomsCreators, chatRoomsSubs]
  );

  const fetchMyRooms = useCallback(
    async (pageToken?: string) => {
      if (loadingRooms) return;
      try {
        if (!pageToken) setChatRooms([]);
        setLoadingRooms(true);
        const payload = new newnewapi.GetMyRoomsRequest({
          // if I am not creator get only rooms with creators I am subscriber to
          // myRole: user.userData?.options?.isOfferingBundles ? null : 1,
          paging: {
            limit: 50,
            pageToken,
          },
        });
        const res = await getMyRooms(payload);

        if (!res.data || res.error)
          throw new Error(res.error?.message ?? 'Request failed');

        if (res.data && res.data.rooms.length > 0) {
          setChatRooms((curr) => {
            const arr = curr ? [...curr] : [];
            res.data?.rooms.forEach((chat) => {
              if (arr.findIndex((item) => item.id === chat.id) < 0) {
                // exclude empty announcements rooms from creators
                const emptyMassUpdateFromCreator =
                  chat.kind === 4 && chat.myRole === 1 && !chat.lastMessage;
                if (!emptyMassUpdateFromCreator) arr.push(chat);
              }
            });

            return arr;
          });
          // if I am not creator get only rooms with creators I am subscriber to
          if (user.userData?.options?.creatorStatus === 2) {
            if (displayAllRooms) setDisplayAllRooms(false);

            setChatRoomsCreators((curr) => {
              const arr = curr ? [...curr] : [];
              res.data?.rooms.forEach((chat) => {
                if (arr.findIndex((item) => item.id === chat.id) < 0) {
                  const emptyMassUpdateFromCreator =
                    chat.kind === 4 && chat.myRole === 1 && !chat.lastMessage;
                  if (!emptyMassUpdateFromCreator && chat.myRole === 1)
                    arr.push(chat);
                }
              });
              if (arr.length < 1) {
                setDisplayAllRooms(true);
              }
              return arr;
            });

            setChatRoomsSubs((curr) => {
              const arr = curr ? [...curr] : [];
              res.data?.rooms.forEach((chat) => {
                if (
                  chat.myRole === 2 &&
                  arr.findIndex((item) => item.id === chat.id) < 0
                )
                  arr.push(chat);
              });
              if (arr.length < 1) {
                setDisplayAllRooms(true);
              }
              return arr;
            });
          } else {
            setDisplayAllRooms(true);
          }

          setChatRoomsNextPageToken(res.data.paging?.nextPageToken);
        }
        if (!res.data.paging?.nextPageToken && chatRoomsNextPageToken)
          setChatRoomsNextPageToken(null);
        setLoadingRooms(false);
      } catch (err) {
        console.error(err);
        setLoadingRooms(false);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      loadingRooms,
      user.userData?.options?.isOfferingBundles,
      chatRoomsNextPageToken,
      displayAllRooms,
    ]
  );

  const fetchLastActiveRoom = useCallback(async () => {
    try {
      const payload = new newnewapi.GetMyRoomsRequest({
        paging: {
          limit: 1,
        },
      });
      const res = await getMyRooms(payload);

      if (!res.data || res.error)
        throw new Error(res.error?.message ?? 'Request failed');
      if (res.data && res.data.rooms.length > 0) {
        setUpdatedChat(res.data.rooms[0]);
      }
    } catch (err) {
      console.error(err);
    }
  }, []);

  const fetchRoomByUsername = useCallback(
    async (name: string | null, roomKind: number, myRole?: number) => {
      try {
        const payload = new newnewapi.GetMyRoomsRequest({
          searchQuery: name,
          roomKind,
          myRole: myRole || 2,
        });

        const res = await getMyRooms(payload);
        if (!res.data || res.error) {
          throw new Error(res.error?.message ?? 'Request failed');
        }
        if (res.data && res.data.rooms.length > 0) {
          const room = res.data.rooms[0];
          if (room.id && activeChatIndex !== room.id.toString()) {
            setActiveChatIndex(room.id.toString());
          }
          if (name === null && roomKind === 4) {
            setActiveTab('chatRoomsSubs');
            setUpdatedChat(room);
            return room;
          }
          if (room.myRole === 1) {
            setActiveTab('chatRoomsCreators');
          } else {
            setActiveTab('chatRoomsSubs');
          }
          setUpdatedChat(room);
          return room;
        }
      } catch (err) {
        console.error(err);
      }
      return null;
    },
    [activeChatIndex]
  );

  const getRoomByUserName = useCallback(
    (uname: string) => {
      const isComplicatedRequest = uname.split('-');
      if (
        isComplicatedRequest.length > 0 &&
        isComplicatedRequest[isComplicatedRequest.length - 1] === 'announcement'
      ) {
        const isMyAnnouncement =
          isComplicatedRequest[0] === user.userData?.username;
        return fetchRoomByUsername(
          isMyAnnouncement ? null : isComplicatedRequest[0],
          4,
          isMyAnnouncement ? 2 : 1
        );
      }
      if (
        isComplicatedRequest.length > 0 &&
        isComplicatedRequest[isComplicatedRequest.length - 1] === 'cr'
      ) {
        return fetchRoomByUsername(isComplicatedRequest[0], 1, 1);
      }

      return fetchRoomByUsername(uname, 1);
    },
    [user.userData?.username, fetchRoomByUsername]
  );

  useEffectOnce(() => {
    (async () => {
      if (username && username !== '-mobile' && user.userData?.username) {
        const room = await getRoomByUserName(username);
        if (room) {
          openChat({ chatRoom: room, showChatList: null });
        }
      }
      await fetchMyRooms();
      setIsInitialLoaded(true);
    })();
  });

  useUpdateEffect(() => {
    if (username && isInitialLoaded) {
      getRoomByUserName(username);
    }
  }, [username]);

  useUpdateEffect(() => {
    if (newLastMessage) {
      fetchLastActiveRoom();
    }
  }, [newLastMessage]);

  useUpdateEffect(() => {
    if (chatRooms && !searchedRooms) {
      fetchLastActiveRoom();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [unreadCountForCreator, unreadCountForUser]);

  useUpdateEffect(() => {
    if (updatedChat && chatRooms && chatRooms.length > 0) {
      const isChatWithSub = updatedChat.myRole === 2;

      const roomsArray = displayAllRooms
        ? chatRooms
        : isChatWithSub
        ? chatRoomsSubs
        : chatRoomsCreators;

      const isAlreadyAddedIndex = roomsArray.findIndex(
        (chat) => chat.id === updatedChat.id
      );

      if (isAlreadyAddedIndex > -1) {
        roomsArray[isAlreadyAddedIndex] = updatedChat;
        if (
          updatedChat.id?.toString() === activeChatIndex &&
          (updatedChat.unreadMessageCount as number) > 0
        ) {
          markChatAsRead(updatedChat);
        }

        if (displayAllRooms) {
          setChatRooms(roomsArray);
        } else {
          isChatWithSub
            ? setChatRoomsSubs(roomsArray ?? [])
            : setChatRoomsCreators(roomsArray ?? []);
        }
        sortChats();
      } else {
        roomsArray.push(updatedChat);
        if (displayAllRooms) {
          setChatRooms(roomsArray);
        } else {
          isChatWithSub
            ? setChatRoomsSubs(roomsArray ?? [])
            : setChatRoomsCreators(roomsArray ?? []);
        }
      }

      setUpdatedChat(null);
    }
  }, [
    updatedChat,
    displayAllRooms,
    chatRooms,
    chatRoomsSubs,
    chatRoomsCreators,
  ]);

  useUpdateEffect(() => {
    if (inView && !loadingRooms && chatRoomsNextPageToken) {
      fetchMyRooms(chatRoomsNextPageToken);
    }
  }, [inView, loadingRooms, chatRoomsNextPageToken, fetchMyRooms]);

  const searchRoom = useCallback(async (text: string) => {
    try {
      const payload = new newnewapi.GetMyRoomsRequest({
        searchQuery: text,
        roomKind: 1,
        paging: {
          limit: 50,
        },
      });
      const res = await getMyRooms(payload);
      if (!res.data || res.error)
        throw new Error(res.error?.message ?? 'Request failed');

      if (res.data.rooms) {
        // reducer filters rooms if user has
        // two rooms with same visavis (as creator and as subscriber)
        // in this case we display only rooms where current user is subscriber

        const filterArray = res.data.rooms.reduce(
          (accumulator: newnewapi.IChatRoom[], current) => {
            const arrIndex = accumulator.findIndex(
              (element: newnewapi.IChatRoom) =>
                element.visavis?.user?.uuid === current.visavis?.user?.uuid
            );

            if (arrIndex > -1) {
              if (current.myRole === 1) {
                accumulator.splice(arrIndex, 1);
              }
            } else {
              accumulator.push(current);
            }
            return accumulator;
          },
          []
        );

        filterArray.length > 0
          ? setSearchedRooms(filterArray)
          : setSearchedRooms([]);
      }
      setSearchedRoomsLoading(false);
    } catch (err) {
      console.error(err);
      setSearchedRoomsLoading(false);
    }
  }, []);

  useUpdateEffect(() => {
    if (searchText && searchText !== prevSearchText) {
      setPrevSearchText(searchText);
      if (!searchedRoomsLoading) {
        setSearchedRoomsLoading(true);
        searchRoom(searchText);
      }
    }
    if (searchedRooms && !searchText) setSearchedRooms(null);
  }, [searchText, searchedRooms, prevSearchText, searchedRoomsLoading]);

  useEffect(() => {
    if (elContainer && activeChatIndex) {
      const chatEl = document.getElementById(`chatroom-${activeChatIndex}`);
      if (chatEl && chatEl.offsetTop > elContainer.scrollTop) {
        chatEl.scrollIntoView({
          behavior: 'smooth',
          block: 'nearest',
        });
      }
    }
  }, [activeChatIndex, elContainer]);

  const isActiveChat = useCallback(
    (chat: newnewapi.IChatRoom) =>
      chat.id ? activeChatIndex === chat.id.toString() : false,
    [activeChatIndex]
  );

  const handlerActiveTabSwitch = useCallback(
    (tabName: string) => {
      if (activeTab === tabName) return;
      if (!isMobileOrTablet) {
        const chat =
          tabName === 'chatRoomsSubs' ? chatRoomsSubs[0] : chatRoomsCreators[0];
        openChat({ chatRoom: chat, showChatList: null });
        setActiveChatIndex((chat.id as number).toString());
      }
      setActiveTab(tabName);
      if (isMobileOrTablet && switchedTab !== undefined) switchedTab();
    },
    [
      activeTab,
      openChat,
      chatRoomsCreators,
      chatRoomsSubs,
      switchedTab,
      isMobileOrTablet,
    ]
  );

  const sortChats = useCallback(() => {
    const arr =
      activeTab === 'chatRoomsSubs' ? chatRoomsSubs : chatRoomsCreators;
    arr.sort(
      (a, b) =>
        (b.updatedAt?.seconds as number) - (a.updatedAt?.seconds as number)
    );

    activeTab === 'chatRoomsSubs'
      ? setChatRoomsSubs(arr)
      : setChatRoomsCreators(arr);
  }, [activeTab, chatRoomsSubs, chatRoomsCreators]);

  const hasSeparator = useCallback(
    (index: number) => {
      if (!searchedRooms) {
        if (!displayAllRooms) {
          if (
            (activeTab === 'chatRoomsSubs' &&
              chatRoomsSubs.length - 1 !== index) ||
            (activeTab === 'chatRoomsCreators' &&
              chatRoomsCreators.length - 1 !== index)
          )
            return true;
        }
        if (chatRooms && chatRooms.length - 1 !== index) return true;
      }
      if (searchedRooms && searchedRooms.length - 1 !== index) return true;

      return false;
    },
    [
      searchedRooms,
      activeTab,
      displayAllRooms,
      chatRooms,
      chatRoomsCreators,
      chatRoomsSubs,
    ]
  );

  // to update time ago of last message
  const interval = useRef<number>();
  const isPageVisible = usePageVisibility();
  useEffect(() => {
    if (isBrowser() && isPageVisible) {
      interval.current = window.setInterval(() => {
        setUpdateTimer((curr) => !curr);
      }, 60 * 1000);
    }
    return () => clearInterval(interval.current);
  }, [isPageVisible]);

  const renderChatItem = useCallback(
    (chat: newnewapi.IChatRoom, index: number) => {
      const handleItemClick = async () => {
        if (activeChatIndex !== chat?.id?.toString()) {
          if (searchedRooms) setSearchedRooms(null);
          chat.id && setActiveChatIndex((chat.id as number).toString());
          openChat({ chatRoom: chat, showChatList: null });
          if ((chat.unreadMessageCount as number) > 0) {
            await markChatAsRead(chat);
          }
        }
        return null;
      };

      let avatar = (
        <SUserAvatar>
          <UserAvatar avatarUrl={chat.visavis?.user?.avatarUrl ?? ''} />
        </SUserAvatar>
      );

      if (chat.kind === 4) {
        avatar = (
          <SMyAvatarMassupdate>
            <SInlineSVG
              svg={megaphone}
              fill={
                theme.name === 'light'
                  ? theme.colorsThemed.text.secondary
                  : theme.colors.white
              }
              width='26px'
              height='26px'
            />
          </SMyAvatarMassupdate>
        );
      }

      let lastMsg = chat.lastMessage?.content?.text;

      if (!lastMsg) {
        if (chat.kind === 4) {
          lastMsg = textTrim(t('newAnnouncement.created'));
        } else {
          lastMsg = textTrim(t('chat.noMessagesFirstLine'));
        }
      }

      return (
        <SChatItemContainer
          key={chat.id?.toString()}
          id={`chatroom-${chat.id}`}
        >
          <SChatItem
            onClick={handleItemClick}
            className={isActiveChat(chat) && !isMobileOrTablet ? 'active' : ''}
          >
            {avatar}
            <SChatItemContent>
              <SChatItemContentWrapper>
                <ChatName chat={chat} />
                <SChatItemTime variant={3} weight={600}>
                  {moment((chat.updatedAt?.seconds as number) * 1000).fromNow()}
                </SChatItemTime>
              </SChatItemContentWrapper>
              <SChatItemContentWrapper>
                <SChatItemLastMessage variant={3} weight={600}>
                  {textTrim(lastMsg, 28)}
                </SChatItemLastMessage>
                <SChatItemRight>
                  {(chat.unreadMessageCount as number) > 0 && (
                    <SUnreadCount>{chat.unreadMessageCount}</SUnreadCount>
                  )}
                </SChatItemRight>
              </SChatItemContentWrapper>
            </SChatItemContent>
          </SChatItem>
          {hasSeparator(index) && <SChatSeparator />}
        </SChatItemContainer>
      );
    },
    // This hook should fire when updateTimer is changed (unnecessary dependency)
    // Also has following unnecessary deps 'activeTab', 'chatRooms', 'displayAllRooms'
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      searchedRooms,
      chatRooms,
      displayAllRooms,
      activeTab,
      activeChatIndex,
      hasSeparator,
      updateTimer,
      isMobileOrTablet,
      theme,
      t,
      isActiveChat,
      markChatAsRead,
      openChat,
    ]
  );

  const Tabs = useCallback(
    () => (
      <STabs>
        {tabTypes.map((item) => (
          <STab
            active={activeTab === item.id}
            key={item.id}
            onClick={() => handlerActiveTabSwitch(item.id)}
          >
            {item.title}{' '}
            {item.id === 'chatRoomsSubs' && unreadCountForCreator > 0 && (
              <SUnreadCount>{unreadCountForCreator}</SUnreadCount>
            )}
            {item.id === 'chatRoomsCreators' && unreadCountForUser > 0 && (
              <SUnreadCount>{unreadCountForUser}</SUnreadCount>
            )}
          </STab>
        ))}
      </STabs>
    ),
    [
      activeTab,
      tabTypes,
      unreadCountForUser,
      unreadCountForCreator,
      handlerActiveTabSwitch,
    ]
  );

  const whatRoomsToDisplay = useCallback(() => {
    if (searchedRooms) {
      if (searchedRooms.length > 0) return searchedRooms.map(renderChatItem);
      return null;
    }
    if (displayAllRooms && chatRooms) return chatRooms.map(renderChatItem);
    if (activeTab === 'chatRoomsSubs') return chatRoomsSubs.map(renderChatItem);
    return chatRoomsCreators.map(renderChatItem);
  }, [
    searchedRooms,
    displayAllRooms,
    chatRooms,
    activeTab,
    chatRoomsSubs,
    chatRoomsCreators,
    renderChatItem,
  ]);

  return (
    <>
      {isInitialLoaded ? (
        <SSectionContent id='chatlist'>
          {chatRooms && chatRooms.length > 0 ? (
            <>
              {!displayAllRooms && !searchedRooms && <Tabs />}
              {whatRoomsToDisplay() ?? <NoResults text={searchText} />}
              {chatRoomsNextPageToken && !loadingRooms && !searchedRooms && (
                <SRef ref={scrollRef}>Loading...</SRef>
              )}
            </>
          ) : (
            <EmptyInbox />
          )}
        </SSectionContent>
      ) : (
        <Lottie
          width={64}
          height={64}
          options={{
            loop: true,
            autoplay: true,
            animationData: loadingAnimation,
          }}
        />
      )}
    </>
  );
};

export default ChatList;

ChatList.defaultProps = {
  username: '',
  switchedTab: () => {},
};

const SSectionContent = styled.div`
  height: calc(100% - 74px);
  display: flex;
  position: relative;
  overflow-y: auto;
  flex-direction: column;
  /* Hide scrollbar */
  ::-webkit-scrollbar {
    display: none;
  }
  scrollbar-width: none;
  -ms-overflow-style: none;
`;

const STabs = styled.div`
  display: flex;
  text-align: center;
  align-items: stretch;
  place-content: stretch;
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
  width: calc(100% / 2);
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
          background: ${props.theme.name === 'light'
            ? props.theme.gradients.blueHorizontal
            : props.theme.colors.white};
          ${({ theme }) => theme.colors.white};
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
`;

const SRef = styled.span`
  text-indent: -9999px;
  height: 0;
  overflow: hidden;
`;

const SMyAvatarMassupdate = styled.div`
  width: 48px;
  height: 48px;
  flex-shrink: 0;
  border-radius: 16px;
  overflow: hidden;
  background: ${({ theme }) => theme.colorsThemed.background.quinary};
  display: flex;
  align-items: center;
  justify-content: center;
  ${SInlineSVG} {
    margin-right: 0;
  }
`;
