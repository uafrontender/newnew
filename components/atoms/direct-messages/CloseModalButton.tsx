import React from 'react';
import styled, { useTheme } from 'styled-components';
import InlineSVG from '../InlineSVG';
import { IButton } from '../../interfaces/default';
import closeIcon from '../../../public/images/svg/icons/outlined/Close.svg';
import Button from '../Button';

const CloseModalButton: React.FC<IButton> = ({ handleClick }) => {
  const theme = useTheme();
  return (
    <SButton onClick={handleClick} view='modalSecondary'>
      <SInlineSVG
        svg={closeIcon}
        fill={theme.colorsThemed.text.secondary}
        width='24px'
        height='24px'
      />
    </SButton>
  );
};

const SInlineSVG = styled(InlineSVG)`
  min-width: 20px;
  min-height: 20px;
`;

const SButton = styled(Button)`
  width: 24px;
  height: 24px;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: ${(props) => props.theme.borderRadius.medium};
`;

export default CloseModalButton;
