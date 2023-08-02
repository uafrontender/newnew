import React from 'react';
import styled from 'styled-components';
import InlineSVG from '../../../atoms/InlineSVG';
import Indicator from '../../../atoms/Indicator';

import chatIcon from '../../../../public/images/svg/icons/filled/Chat.svg';
import { useChatsUnreadMessages } from '../../../../contexts/chatsUnreadMessagesContext';

interface IFloatingMessages {
  withCounter?: boolean;
  openChat: () => void;
}

export const FloatingMessages: React.FC<IFloatingMessages> = ({
  withCounter,
  openChat,
}) => {
  let { unreadCountForCreator } = useChatsUnreadMessages();
  unreadCountForCreator = 1;
  return (
    <SContainer onClick={openChat}>
      <InlineSVG svg={chatIcon} width='24px' height='24px' />
      {withCounter && (
        <SIndicatorContainer>
          {unreadCountForCreator > 0 && <SIndicator minified />}
        </SIndicatorContainer>
      )}
    </SContainer>
  );
};

export default FloatingMessages;

FloatingMessages.defaultProps = {
  withCounter: false,
};

const SContainer = styled.div`
  cursor: pointer;
  position: relative;
  background: ${(props) => props.theme.colorsThemed.accent.blue};
  border-radius: 50%;
  width: 56px;
  height: 56px;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const SIndicatorContainer = styled.div`
  top: 13px;
  right: 13px;
  position: absolute;
`;

const SIndicator = styled(Indicator)`
  border: 3px solid ${(props) => props.theme.colorsThemed.accent.blue};
`;
