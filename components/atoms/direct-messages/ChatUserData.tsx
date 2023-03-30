import React, { useMemo } from 'react';
import Link from 'next/link';
import { newnewapi } from 'newnew-api';
import styled from 'styled-components';
import { useTranslation } from 'next-i18next';
import { SUserAlias } from './styles';
import { useAppSelector } from '../../../redux-store/store';
import DisplayName from '../DisplayName';

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

  const chatUser = useMemo(
    () => (isMyAnnouncement ? user.userData : chatRoom.visavis?.user),
    [isMyAnnouncement, user.userData, chatRoom.visavis?.user]
  );

  return (
    <SUserData>
      <SUserName>
        {isAnnouncement && t('announcement.beforeName')}
        <DisplayName
          user={chatUser}
          suffix={
            isAnnouncement
              ? `${t('announcement.suffix')} ${t('announcement.afterName')}`
              : undefined
          }
        />
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
  overflow: hidden;
`;

const SUserName = styled.div`
  margin-bottom: 4px;
  display: flex;
  align-items: center;
  font-weight: 600;
  font-size: 16px;
  line-height: 20px;
`;
