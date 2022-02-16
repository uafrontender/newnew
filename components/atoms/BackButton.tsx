import React from 'react';
import styled, { useTheme } from 'styled-components';
import chevronLeftIcon from '../../public/images/svg/icons/outlined/ChevronLeft.svg';
import InlineSVG from './InlineSVG';

interface IBackButton{
  fn?: () => void;
}

const BackButton: React.FC<IBackButton> = ({fn}) => {
  const theme = useTheme();

  return (
    <SBackButton
      clickable
      svg={chevronLeftIcon}
      fill={theme.colorsThemed.text.secondary}
      width="24px"
      height="24px"
      onClick={fn}
    />
  );
};

export default BackButton

BackButton.defaultProps = {
  fn: () => {},
};

const SInlineSVG = styled(InlineSVG)`
  min-width: 24px;
  min-height: 24px;
`;

const SBackButton = styled(SInlineSVG)`
  margin-right: 10px;
`;
