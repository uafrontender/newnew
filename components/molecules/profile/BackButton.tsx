import React from 'react';
import styled from 'styled-components';
import BackButtonIcon from '../../../public/images/svg/icons/filled/Back.svg';
import InlineSvg from '../../atoms/InlineSVG';

interface IBackButton {
  className?: string;
  onClick: () => void;
}

const BackButton: React.FC<IBackButton> = ({ className, onClick }) => (
  <Container className={className} onClick={onClick}>
    <InlineSvg svg={BackButtonIcon} width='24px' height='24px' />
  </Container>
);

BackButton.defaultProps = {
  className: undefined,
};

export default BackButton;

const Container = styled.div`
  padding: 8px;
  border-radius: 16px;
  cursor: pointer;
  color: #2c2c33;
  background: rgba(11, 10, 19, 0.2);
  transition: 0.2s linear;

  &:active {
    transform: scale(0.9);
    opacity: 0.5;
  }

  ${(props) => props.theme.media.laptop} {
    padding: 12px;
  }
`;
