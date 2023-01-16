import React from 'react';
import Link from 'next/link';
import { newnewapi } from 'newnew-api';
import styled from 'styled-components';
import { useTranslation } from 'next-i18next';
import { SUserAlias } from './styles';
import InlineSVG from '../InlineSVG';
import getDisplayname from '../../../utils/getDisplayname';
import { useAppSelector } from '../../../redux-store/store';
import VerificationCheckmark from '../../../public/images/svg/icons/filled/Verification.svg';

interface IFunctionProps {
  isMyAnnouncement: boolean;
  isAnnouncement: boolean;
  chatRoom: newnewapi.IChatRoom;
}

const ChatUserData: React.FC<IFunctionProps> = ({
  isMyAnnouncement,
  isAnnouncement,
  chatRoom,
}) => {
  const { t } = useTranslation('page-Chat');
  const user = useAppSelector((state) => state.user);

  return (
    <SUserData>
      <SUserName>
        {
          // eslint-disable-next-line no-nested-ternary
          isAnnouncement
            ? `${t('announcement.beforeName')} ${
                isMyAnnouncement
                  ? getDisplayname(user.userData)
                  : getDisplayname(chatRoom?.visavis?.user)
              }${t('announcement.suffix')} ${t('announcement.afterName')}`
            : isMyAnnouncement
            ? getDisplayname(user.userData)
            : getDisplayname(chatRoom?.visavis?.user)
        }
        {(chatRoom.visavis?.user?.options?.isVerified ||
          (isMyAnnouncement && user.userData?.options?.isVerified)) && (
          <SVerificationSVG
            svg={VerificationCheckmark}
            width='18px'
            height='18px'
            fill='none'
          />
        )}
      </SUserName>
      {!isAnnouncement && (
        <Link href={`/${chatRoom?.visavis?.user?.username}`}>
          <a style={{ display: 'flex' }}>
            <SUserAlias>{`@${chatRoom?.visavis?.user?.username}`}</SUserAlias>
          </a>
        </Link>
      )}
      {isAnnouncement && (
        <SUserAlias>
          {`${
            chatRoom?.memberCount && chatRoom?.memberCount > 0
              ? chatRoom.memberCount
              : 0
          } ${
            chatRoom?.memberCount && chatRoom?.memberCount > 1
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
`;

const SUserName = styled.strong`
  font-weight: 600;
  font-size: 16px;
  padding-bottom: 4px;
  display: flex;
  align-items: center;
`;

const SVerificationSVG = styled(InlineSVG)`
  margin-left: 4px;
  flex-shrink: 0;
`;
