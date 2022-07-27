import React from 'react';
import styled, { css } from 'styled-components';
import dynamic from 'next/dynamic';

import { useAppSelector } from '../../redux-store/store';
import preventParentClick from '../../utils/preventParentClick';

import InlineSvg from '../atoms/InlineSVG';

import CloseIcon from '../../public/images/svg/icons/outlined/Close.svg';

const GoBackButton = dynamic(() => import('../molecules/GoBackButton'));

interface IModalPaper {
  title?: string;
  onClose: () => void;
  children: React.ReactNode;
  isMobileFullScreen?: boolean;
  isCloseButton?: boolean;
}

const ModalPaper: React.FC<IModalPaper> = React.memo(
  ({
    title,
    children,
    onClose,
    isCloseButton,
    isMobileFullScreen,
    ...otherProps
  }) => {
    const { resizeMode } = useAppSelector((state) => state.ui);
    const isMobile = ['mobile', 'mobileS', 'mobileM', 'mobileL'].includes(
      resizeMode
    );

    return (
      <SModalWrapper>
        <SModal
          onClick={preventParentClick()}
          {...otherProps}
          $isMobileFullScreen={isMobileFullScreen}
        >
          {(title || (isMobileFullScreen && isMobile)) && (
            <SModalHeader>
              {isMobile && isMobileFullScreen && (
                <GoBackButton onClick={onClose} />
              )}
              {title && <SModalTitle>{title}</SModalTitle>}
            </SModalHeader>
          )}
          {isCloseButton && (
            <SCloseButton onClick={onClose}>
              <InlineSvg svg={CloseIcon} />
            </SCloseButton>
          )}
          {children}
        </SModal>
      </SModalWrapper>
    );
  }
);

ModalPaper.defaultProps = {
  isMobileFullScreen: false,
  isCloseButton: false,
};

export default ModalPaper;

const SModalWrapper = styled.div`
  display: flex;
  height: 100%;
  justify-content: center;
  align-items: center;
`;

const SModal = styled.div<{
  $isMobileFullScreen?: boolean;
}>`
  position: relative;
  display: flex;
  flex-direction: column;

  padding: 0 16px 16px;
  box-sizing: border-box;
  overflow: auto;
  z-index: 1;
  width: 100%;

  line-height: 24px;
  background: ${(props) =>
    props.theme.name === 'light'
      ? props.theme.colors.white
      : props.theme.colorsThemed.background.secondary};
  color: ${(props) =>
    props.theme.name === 'light'
      ? props.theme.colorsThemed.text.primary
      : props.theme.colors.white};

  ${({ $isMobileFullScreen }) =>
    $isMobileFullScreen
      ? css`
          height: 100%;
        `
      : css`
          height: auto;
          max-width: 480px;
        `}

  ${(props) => props.theme.media.tablet} {
    height: auto;
    padding: 24px;
    max-width: 480px;
    border-radius: ${(props) => props.theme.borderRadius.medium};
  }
`;

const SModalHeader = styled.div`
  display: flex;
  height: 58px;
  align-items: center;
  margin-bottom: 16px;
  flex-shrink: 0;
  ${(props) => props.theme.media.tablet} {
    display: block;
    height: auto;
    margin: 0 0 24px;
  }
`;

const SCloseButton = styled.div`
  position: absolute;
  top: 24px;
  right: 24px;
  color: white;
  cursor: pointer;
`;

const SModalTitle = styled.strong`
  font-size: 14px;
  margin: 0;
  font-weight: 600;
  ${(props) => props.theme.media.tablet} {
    font-size: 20px;
    margin-bottom: 16px;
  }
`;
