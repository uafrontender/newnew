import React from 'react';
import styled, { useTheme } from 'styled-components';
import Button from '../Button';
import InlineSVG from '../InlineSVG';
import NewMessageIcon from '../../../public/images/svg/icons/filled/NewMessage.svg';
import { useAppState } from '../../../contexts/appStateContext';

interface INewMessageButton {
  handleClick: () => void;
}

const NewMessageButton: React.FC<INewMessageButton> = ({ handleClick }) => {
  const theme = useTheme();
  const { resizeMode } = useAppState();
  const isMobileOrTablet = [
    'mobile',
    'mobileS',
    'mobileM',
    'mobileL',
    'tablet',
  ].includes(resizeMode);
  return (
    <SButton
      onClick={handleClick}
      view={!isMobileOrTablet ? 'secondary' : 'transparent'}
    >
      <SInlineSVG
        svg={NewMessageIcon}
        fill={
          theme.name === 'light'
            ? theme.colorsThemed.text.primary
            : theme.colors.white
        }
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
  width: 48px;
  height: 48px;
  padding: 0;
  display: flex;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  border-radius: ${(props) => props.theme.borderRadius.medium};
  background: none;

  ${({ theme }) => theme.media.laptop} {
    background: ${(props) => props.theme.colorsThemed.background.secondary};
  }
`;

export default NewMessageButton;
