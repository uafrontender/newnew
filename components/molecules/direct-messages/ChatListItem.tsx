import React, { useCallback, useEffect, useMemo } from 'react';
import { newnewapi } from 'newnew-api';
import moment from 'moment';
import dynamic from 'next/dynamic';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'next/router';
import {
  SChatItem,
  SChatItemContent,
  SChatItemContentWrapper,
  SChatItemLastMessage,
  SChatItemRight,
  SChatItemTime,
  SUserAvatar,
  SUnreadCount,
} from '../../atoms/direct-messages/styles';
import UserAvatar from '../UserAvatar';
import textTrim from '../../../utils/textTrim';
import ChatName from '../../atoms/direct-messages/ChatName';
import { useAppSelector } from '../../../redux-store/store';
import { useGetChats } from '../../../contexts/chatContext';
import { markRoomAsRead } from '../../../api/endpoints/chat';
import { Mixpanel } from '../../../utils/mixpanel';
import { useAppState } from '../../../contexts/appStateContext';

const MyAvatarMassupdate = dynamic(
  () => import('../../atoms/direct-messages/MyAvatarMassupdate')
);

interface IFunctionProps {
  chatRoom: newnewapi.IChatRoom;
}

const ChatlistItem: React.FC<IFunctionProps> = ({ chatRoom }) => {
  const { t } = useTranslation('page-Chat');
  const { resizeMode } = useAppState();
  const router = useRouter();
  const isMobileOrTablet = [
    'mobile',
    'mobileS',
    'mobileM',
    'mobileL',
    'tablet',
  ].includes(resizeMode);

  const {
    activeChatRoom,
    setActiveChatRoom,
    activeTab,
    setSearchChatroom,
    setHiddenMessagesArea,
  } = useGetChats();

  const user = useAppSelector((state) => state.user);
  const isActiveChat = useCallback(
    (chat: newnewapi.IChatRoom) => {
      if (
        !isMobileOrTablet &&
        activeChatRoom &&
        activeChatRoom.id &&
        chat.id === activeChatRoom.id
      ) {
        return true;
      }
      return false;
    },
    [activeChatRoom, isMobileOrTablet]
  );

  const isDashboard = useMemo(() => {
    if (
      router.asPath.includes('/creator/dashboard?tab=chat') ||
      router.asPath.includes('/creator/bundles?tab=chat')
    ) {
      return true;
    }
    return false;
  }, [router.asPath]);

  const chatRoute = useMemo(() => {
    let route = `/direct-messages/${
      chatRoom.visavis?.user?.username || user.userData?.username
    }`;
    if (chatRoom.kind === newnewapi.ChatRoom.Kind.CREATOR_MASS_UPDATE) {
      route += '-announcement';
      return route;
    }
    if (activeTab && chatRoom.myRole === newnewapi.ChatRoom.MyRole.CREATOR) {
      route += '-bundle';
    }
    return route;
  }, [chatRoom, activeTab, user.userData?.username]);

  const markAsRead = useCallback(async () => {
    try {
      const payload = new newnewapi.MarkRoomAsReadRequest({
        roomId: chatRoom.id as number,
      });
      const res = await markRoomAsRead(payload);

      if (!res.data || res.error) {
        throw new Error(res.error?.message ?? 'Request failed');
      }
    } catch (err) {
      console.error(err);
    }
  }, [chatRoom]);

  useEffect(() => {
    if (
      chatRoom.unreadMessageCount &&
      chatRoom.unreadMessageCount > 0 &&
      activeChatRoom?.id === chatRoom.id
    ) {
      markAsRead();
    }
  }, [chatRoom, activeChatRoom, markAsRead]);

  const handleItemClick = useCallback(async () => {
    Mixpanel.track('Chat Item Clicked', {
      _stage: 'Direct Messages',
      _component: 'ChatListItem',
      _isDashboard: isDashboard,
      // eslint-disable-next-line no-nested-ternary
      ...(!isDashboard
        ? {
            _target: chatRoute,
          }
        : router.asPath.includes('/creator/bundles')
        ? {
            _target: `/creator/bundles?tab=direct-messages&roomID=${chatRoom.id?.toString()}`,
            _activeChatRoom: chatRoom,
          }
        : {
            _target: `/creator/dashboard?tab=direct-messages&roomID=${chatRoom.id?.toString()}`,
            _activeChatRoom: chatRoom,
          }),
    });

    if (!isDashboard) {
      router.push(chatRoute);
      return;
    }

    if (router.asPath.includes('/creator/bundles')) {
      router.push(
        `/creator/bundles?tab=direct-messages&roomID=${chatRoom.id?.toString()}`
      );
    }

    if (router.asPath.includes('/creator/dashboard')) {
      router.push(
        `/creator/dashboard?tab=direct-messages&roomID=${chatRoom.id?.toString()}`
      );
    }

    setActiveChatRoom(chatRoom);
    if (isMobileOrTablet) {
      setHiddenMessagesArea(false);
    }
    setSearchChatroom('');
  }, [
    chatRoom,
    chatRoute,
    isDashboard,
    router,
    isMobileOrTablet,
    setActiveChatRoom,
    setSearchChatroom,
    setHiddenMessagesArea,
  ]);

  let avatar = (
    <SUserAvatar>
      <UserAvatar avatarUrl={chatRoom.visavis?.user?.avatarUrl ?? ''} />
    </SUserAvatar>
  );

  if (chatRoom.kind === newnewapi.ChatRoom.Kind.CREATOR_MASS_UPDATE) {
    avatar = <MyAvatarMassupdate />;
  }

  let lastMsg = chatRoom.lastMessage?.content?.text;

  if (!lastMsg) {
    if (chatRoom.kind === newnewapi.ChatRoom.Kind.CREATOR_MASS_UPDATE) {
      lastMsg = textTrim(t('newAnnouncement.noAnnouncement'));
    } else {
      lastMsg = textTrim(t('chat.noMessagesFirstLine'));
    }
  }

  return (
    <SChatItem onClick={handleItemClick} isActiveChat={isActiveChat(chatRoom)}>
      {avatar}
      <SChatItemContent>
        <SChatItemContentWrapper>
          <ChatName chat={chatRoom} />
          <SChatItemTime variant={3} weight={600}>
            {moment((chatRoom.updatedAt?.seconds as number) * 1000)
              .locale(router.locale || 'en-US')
              .fromNow()}
          </SChatItemTime>
        </SChatItemContentWrapper>
        <SChatItemContentWrapper>
          <SChatItemLastMessage variant={3} weight={600}>
            {textTrim(lastMsg, 28)}
          </SChatItemLastMessage>
          <SChatItemRight>
            {(chatRoom.unreadMessageCount as number) > 0 &&
              activeChatRoom?.id !== chatRoom.id && (
                <SUnreadCount>{chatRoom.unreadMessageCount}</SUnreadCount>
              )}
          </SChatItemRight>
        </SChatItemContentWrapper>
      </SChatItemContent>
    </SChatItem>
  );
};

export default ChatlistItem;
