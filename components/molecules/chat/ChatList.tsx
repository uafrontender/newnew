/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-nested-ternary */
/* eslint-disable no-unused-expressions */
import React, { useState, useMemo, useCallback, useEffect } from 'react';
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
  SChatItemText,
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
import VerificationCheckmark from '../../../public/images/svg/icons/filled/Verification.svg';
import loadingAnimation from '../../../public/animations/logo-loading-blue.json';

const EmptyInbox = dynamic(() => import('../../atoms/chat/EmptyInbox'));

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

  const tabTypes = useMemo(
    () => [
      // TODO: integrate with bundles. Need to see chats with bundle owners
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

  // Socket
  async function markChatAsRead(id: number) {
    try {
      const payload = new newnewapi.MarkRoomAsReadRequest({
        roomId: id,
      });
      const res = await markRoomAsRead(payload);
      if (!res.data || res.error)
        throw new Error(res.error?.message ?? 'Request failed');
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
          if (user.userData?.options?.isOfferingBundles) {
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

  const fetchLastActiveRoom = async () => {
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
  };

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

          if (room.id) {
            if (activeChatIndex !== room.id.toString()) {
              setActiveChatIndex(room.id.toString());
            }
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
          isMyAnnouncement ? 2 : undefined
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
      let isAlreadyAdded: number | undefined;
      const isChatWithSub = updatedChat.myRole === 2;

      if (displayAllRooms) {
        isAlreadyAdded = chatRooms.findIndex(
          (chat) => chat.id === updatedChat.id
        );
      } else {
        isChatWithSub
          ? (isAlreadyAdded = chatRoomsSubs?.findIndex(
              (chat) => chat.id === updatedChat.id
            ))
          : (isAlreadyAdded = chatRoomsCreators?.findIndex(
              (chat) => chat.id === updatedChat.id
            ));
      }

      if (isAlreadyAdded !== undefined && isAlreadyAdded > -1) {
        const arr = displayAllRooms
          ? chatRooms
          : isChatWithSub
          ? chatRoomsSubs
          : chatRoomsCreators;

        if (
          arr &&
          updatedChat.id &&
          updatedChat.id.toString() === activeChatIndex
        ) {
          arr[isAlreadyAdded] = updatedChat;
          if (
            updatedChat.unreadMessageCount !== undefined &&
            updatedChat.unreadMessageCount !== null &&
            updatedChat.unreadMessageCount > 0
          ) {
            markChatAsRead(updatedChat.id as number);
          }
        } else {
          arr[isAlreadyAdded] = updatedChat;
        }
        if (displayAllRooms) {
          setChatRooms(arr);
        } else {
          isChatWithSub
            ? setChatRoomsSubs(arr ?? [])
            : setChatRoomsCreators(arr ?? []);
        }
        sortChats();
      } else {
        const arr = displayAllRooms
          ? chatRooms
          : isChatWithSub
          ? chatRoomsSubs
          : chatRoomsCreators;
        arr?.push(updatedChat);

        if (displayAllRooms) {
          setChatRooms(arr);
        } else {
          isChatWithSub
            ? setChatRoomsSubs(arr ?? [])
            : setChatRoomsCreators(arr ?? []);
        }
      }

      setUpdatedChat(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
        const arr = res.data.rooms;

        // reducer filters rooms if user has
        // two rooms with same visavis (as creator and as subscriber)
        // in this case we display only rooms where current user is subscriber

        const filterArray = arr.reduce(
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

        if (filterArray.length > 0) setSearchedRooms(filterArray);
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
        if (tabName === 'chatRoomsSubs') {
          openChat({ chatRoom: chatRoomsSubs[0], showChatList: null });
          setActiveChatIndex(
            chatRoomsSubs[0].id ? chatRoomsSubs[0].id.toString() : null
          );
        } else {
          openChat({ chatRoom: chatRoomsCreators[0], showChatList: null });

          setActiveChatIndex(
            chatRoomsCreators[0].id ? chatRoomsCreators[0].id.toString() : null
          );
        }
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
    if (activeTab === 'chatRoomsSubs') {
      setChatRoomsSubs((curr) => {
        const arr = curr;
        arr.sort(
          (a, b) =>
            (b.updatedAt?.seconds as number) - (a.updatedAt?.seconds as number)
        );
        return arr;
      });
    } else {
      setChatRoomsCreators((curr) => {
        const arr = curr;
        arr.sort(
          (a, b) =>
            (b.updatedAt?.seconds as number) - (a.updatedAt?.seconds as number)
        );
        return arr;
      });
    }
  }, [activeTab]);

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

  const renderChatItem = useCallback(
    (chat: newnewapi.IChatRoom, index: number) => {
      const handleItemClick = async () => {
        if (searchedRooms) setSearchedRooms(null);
        setActiveChatIndex(chat.id ? chat.id.toString() : null);
        openChat({ chatRoom: chat, showChatList: null });
        if (
          chat.unreadMessageCount !== undefined &&
          chat.unreadMessageCount !== null &&
          chat.unreadMessageCount > 0
        ) {
          await markChatAsRead(chat.id as number);
        }
        return null;
      };

      let avatar = (
        <SUserAvatar>
          <UserAvatar avatarUrl={chat.visavis?.user?.avatarUrl ?? ''} />
        </SUserAvatar>
      );
      let chatName = chat.visavis?.user?.nickname
        ? chat.visavis?.user?.nickname
        : chat.visavis?.user?.username;

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

        if (chat.myRole === 2) {
          chatName = t('announcement.title', {
            username: user.userData?.nickname || user.userData?.username,
          });
        } else {
          chatName = t('announcement.title', {
            username:
              chat.visavis?.user?.nickname || chat.visavis?.user?.username,
          });
        }
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
            className={isActiveChat(chat) ? 'active' : ''}
          >
            {avatar}
            <SChatItemContent>
              <SChatItemContentWrapper>
                <SChatItemText variant={3} weight={600}>
                  {chatName}
                  {chat.visavis?.user?.options?.isVerified &&
                    chat.kind !== 4 && (
                      <SInlineSVG
                        svg={VerificationCheckmark}
                        width='16px'
                        height='16px'
                        fill='none'
                      />
                    )}
                </SChatItemText>
                <SChatItemTime variant={3} weight={600}>
                  {chat.updatedAt &&
                    moment(
                      (chat.updatedAt?.seconds as number) * 1000
                    ).fromNow()}
                </SChatItemTime>
              </SChatItemContentWrapper>
              <SChatItemContentWrapper>
                <SChatItemLastMessage variant={3} weight={600}>
                  {chat.lastMessage?.content?.text
                    ? textTrim(lastMsg as string, 28)
                    : lastMsg}
                </SChatItemLastMessage>
                <SChatItemRight>
                  {chat.unreadMessageCount !== undefined &&
                    chat.unreadMessageCount !== null &&
                    chat.unreadMessageCount > 0 && (
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      searchedRooms,
      chatRooms,
      displayAllRooms,
      activeTab,
      activeChatIndex,
      sortChats,
      hasSeparator,
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

  return (
    <>
      {isInitialLoaded ? (
        <SSectionContent id='chatlist'>
          {chatRooms && chatRooms.length > 0 ? (
            <>
              {!displayAllRooms && !searchedRooms && <Tabs />}
              {!searchedRooms
                ? !displayAllRooms
                  ? activeTab === 'chatRoomsSubs'
                    ? chatRoomsSubs.map(renderChatItem)
                    : chatRoomsCreators.map(renderChatItem)
                  : chatRooms.map(renderChatItem)
                : searchedRooms.map(renderChatItem)}
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
  margin-right: 14px;
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
