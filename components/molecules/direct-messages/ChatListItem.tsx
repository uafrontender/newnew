import React, { useCallback } from 'react';
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
  SUnreadCountWrapper,
  SChatItemTime,
  SUserAvatar,
  SUnreadCount,
} from '../../atoms/direct-messages/styles';
import textTrim from '../../../utils/textTrim';
import ChatName from '../../atoms/direct-messages/ChatName';
import { useAppState } from '../../../contexts/appStateContext';
import { Mixpanel } from '../../../utils/mixpanel';

const MyAvatarMassupdate = dynamic(
  () => import('../../atoms/direct-messages/MyAvatarMassupdate')
);

interface IFunctionProps {
  chatRoom: newnewapi.IChatRoom;
  isActive: boolean;
  onChatRoomSelect: (chatRoom: newnewapi.IChatRoom) => void;
}

const ChatListItem: React.FC<IFunctionProps> = ({
  chatRoom,
  isActive,
  onChatRoomSelect,
}) => {
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

  const handleItemClick = useCallback(async () => {
    Mixpanel.track('Chat Item Clicked', {
      _stage: 'Direct Messages',
      _component: 'ChatListItem',
      _page: router.pathname,
    });
    onChatRoomSelect(chatRoom);
  }, [chatRoom, onChatRoomSelect, router.pathname]);

  let lastMsg = chatRoom.lastMessage?.content?.text;

  if (!lastMsg) {
    if (chatRoom.kind === newnewapi.ChatRoom.Kind.CREATOR_MASS_UPDATE) {
      lastMsg = textTrim(t('newAnnouncement.noAnnouncement'));
    } else {
      lastMsg = textTrim(t('chat.noMessagesFirstLine'));
    }
  }

  return (
    <SChatItem
      onClick={handleItemClick}
      isActiveChat={isActive && !isMobileOrTablet}
    >
      {chatRoom.kind === newnewapi.ChatRoom.Kind.CREATOR_MASS_UPDATE ? (
        <MyAvatarMassupdate />
      ) : (
        <SUserAvatar avatarUrl={chatRoom.visavis?.user?.avatarUrl ?? ''} />
      )}

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
          <SUnreadCountWrapper>
            {(chatRoom.unreadMessageCount as number) > 0 && !isActive && (
              <SUnreadCount>{chatRoom.unreadMessageCount}</SUnreadCount>
            )}
          </SUnreadCountWrapper>
        </SChatItemContentWrapper>
      </SChatItemContent>
    </SChatItem>
  );
};

export default ChatListItem;
