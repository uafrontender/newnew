import { newnewapi } from 'newnew-api';
import React, { useMemo } from 'react';
import { useTranslation } from 'next-i18next';

import { SChatItemInfo, SChatItemLine, SChatItemText } from './styles';
import { useUserData } from '../../../contexts/userDataContext';
import DisplayName from '../DisplayName';

interface IChatName {
  chat: newnewapi.IChatRoom;
}
const ChatName: React.FC<IChatName> = ({ chat }) => {
  const { t } = useTranslation('page-Chat');
  const { userData } = useUserData();

  const chatUser = useMemo(
    () =>
      chat.kind === newnewapi.ChatRoom.Kind.CREATOR_MASS_UPDATE &&
      chat.myRole === newnewapi.ChatRoom.MyRole.CREATOR
        ? userData
        : chat.visavis?.user,
    [chat, userData]
  );

  const beforeName =
    chat.kind === newnewapi.ChatRoom.Kind.CREATOR_MASS_UPDATE
      ? t('announcement.beforeName')
      : '';
  const suffix =
    chat.kind === newnewapi.ChatRoom.Kind.CREATOR_MASS_UPDATE
      ? t('announcement.suffix')
      : '';
  const afterName =
    chat.kind === newnewapi.ChatRoom.Kind.CREATOR_MASS_UPDATE
      ? t('announcement.afterName')
      : '';

  return (
    <SChatItemInfo>
      {beforeName && (
        <SChatItemLine>
          <SChatItemText variant={3} weight={600}>
            {beforeName}
          </SChatItemText>
        </SChatItemLine>
      )}
      <SChatItemLine>
        <SChatItemText variant={3} weight={600}>
          <DisplayName user={chatUser} suffix={suffix} />
        </SChatItemText>
      </SChatItemLine>
      {afterName && (
        <SChatItemLine>
          <SChatItemText variant={3} weight={600}>
            {afterName}
          </SChatItemText>
        </SChatItemLine>
      )}
    </SChatItemInfo>
  );
};

export default ChatName;
