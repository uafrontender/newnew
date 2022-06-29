import { AnimatePresence, motion } from 'framer-motion';
import React, { useRef } from 'react';
import { useTranslation } from 'next-i18next';
import styled from 'styled-components';

import useOnClickEsc from '../../../utils/hooks/useOnClickEsc';
import useOnClickOutside from '../../../utils/hooks/useOnClickOutside';
import Text from '../../atoms/Text';

interface ICardEllipseMenu {
  isVisible: boolean;
  isPrimary: boolean;
  top?: string;
  right?: string;
  handleClose: () => void;
}

const CardEllipseMenu: React.FC<ICardEllipseMenu> = ({
  isVisible,
  isPrimary,
  top,
  right,
  handleClose,
}) => {
  const { t } = useTranslation('page-Profile');
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
          top={top ?? undefined}
          right={right ?? undefined}
          onClick={(e) => e.stopPropagation()}
        >
          {!isPrimary && (
            <SButton>
              <Text variant={2}>
                {t('Settings.sections.cards.ellipse.makePrimary')}
              </Text>
            </SButton>
          )}
          <SButton>
            <Text variant={2} tone='error'>
              {t('Settings.sections.cards.ellipse.removeCard')}
            </Text>
          </SButton>
        </SContainer>
      )}
    </AnimatePresence>
  );
};

export default CardEllipseMenu;

const SContainer = styled(motion.div)<{
  top?: string;
  right?: string;
}>`
  position: absolute;
  top: ${({ top }) => top ?? '50px'};
  right: ${({ right }) => right ?? '16px'};
  z-index: 10;
  min-width: 180px;

  display: flex;
  flex-direction: column;
  align-items: flex-start;
  padding: 8px;
  border-radius: ${({ theme }) => theme.borderRadius.medium};

  background: ${(props) =>
    props.theme.name === 'light'
      ? props.theme.colors.white
      : props.theme.colorsThemed.background.tertiary};

  ${({ theme }) => theme.media.laptop} {
    top: ${({ top }) => top ?? '312px'};
    right: ${({ right }) => right ?? '0px'};
  }
`;

const SButton = styled.button`
  background: none;
  border: transparent;
  text-align: left;
  width: 100%;
  cursor: pointer;
  padding: 8px;
  box-sizing: border-box;
  border-radius: ${({ theme }) => theme.borderRadius.smallLg};
  &:focus {
    outline: none;
  }
  &:hover {
    background-color: ${({ theme }) => theme.colorsThemed.background.quinary};
  }
`;
