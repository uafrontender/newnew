import React, { useEffect, useState } from 'react';
import moment from 'moment';
import { newnewapi } from 'newnew-api';
import Link from 'next/link';
import styled, { useTheme } from 'styled-components';
import UserAvatar from '../../molecules/UserAvatar';
import Button from '../Button';
import { useGetBlockedUsers } from '../../../contexts/blockedUsersContext';

import MoreIconFilled from '../../../public/images/svg/icons/filled/More.svg';
import InlineSVG from '../InlineSVG';
import ChatEllipseMenu from './ChatEllipseMenu';
import { markUser } from '../../../api/endpoints/user';
import ReportUserModal from '../../molecules/chat/ReportUserModal';
import BlockUserModal from '../../molecules/chat/BlockUserModal';
import { useAppSelector } from '../../../redux-store/store';

interface ISubscriberRow {
  subscriber: newnewapi.ISubscriber;
}

const SubscriberRow: React.FC<ISubscriberRow> = ({ subscriber }) => {
  const theme = useTheme();
  const { resizeMode } = useAppSelector((state) => state.ui);
  const isMobile = ['mobile', 'mobileS', 'mobileM', 'mobileL'].includes(resizeMode);
  const [ellipseMenuOpen, setEllipseMenuOpen] = useState(false);
  const [isSubscriberBlocked, setIsSubscriberBlocked] = useState<boolean>(false);
  const [confirmBlockUser, setConfirmBlockUser] = useState<boolean>(false);
  const [confirmReportUser, setConfirmReportUser] = useState<boolean>(false);

  const { usersIBlocked, unblockUser } = useGetBlockedUsers();

  const handleOpenEllipseMenu = () => setEllipseMenuOpen(true);
  const handleCloseEllipseMenu = () => setEllipseMenuOpen(false);

  useEffect(() => {
    if (usersIBlocked.length > 0) {
      const isBlocked = usersIBlocked.find((i) => i === subscriber.user?.uuid);
      if (isBlocked) {
        setIsSubscriberBlocked(true);
      }
      console.log(usersIBlocked);
    }
    if (isSubscriberBlocked) setIsSubscriberBlocked(false);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [usersIBlocked, subscriber]);

  async function unblockUserRequest() {
    try {
      const payload = new newnewapi.MarkUserRequest({
        markAs: 4,
        userUuid: subscriber.user?.uuid,
      });
      const res = await markUser(payload);
      if (!res.data || res.error) throw new Error(res.error?.message ?? 'Request failed');
      unblockUser(subscriber.user?.uuid!!);
    } catch (err) {
      console.error(err);
    }
  }

  const onUserBlock = () => {
    if (!isSubscriberBlocked) {
      if (!confirmBlockUser) setConfirmBlockUser(true);
    } else {
      unblockUserRequest();
    }
  };

  const onUserReport = () => {
    setConfirmReportUser(true);
  };

  return (
    <SContainer>
      <SUser>
        <SUserAvatar>
          <UserAvatar avatarUrl={subscriber.user?.avatarUrl ? subscriber.user.avatarUrl : ''} />
        </SUserAvatar>
        {subscriber.user?.nickname ? subscriber.user?.nickname : subscriber.user?.username}
      </SUser>
      {subscriber.firstSubscribedAt && (
        <SDate>{moment((subscriber.firstSubscribedAt.seconds as number) * 1000).format('DD MMMM YYYY')}</SDate>
      )}
      <SActions>
        {!isMobile && <Link href={`/direct-messages?chatwith=${subscriber.user?.uuid}`}>DM</Link>}
        <SMoreButton view="transparent" iconOnly onClick={() => handleOpenEllipseMenu()}>
          <InlineSVG svg={MoreIconFilled} fill={theme.colorsThemed.text.secondary} width="20px" height="20px" />
        </SMoreButton>
        <ChatEllipseMenu
          user={subscriber.user!!}
          isVisible={ellipseMenuOpen}
          handleClose={handleCloseEllipseMenu}
          userBlocked={isSubscriberBlocked}
          onUserBlock={onUserBlock}
          onUserReport={onUserReport}
        />
        {confirmReportUser && (
          <ReportUserModal
            confirmReportUser={confirmReportUser}
            user={subscriber.user!!}
            closeModal={() => setConfirmReportUser(false)}
          />
        )}
        {isSubscriberBlocked === true ||
          (confirmBlockUser && (
            <BlockUserModal
              confirmBlockUser={confirmBlockUser}
              onUserBlock={() => setIsSubscriberBlocked(true)}
              user={subscriber.user!!}
              closeModal={() => setConfirmBlockUser(false)}
            />
          ))}
      </SActions>
    </SContainer>
  );
};

export default SubscriberRow;

const SContainer = styled.div`
  display: flex;
  padding: 16px 0;
  align-items: center;
  border-top: 1px solid ${(props) => props.theme.colorsThemed.background.outlines1};
`;

const SUser = styled.div`
  display: flex;
  align-items: center;
  width: 40%;
  color: ${(props) => props.theme.colorsThemed.text.secondary};

  ${(props) => props.theme.media.tablet} {
    width: 33%;
    margin-right: -10px;
  }
`;

const SUserAvatar = styled.div`
  width: 24px;
  height: 24px;
  margin-right: 8px;
  flex-shrink: 0;
  border-radius: 50%;
  overflow: hidden;
  & > * {
    width: 100%;
    height: 100%;
    min-width: 100%;
    min-height: 100%;
  }
`;

const SDate = styled.div`
  padding: 0 0 0 16px;
  width: 33%;
  display: flex;
`;

const SActions = styled.div`
  margin-left: auto;
  position: relative;
  display: flex;
  align-items: center;
  ${(props) => props.theme.media.laptop} {
    padding-right: 20px;
  }
`;

const SMoreButton = styled(Button)`
  background: none;
  color: ${({ theme }) => theme.colorsThemed.text.primary};
  padding: 8px;
  ${(props) => props.theme.media.tablet} {
    margin-left: 50px;
  }
  span {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
  }
`;
