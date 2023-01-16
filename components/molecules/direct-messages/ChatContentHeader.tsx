/* eslint-disable no-unused-expressions */
import React, { useCallback, useEffect, useRef, useState } from 'react';
import styled, { useTheme } from 'styled-components';
import dynamic from 'next/dynamic';
import { newnewapi } from 'newnew-api';
import { useAppSelector } from '../../../redux-store/store';

import Button from '../../atoms/Button';
import ChatUserData from '../../atoms/direct-messages/ChatUserData';
import InlineSVG from '../../atoms/InlineSVG';
import MoreIconFilled from '../../../public/images/svg/icons/filled/More.svg';
import { useGetChats } from '../../../contexts/chatContext';

const GoBackButton = dynamic(
  () => import('../../atoms/direct-messages/GoBackButton')
);
const ChatEllipseMenu = dynamic(() => import('./ChatEllipseMenu'));
const ChatEllipseModal = dynamic(() => import('./ChatEllipseModal'));
const AnnouncementHeader = dynamic(
  () => import('../../atoms/direct-messages/AnnouncementHeader')
);

interface IFunctionProps {
  chatRoom: newnewapi.IChatRoom;
  isVisavisBlocked: boolean;
  onUserReport: () => void;
  onUserBlock: () => void;
}

const ChatContentHeader: React.FC<IFunctionProps> = ({
  isVisavisBlocked,
  onUserBlock,
  onUserReport,
  chatRoom,
}) => {
  const theme = useTheme();
  const { resizeMode } = useAppSelector((state) => state.ui);
  const isMobileOrTablet = [
    'mobile',
    'mobileS',
    'mobileM',
    'mobileL',
    'tablet',
  ].includes(resizeMode);
  const isMobile = ['mobile', 'mobileS', 'mobileM', 'mobileL'].includes(
    resizeMode
  );
  const [isAnnouncement, setIsAnnouncement] = useState<boolean>(false);
  const [isMyAnnouncement, setIsMyAnnouncement] = useState<boolean>(false);
  const [ellipseMenuOpen, setEllipseMenuOpen] = useState(false);

  const { activeChatRoom, setActiveChatRoom, setHiddenMessagesArea } =
    useGetChats();

  useEffect(() => {
    if (chatRoom.kind === 4) {
      setIsAnnouncement(true);
      chatRoom.myRole === 2
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

  const goBackHandler = useCallback(() => {
    if (activeChatRoom) {
      setActiveChatRoom(null);
      setHiddenMessagesArea(true);
    }
  }, [setActiveChatRoom, setHiddenMessagesArea, activeChatRoom]);

  return (
    <>
      <STopPart>
        {isMobileOrTablet && <GoBackButton onClick={goBackHandler} />}
        <ChatUserData
          isMyAnnouncement={isMyAnnouncement}
          isAnnouncement={isAnnouncement}
          chatRoom={chatRoom}
        />
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
