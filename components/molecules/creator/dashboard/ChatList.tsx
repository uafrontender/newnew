/* eslint-disable no-unsafe-optional-chaining */
import React, { useCallback, useState, useEffect } from 'react';
import styled, { useTheme } from 'styled-components';
import { newnewapi } from 'newnew-api';
import { useRouter } from 'next/router';
import { useInView } from 'react-intersection-observer';
import { useTranslation } from 'next-i18next';
import moment from 'moment';
import { SUserAvatar } from '../../../atoms/chat/styles';

import Text from '../../../atoms/Text';
import UserAvatar from '../../UserAvatar';

import { useAppSelector } from '../../../../redux-store/store';
import { getMyRooms } from '../../../../api/endpoints/chat';
import { useGetChats } from '../../../../contexts/chatContext';
import textTrim from '../../../../utils/textTrim';
import InlineSVG from '../../../atoms/InlineSVG';
import megaphone from '../../../../public/images/svg/icons/filled/Megaphone.svg';

export const ChatList = () => {
  const { t } = useTranslation('page-Creator');
  const theme = useTheme();
  const router = useRouter();
  const user = useAppSelector((state) => state.user);
  const { unreadCountForCreator } = useGetChats();
  const { ref: scrollRef, inView } = useInView();

  const [loadingRooms, setLoadingRooms] = useState<boolean>(false);
  const [chatRooms, setChatRooms] =
    useState<newnewapi.IChatRoom[] | null>(null);
  const [chatRoomsNextPageToken, setChatRoomsNextPageToken] =
    useState<string | undefined | null>('');
  const [searchedRooms, setSearchedRooms] =
    useState<newnewapi.IChatRoom[] | null>(null);
  const [updatedChat, setUpdatedChat] =
    useState<newnewapi.IChatRoom | null>(null);

  const fetchMyRooms = useCallback(
    async (pageToken?: string) => {
      if (loadingRooms) return;
      try {
        if (!pageToken) setChatRooms([]);
        setLoadingRooms(true);
        const payload = new newnewapi.GetMyRoomsRequest({
          myRole: 2,
          paging: {
            limit: 10,
            pageToken,
          },
        });
        const res = await getMyRooms(payload);

        if (!res.data || res.error)
          throw new Error(res.error?.message ?? 'Request failed');
        if (res.data?.rooms.length > 0) {
          setChatRooms((curr) => {
            const arr =
              curr && res?.data?.rooms ? [...curr, ...res.data.rooms] : [];
            return arr;
          });
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
    [loadingRooms]
  );

  const fetchLastActiveRoom = async () => {
    try {
      const payload = new newnewapi.GetMyRoomsRequest({
        myRole: 2,
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
  }, [unreadCountForCreator, searchedRooms]);

  useEffect(() => {
    if (updatedChat) {
      const isAlreadyAdded = chatRooms?.findIndex(
        (chat) => chat.id === updatedChat.id
      );
      if (isAlreadyAdded !== undefined) {
        const arr = chatRooms;
        arr?.splice(isAlreadyAdded, 1);
        arr?.splice(0, 0, updatedChat);
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

  // useEffect(() => {
  //   if (searchText) {
  //     if (chatRooms) {
  //       setSearchedRooms(null);
  //       const arr = [] as newnewapi.IChatRoom[];
  //       chatRooms.forEach((chat) => {
  //         if (chat.visavis?.nickname?.startsWith(searchText) || chat.visavis?.username?.startsWith(searchText)) {
  //           arr.push(chat);
  //         }
  //       });
  //       setSearchedRooms(arr);
  //     }
  //   } else {
  //     setSearchedRooms(null);
  //   }
  // }, [searchText, chatRooms, searchedRooms]);

  const renderChatItem = useCallback(
    (chat: newnewapi.IChatRoom) => {
      const handleItemClick = async () => {
        if (searchedRooms) setSearchedRooms(null);

        router.push(`/creator/dashboard?tab=direct-messages&roomID=${chat.id}`);
        return null;
      };

      let avatar = (
        <SUserAvatar>
          <UserAvatar avatarUrl={chat.visavis?.avatarUrl ?? ''} />
        </SUserAvatar>
      );
      let chatName = chat.visavis?.nickname
        ? chat.visavis?.nickname
        : chat.visavis?.username;

      if (chat.kind === 4 && chat.myRole === 2) {
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
        chatName = t('announcement.title', {
          username: user.userData?.nickname
            ? user.userData?.nickname
            : user.userData?.username,
        });
      }
      if (chat.kind === 4 && chat.myRole === 1) {
        chatName = t('announcement.title', {
          username: chat.visavis?.nickname
            ? chat.visavis?.nickname
            : chat.visavis?.username,
        });
      }

      let lastMsg = chat.lastMessage?.content?.text;

      if (!lastMsg) {
        if (chat.kind === 4) {
          lastMsg = textTrim(t('newAnnouncement.created'));
        } else {
          lastMsg = textTrim(t('chat.noMessagesFirstLine'));
        }
      }

      const unreadMessageCount =
        chat.unreadMessageCount && chat.unreadMessageCount > 0
          ? chat.unreadMessageCount
          : 0;

      return (
        <SChatItemContainer key={chat.id?.toString()}>
          <SChatItem onClick={handleItemClick}>
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
                {chat.updatedAt &&
                  moment((chat.updatedAt?.seconds as number) * 1000).fromNow()}
              </SChatItemTime>
              {unreadMessageCount > 0 && (
                <SUnreadCount>{unreadMessageCount}</SUnreadCount>
              )}
            </SChatItemRight>
          </SChatItem>
          <SChatSeparator />
        </SChatItemContainer>
      );
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [searchedRooms, chatRooms, updatedChat, router, t]
  );

  // const { showTopGradient, showBottomGradient } = useScrollGradients(scrollRef);

  return (
    <>
      {chatRooms && (
        <>
          <SSectionContent>{chatRooms.map(renderChatItem)}</SSectionContent>
          {chatRoomsNextPageToken && !searchedRooms && (
            <SRef ref={scrollRef}>Loading...</SRef>
          )}
        </>
      )}
      {/* <GradientMask positionTop active={showTopGradient} />
      <GradientMask active={showBottomGradient} /> */}
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
  // Scrollbar
  &::-webkit-scrollbar {
    width: 4px;
  }
  scrollbar-width: none;
  &::-webkit-scrollbar-track {
    background: transparent;
    border-radius: 4px;
    transition: 0.2s linear;
  }
  &::-webkit-scrollbar-thumb {
    background: transparent;
    border-radius: 4px;
    transition: 0.2s linear;
  }

  &:hover {
    scrollbar-width: thin;
    &::-webkit-scrollbar-track {
      background: ${({ theme }) => theme.colorsThemed.background.outlines1};
    }

    &::-webkit-scrollbar-thumb {
      background: ${({ theme }) => theme.colorsThemed.background.outlines2};
    }
  }
`;

const SChatItem = styled.div`
  cursor: pointer;
  display: flex;
  padding: 8px 0;
`;

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

const SChatSeparator = styled.div`
  border: 1px solid ${(props) => props.theme.colorsThemed.background.outlines1};
  margin-left: 60px;
  border-radius: 2px;
`;

const SChatItemContainer = styled.div``;

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
const SRef = styled.span`
  text-indent: -9999px;
  height: 0;
  overflow: hidden;
`;
const SInlineSVG = styled(InlineSVG)`
  min-width: 24px;
  min-height: 24px;
  margin-right: 14px;
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
