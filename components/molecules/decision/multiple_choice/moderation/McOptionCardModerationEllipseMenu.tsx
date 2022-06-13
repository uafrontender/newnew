import { AnimatePresence, motion } from 'framer-motion';
import React, { useRef } from 'react';
import { useTranslation } from 'next-i18next';
import styled from 'styled-components';

import Text from '../../../../atoms/Text';

import useOnClickEsc from '../../../../../utils/hooks/useOnClickEsc';
import useOnClickOutside from '../../../../../utils/hooks/useOnClickOutside';

interface IMcOptionCardModerationEllipseMenu {
  isVisible: boolean;
  isBySubscriber: boolean;
  canBeDeleted: boolean;
  handleClose: () => void;
  handleOpenReportOptionModal: () => void;
  handleOpenBlockUserModal: () => void;
  handleOpenRemoveOptionModal: () => void;
}

const McOptionCardModerationEllipseMenu: React.FunctionComponent<IMcOptionCardModerationEllipseMenu> =
  ({
    isVisible,
    isBySubscriber,
    canBeDeleted,
    handleClose,
    handleOpenReportOptionModal,
    handleOpenBlockUserModal,
    handleOpenRemoveOptionModal,
  }) => {
    const { t } = useTranslation('common');
    const containerRef = useRef<HTMLDivElement>();

    useOnClickEsc(containerRef, handleClose);
    useOnClickOutside(containerRef, handleClose);

    return (
      <AnimatePresence>
        {isVisible && (
          <SContainer
            ref={(el) => {
              containerRef.current = el!!;
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {isBySubscriber ? (
              <>
                <SButton
                  onClick={() => {
                    handleOpenReportOptionModal();
                    handleClose();
                  }}
                >
                  <Text variant={3} tone='error'>
                    {t('ellipse.reportOption')}
                  </Text>
                </SButton>
                <SButton
                  onClick={() => {
                    handleOpenBlockUserModal();
                    handleClose();
                  }}
                >
                  <Text variant={3}>{t('ellipse.blockUser')}</Text>
                </SButton>
              </>
            ) : null}
            <SButton
              disabled={!canBeDeleted}
              onClick={() => {
                handleOpenRemoveOptionModal();
                handleClose();
              }}
            >
              <Text variant={3}>{t('ellipse.removeOption')}</Text>
            </SButton>
          </SContainer>
        )}
      </AnimatePresence>
    );
  };

export default McOptionCardModerationEllipseMenu;

const SContainer = styled(motion.div)`
  position: absolute;
  top: 50px;
  z-index: 10;
  right: 16px;

  width: 150px;

  display: flex;
  flex-direction: column;
  align-items: flex-start;

  padding: 8px;
  border-radius: ${({ theme }) => theme.borderRadius.medium};

  background-color: ${({ theme }) => theme.colorsThemed.background.tertiary};

  ${({ theme }) => theme.media.laptop} {
    right: 16px;
  }
`;

const SButton = styled.button`
  background: none;
  border: transparent;

  padding: 8px;
  border-radius: 12px;

  width: 100%;

  text-align: left;

  cursor: pointer;
  transition: 0.2s linear;

  &:focus,
  &:hover {
    outline: none;
  }

  &:focus:enabled,
  &:hover:enabled {
    outline: none;
    background-color: ${({ theme }) => theme.colorsThemed.background.quinary};
  }

  &:disabled {
    opacity: 0.5;
    cursor: default;
  }
`;
