/* eslint-disable react/require-default-props */
import { AnimatePresence, motion } from 'framer-motion';
import React, { useEffect, useRef, useState } from 'react';
import ReactDOM from 'react-dom';
import { useTranslation } from 'next-i18next';
import styled from 'styled-components';
import { newnewapi } from 'newnew-api';

import Text from '../../atoms/Text';

import useOnClickEsc from '../../../utils/hooks/useOnClickEsc';
import useOnClickOutside from '../../../utils/hooks/useOnClickOutside';
import isBrowser from '../../../utils/isBrowser';
import { checkCanDeleteMcOption } from '../../../api/endpoints/multiple_choice';
import { checkCanDeleteAcOption } from '../../../api/endpoints/auction';

interface IOptionMenu {
  xy: {
    x: number;
    y: number;
  };
  isVisible: boolean;
  optionId?: number;
  optionCreatorUuid?: string;
  optionType?: 'ac' | 'mc';
  isMyOption?: boolean;
  handleClose: () => void;
  handleOpenReportOptionModal: () => void;
  handleOpenRemoveOptionModal?: () => void;
}

const OptionMenu: React.FunctionComponent<IOptionMenu> = ({
  xy,
  isVisible,
  isMyOption,
  optionType,
  optionId,
  optionCreatorUuid,
  handleClose,
  handleOpenReportOptionModal,
  handleOpenRemoveOptionModal,
}) => {
  const { t } = useTranslation('decision');
  const containerRef = useRef<HTMLDivElement>();

  useOnClickEsc(containerRef, handleClose);
  useOnClickOutside(containerRef, handleClose);

  const [canDeleteOption, setCanDeleteOption] = useState(false);
  const [isCanDeleteOptionLoading, setIsCanDeleteOptionLoading] =
    useState(false);

  useEffect(() => {
    if (isBrowser()) {
      const container = document.getElementById('post-modal-container');
      if (container)
        if (isVisible) {
          container.style.overflowY = 'hidden';
        } else {
          container.style.overflowY = '';
        }
    }
  }, [isVisible]);

  useEffect(() => {
    async function fetchCanDelete() {
      setIsCanDeleteOptionLoading(true);
      try {
        let canDelete = false;
        if (optionType === 'ac') {
          const payload = new newnewapi.CanDeleteAcOptionRequest({
            optionId,
          });

          const res = await checkCanDeleteAcOption(payload);

          if (res.data) {
            canDelete = res.data.canDelete;
          }
        } else {
          const payload = new newnewapi.CanDeleteMcOptionRequest({
            optionId,
          });

          const res = await checkCanDeleteMcOption(payload);

          if (res.data) {
            canDelete = res.data.canDelete;
          }
        }

        setCanDeleteOption(canDelete);
      } catch (err) {
        console.error(err);
      }
      setIsCanDeleteOptionLoading(false);
    }

    if (isVisible && isMyOption) {
      fetchCanDelete();
    }
  }, [isVisible, isMyOption, optionType, optionId, optionCreatorUuid]);

  if (!isVisible) return null;

  if (isBrowser()) {
    return ReactDOM.createPortal(
      <StyledModalOverlay>
        <AnimatePresence>
          {isVisible && (
            <SContainer
              ref={(el) => {
                containerRef.current = el!!;
              }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              style={{
                left: `${xy.x}px`,
                top: `${xy.y}px`,
              }}
            >
              {isMyOption && (
                <SButton
                  onClick={() => {
                    handleOpenRemoveOptionModal?.();
                    handleClose();
                  }}
                  disabled={!canDeleteOption || isCanDeleteOptionLoading}
                >
                  <Text variant={3} tone='error'>
                    {t('ellipse-option.delete-option')}
                  </Text>
                </SButton>
              )}
              {!isMyOption && (
                <SButton
                  onClick={() => {
                    handleOpenReportOptionModal();
                    handleClose();
                  }}
                >
                  <Text variant={3} tone='error'>
                    {t('ellipse-option.report-option')}
                  </Text>
                </SButton>
              )}
            </SContainer>
          )}
        </AnimatePresence>
      </StyledModalOverlay>,
      document.getElementById('modal-root') as HTMLElement
    );
  }

  return null;
};

export default OptionMenu;

const SContainer = styled(motion.div)`
  position: absolute;
  top: 50px;
  z-index: 10;

  width: 120px;

  display: flex;
  flex-direction: column;
  align-items: flex-start;

  padding: 8px;
  border-radius: ${({ theme }) => theme.borderRadius.medium};

  background-color: ${({ theme }) => theme.colorsThemed.background.primary};
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
    background-color: ${({ theme }) => theme.colorsThemed.background.secondary};
  }

  &:disabled {
    opacity: 0.5;
    cursor: default;
  }
`;

const StyledModalOverlay = styled(motion.div)`
  left: 0;
  width: 100vw;
  height: 100vh;
  bottom: 0;
  z-index: 10;
  overflow: hidden;
  position: fixed;

  background-color: transparent;
`;
