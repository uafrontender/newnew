import React from 'react';
import Link from 'next/link';
import { newnewapi } from 'newnew-api';
import styled from 'styled-components';
import { useTranslation } from 'next-i18next';
import InlineSVG from '../InlineSVG';
import { SUserAlias } from './styles';
import getDisplayname from '../../../utils/getDisplayname';
import { useAppSelector } from '../../../redux-store/store';
import VerificationCheckmark from '../../../public/images/svg/icons/filled/Verification.svg';

interface IChatUserData {
  chatRoom: newnewapi.IChatRoom;
  isAnnouncement?: boolean;
  isMyAnnouncement?: boolean;
}
const ChatUserData: React.FC<IChatUserData> = ({
  chatRoom,
  isAnnouncement,
  isMyAnnouncement,
}) => {
  const { t } = useTranslation('page-Chat');
  const user = useAppSelector((state) => state.user);

  return (
    <SUserData>
      <SUserName>
        <SUserNameText>
          {
            // eslint-disable-next-line no-nested-ternary
            isAnnouncement
              ? `${t('announcement.beforeName')} ${
                  isMyAnnouncement
                    ? getDisplayname(user.userData)
                    : getDisplayname(chatRoom.visavis?.user)
                }${t('announcement.suffix')} ${t('announcement.afterName')}`
              : isMyAnnouncement
              ? getDisplayname(user.userData)
              : getDisplayname(chatRoom.visavis?.user)
          }
        </SUserNameText>
        {(chatRoom.visavis?.user?.options?.isVerified ||
          (isMyAnnouncement && user.userData?.options?.isVerified)) && (
          <SVerificationSVG
            svg={VerificationCheckmark}
            width='20px'
            height='20px'
            fill='none'
          />
        )}
      </SUserName>
      {!isAnnouncement && (
        <Link href={`/${chatRoom?.visavis?.user?.username}`}>
          <a style={{ display: 'flex' }}>
            <SUserAlias>{`@${chatRoom.visavis?.user?.username}`}</SUserAlias>
          </a>
        </Link>
      )}
      {isAnnouncement && (
        <SUserAlias>
          {`${
            chatRoom.memberCount && chatRoom.memberCount > 0
              ? chatRoom.memberCount
              : 0
          } ${
            chatRoom.memberCount && chatRoom.memberCount > 1
              ? t('newAnnouncement.members')
              : t('newAnnouncement.member')
          }`}
        </SUserAlias>
      )}
    </SUserData>
  );
};

export default ChatUserData;

const SUserData = styled.div`
  display: flex;
  flex-direction: column;
  font-weight: 600;
  margin-right: auto;
  overflow: hidden;
`;

const SUserName = styled.div`
  margin-bottom: 4px;
  display: flex;
  align-items: center;
`;

const SUserNameText = styled.strong`
  font-weight: 600;
  font-size: 16px;
  line-height: 20px;
  white-space: pre;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const SVerificationSVG = styled(InlineSVG)`
  margin-left: 4px;
  flex-shrink: 0;
`;
