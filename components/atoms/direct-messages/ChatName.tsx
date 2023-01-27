import { newnewapi } from 'newnew-api';
import React from 'react';
import { useTranslation } from 'next-i18next';

import {
  SChatItemInfo,
  SChatItemLine,
  SChatItemText,
  SVerificationSVG,
} from './styles';
import VerificationCheckmark from '../../../public/images/svg/icons/filled/Verification.svg';
import { useAppSelector } from '../../../redux-store/store';
import getDisplayname from '../../../utils/getDisplayname';

interface IChatName {
  chat: newnewapi.IChatRoom;
}
const ChatName: React.FC<IChatName> = ({ chat }) => {
  const { t } = useTranslation('page-Chat');
  const user = useAppSelector((state) => state.user);

  const visaviName =
    chat.kind === newnewapi.ChatRoom.Kind.CREATOR_MASS_UPDATE &&
    chat.myRole === newnewapi.ChatRoom.MyRole.CREATOR
      ? getDisplayname(user.userData)
      : getDisplayname(chat.visavis?.user);

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
          {`${visaviName}${suffix}`}
        </SChatItemText>
        {(chat.visavis?.user?.options?.isVerified ||
          (chat.kind === newnewapi.ChatRoom.Kind.CREATOR_MASS_UPDATE &&
            chat.myRole === newnewapi.ChatRoom.MyRole.CREATOR &&
            user.userData?.options?.isVerified)) && (
          <SVerificationSVG
            svg={VerificationCheckmark}
            width='20px'
            height='20px'
            fill='none'
          />
        )}
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
