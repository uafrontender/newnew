import React from 'react';
import styled, { css, useTheme } from 'styled-components';
import dynamic from 'next/dynamic';

import InlineSvg from '../atoms/InlineSVG';

import CloseIcon from '../../public/images/svg/icons/outlined/Close.svg';
import { useAppState } from '../../contexts/appStateContext';

const GoBackButton = dynamic(() => import('../molecules/GoBackButton'));

interface IModalPaper {
  className?: string;
  title?: React.ReactNode;
  children: React.ReactNode;
  isMobileFullScreen?: boolean;
  isCloseButton?: boolean;
  onClose: () => void;
  onClick?: (...params: any) => void;
}

const ModalPaper: React.FC<IModalPaper> = React.memo(
  ({
    className,
    title,
    children,
    isCloseButton,
    isMobileFullScreen,
    onClose,
    ...otherProps
  }) => {
    const theme = useTheme();
    const { resizeMode } = useAppState();
    const isMobile = ['mobile', 'mobileS', 'mobileM', 'mobileL'].includes(
      resizeMode
    );

    return (
      <SModalWrapper>
        <SModal
          className={className}
          {...otherProps}
          $isMobileFullScreen={isMobileFullScreen}
        >
          {isMobileFullScreen && isMobile && (
            <SFullScreenHeader>
              {isMobile && isMobileFullScreen && (
                <GoBackButton onClick={onClose} />
              )}
              {title && <SModalTitleFullScreen>{title}</SModalTitleFullScreen>}
            </SFullScreenHeader>
          )}
          {title && (!isMobile || !isMobileFullScreen) && (
            <SHeader>
              <SModalTitle>{title}</SModalTitle>
            </SHeader>
          )}
          {isCloseButton && !isMobileFullScreen && (
            <SCloseButton onClick={onClose}>
              <InlineSvg
                svg={CloseIcon}
                fill={theme.colorsThemed.text.primary}
                width='24px'
                height='24px'
              />
            </SCloseButton>
          )}
          <SContent>{children}</SContent>
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
  box-sizing: border-box;
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
          padding: 0 16px 16px;
        `
      : css`
          padding: 16px;
          height: auto;
          max-width: 480px;
          border-radius: ${(props) => props.theme.borderRadius.medium};
        `}

  ${(props) => props.theme.media.tablet} {
    height: auto;
    padding: 24px;
    max-width: 480px;
    border-radius: ${(props) => props.theme.borderRadius.medium};
    max-height: 90vh;
  }
`;

export const SContent = styled.div`
  overflow-y: scroll;
  padding-bottom: 16px;
  margin-bottom: -16px;

  ${(props) => props.theme.media.tablet} {
    padding-bottom: 24px;
    margin-bottom: -24px;
  }

  /* Hide scrollbar */
  ::-webkit-scrollbar {
    display: none;
  }
  scrollbar-width: none;
  -ms-overflow-style: none;
`;

const SFullScreenHeader = styled.div`
  display: flex;
  height: 60px;
  align-items: center;
  flex-shrink: 0;
`;

const SHeader = styled.div`
  display: flex;
  height: auto;
`;

const SCloseButton = styled.div`
  position: absolute;
  top: 24px;
  right: 24px;
  color: white;
  cursor: pointer;
  z-index: 1;
`;

const SModalTitleFullScreen = styled.strong`
  font-size: 14px;
  margin: 0;
  font-weight: 600;
  overflow: hidden;
`;

const SModalTitle = styled.strong`
  max-width: 100%;
  margin-bottom: 16px;

  font-size: 20px;
`;
