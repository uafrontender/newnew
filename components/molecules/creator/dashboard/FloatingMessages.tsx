import React, { useCallback } from 'react';
import styled from 'styled-components';

import InlineSVG from '../../../atoms/InlineSVG';
import Indicator from '../../../atoms/Indicator';

import chatIcon from '../../../../public/images/svg/icons/filled/Chat.svg';

interface IFloatingMessages {
  withCounter?: boolean;
}

export const FloatingMessages: React.FC<IFloatingMessages> = (props) => {
  const { withCounter } = props;

  const handleClick = useCallback(() => {
    console.log('message click');
  }, []);

  return (
    <SContainer onClick={handleClick}>
      <InlineSVG
        svg={chatIcon}
        width="24px"
        height="24px"
      />
      {withCounter && (
        <SIndicatorContainer>
          <SIndicator minified />
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
  padding: 16px;
  position: relative;
  background: ${(props) => props.theme.colorsThemed.accent.blue};
  border-radius: 50%;
`;

const SIndicatorContainer = styled.div`
  top: 13px;
  right: 13px;
  position: absolute;
`;

const SIndicator = styled(Indicator)`
  border: 3px solid ${(props) => props.theme.colorsThemed.accent.blue};
`;
