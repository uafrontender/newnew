/* eslint-disable no-unused-expressions */
import React, { useCallback, useEffect, useRef, useState } from 'react';
import styled, { useTheme } from 'styled-components';
import dynamic from 'next/dynamic';
import { newnewapi } from 'newnew-api';
import { useRouter } from 'next/router';
import { useAppSelector } from '../../../redux-store/store';

import Button from '../../atoms/Button';
import ChatUserData from '../../atoms/direct-messages/ChatUserData';
import InlineSVG from '../../atoms/InlineSVG';
import MoreIconFilled from '../../../public/images/svg/icons/filled/More.svg';
import { useGetChats } from '../../../contexts/chatContext';
import { useAppState } from '../../../contexts/appStateContext';
import { Mixpanel } from '../../../utils/mixpanel';

const GoBackButton = dynamic(
  () => import('../../atoms/direct-messages/GoBackButton')
);
const ChatEllipseMenu = dynamic(() => import('./ChatEllipseMenu'));
const ChatEllipseModal = dynamic(() => import('./ChatEllipseModal'));
const UserAvatar = dynamic(() => import('../UserAvatar'));
const AnnouncementHeader = dynamic(
  () => import('../../atoms/direct-messages/AnnouncementHeader')
);

interface IFunctionProps {
  chatRoom: newnewapi.IChatRoom;
  isVisavisBlocked: boolean;
  isBackButton?: boolean;
  isMoreButton?: boolean;
  isAvatar?: boolean;
  onUserReport: () => void;
  onUserBlock: () => Promise<void>;
  onBackButtonClick?: () => void;
}

const ChatContentHeader: React.FC<IFunctionProps> = ({
  isVisavisBlocked,
  isBackButton,
  isMoreButton,
  isAvatar,
  onUserBlock,
  onUserReport,
  onBackButtonClick,
  chatRoom,
}) => {
  const theme = useTheme();
  const { user } = useAppSelector((state) => state);
  const { resizeMode } = useAppState();

  const isMobile = ['mobile', 'mobileS', 'mobileM', 'mobileL'].includes(
    resizeMode
  );
  const [isAnnouncement, setIsAnnouncement] = useState<boolean>(false);
  const [isMyAnnouncement, setIsMyAnnouncement] = useState<boolean>(false);
  const [ellipseMenuOpen, setEllipseMenuOpen] = useState(false);
  const router = useRouter();

  const { mobileChatOpened } = useGetChats();

  useEffect(() => {
    if (chatRoom.kind === newnewapi.ChatRoom.Kind.CREATOR_MASS_UPDATE) {
      setIsAnnouncement(true);
      chatRoom.myRole === newnewapi.ChatRoom.MyRole.CREATOR
        ? setIsMyAnnouncement(true)
        : setIsMyAnnouncement(false);
    } else {
      setIsAnnouncement(false);
      setIsMyAnnouncement(false);
    }
  }, [chatRoom.kind, chatRoom.myRole]);

  const moreButtonRef: any = useRef();

  const handleOpenEllipseMenu = useCallback(() => {
    setEllipseMenuOpen(true);
  }, []);

  const handleCloseEllipseMenu = useCallback(() => {
    setEllipseMenuOpen(false);
  }, []);

  // TODO: rework routing, pushing state on back button clicked is wrong
  const goBackHandler = useCallback(async () => {
    Mixpanel.track('Navigation Item Clicked', {
      _stage: 'Chat',
      _button: 'Back button',
      _component: 'ChatContentHeader',
      _page: router.pathname,
    });

    if (onBackButtonClick) {
      onBackButtonClick();
    }
  }, [router.pathname, onBackButtonClick]);

  const handleUserClick = useCallback(() => {
    if (chatRoom?.visavis?.user?.username) {
      router.push(`/${chatRoom?.visavis?.user?.username}`);
    }
  }, [chatRoom?.visavis?.user?.username, router]);

  return (
    <>
      <STopPart>
        {isBackButton && onBackButtonClick && (
          <GoBackButton onClick={goBackHandler} />
        )}
        {isAvatar &&
          !mobileChatOpened &&
          (chatRoom?.kind === 4 ? (
            <SUserAvatar avatarUrl={user?.userData?.avatarUrl ?? ''} />
          ) : (
            <SUserAvatar
              withClick
              onClick={handleUserClick}
              avatarUrl={chatRoom?.visavis?.user?.avatarUrl ?? ''}
            />
          ))}

        <ChatUserData
          isMyAnnouncement={isMyAnnouncement}
          isAnnouncement={isAnnouncement}
          chatRoom={chatRoom}
        />
        {isMoreButton && (
          <SActionsDiv>
            {!isMyAnnouncement && (
              <SMoreButton
                view='transparent'
                iconOnly
                onClick={() => handleOpenEllipseMenu()}
                ref={moreButtonRef}
              >
                <InlineSVG
                  svg={MoreIconFilled}
                  fill={theme.colorsThemed.text.secondary}
                  width='20px'
                  height='20px'
                />
              </SMoreButton>
            )}
            {/* Ellipse menu */}
            {!isMobile && chatRoom.visavis && (
              <ChatEllipseMenu
                myRole={chatRoom.myRole ? chatRoom.myRole : 0}
                user={chatRoom.visavis}
                isVisible={ellipseMenuOpen}
                handleClose={handleCloseEllipseMenu}
                userBlocked={isVisavisBlocked}
                onUserBlock={onUserBlock}
                onUserReport={onUserReport}
                isAnnouncement={isAnnouncement}
                anchorElement={moreButtonRef.current}
              />
            )}
            {isMobile && ellipseMenuOpen ? (
              <ChatEllipseModal
                isOpen={ellipseMenuOpen}
                zIndex={21}
                onClose={handleCloseEllipseMenu}
                userBlocked={isVisavisBlocked}
                onUserBlock={onUserBlock}
                onUserReport={onUserReport}
                visavis={chatRoom.visavis}
                isAnnouncement={isAnnouncement}
              />
            ) : null}
          </SActionsDiv>
        )}
      </STopPart>
      {isAnnouncement && !isMyAnnouncement && chatRoom?.visavis?.user && (
        <AnnouncementHeader user={chatRoom.visavis?.user} />
      )}
    </>
  );
};

export default ChatContentHeader;

const STopPart = styled.header`
  height: 80px;
  z-index: 1;
  background: ${(props) => props.theme.colorsThemed.background.secondary};
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  ${(props) => props.theme.media.tablet} {
    background: none;
    position: static;
    padding: 21px 10px 21px 24px;
  }
  border-bottom: 1px solid
    ${(props) => props.theme.colorsThemed.background.outlines1};
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 10px 0 24px;
`;

const SActionsDiv = styled.div`
  position: relative;
`;

const SMoreButton = styled(Button)`
  background: none;
  color: ${({ theme }) => theme.colorsThemed.text.primary};
  padding: 8px;
  margin-right: 18px;
  span {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
  }
`;

const SUserAvatar = styled(UserAvatar)`
  margin: 0 12px 0 0;
`;
