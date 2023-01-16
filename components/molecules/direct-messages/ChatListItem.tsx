import React, { useCallback } from 'react';
import { newnewapi } from 'newnew-api';
import moment from 'moment';
import dynamic from 'next/dynamic';
import { useTranslation } from 'react-i18next';
import {
  SChatItemContainer,
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

const MyAvatarMassupdate = dynamic(
  () => import('../../atoms/direct-messages/MyAvatarMassupdate')
);

interface IFunctionProps {
  chatRoom: newnewapi.IChatRoom;
}

const ChatlistItem: React.FC<IFunctionProps> = ({ chatRoom }) => {
  const { t } = useTranslation('page-Chat');
  const { resizeMode } = useAppSelector((state) => state.ui);
  const isMobileOrTablet = [
    'mobile',
    'mobileS',
    'mobileM',
    'mobileL',
    'tablet',
  ].includes(resizeMode);
  const { activeChatRoom, setActiveChatRoom, setHiddenMessagesArea } =
    useGetChats();

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

  const handleItemClick = useCallback(async () => {
    if (chatRoom?.unreadMessageCount && chatRoom?.unreadMessageCount > 0) {
      try {
        const payload = new newnewapi.MarkRoomAsReadRequest({
          roomId: chatRoom.id as number,
        });
        const res = await markRoomAsRead(payload);
        if (!res.data || res.error)
          throw new Error(res.error?.message ?? 'Request failed');
      } catch (err) {
        console.error(err);
      }
    }
    setActiveChatRoom(chatRoom);
    if (isMobileOrTablet) {
      setHiddenMessagesArea(false);
    }
  }, [setActiveChatRoom, isMobileOrTablet, setHiddenMessagesArea, chatRoom]);

  let avatar = (
    <SUserAvatar>
      <UserAvatar avatarUrl={chatRoom.visavis?.user?.avatarUrl ?? ''} />
    </SUserAvatar>
  );

  if (chatRoom.kind === 4) {
    avatar = <MyAvatarMassupdate />;
  }

  let lastMsg = chatRoom.lastMessage?.content?.text;

  if (!lastMsg) {
    if (chatRoom.kind === 4) {
      lastMsg = textTrim(t('newAnnouncement.created'));
    } else {
      lastMsg = textTrim(t('chat.noMessagesFirstLine'));
    }
  }

  return (
    <SChatItemContainer>
      <SChatItem
        onClick={handleItemClick}
        isActiveChat={isActiveChat(chatRoom)}
      >
        {avatar}
        <SChatItemContent>
          <SChatItemContentWrapper>
            <ChatName chat={chatRoom} />
            <SChatItemTime variant={3} weight={600}>
              {moment((chatRoom.updatedAt?.seconds as number) * 1000).fromNow()}
            </SChatItemTime>
          </SChatItemContentWrapper>
          <SChatItemContentWrapper>
            <SChatItemLastMessage variant={3} weight={600}>
              {textTrim(lastMsg, 28)}
            </SChatItemLastMessage>
            <SChatItemRight>
              {(chatRoom.unreadMessageCount as number) > 0 && (
                <SUnreadCount>{chatRoom.unreadMessageCount}</SUnreadCount>
              )}
            </SChatItemRight>
          </SChatItemContentWrapper>
        </SChatItemContent>
      </SChatItem>
    </SChatItemContainer>
  );
};

export default ChatlistItem;
