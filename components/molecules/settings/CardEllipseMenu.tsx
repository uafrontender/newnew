import React, { useRef } from 'react';
import { useTranslation } from 'next-i18next';

import EllipseMenu, { EllipseMenuButton } from '../../atoms/EllipseMenu';

import useOnClickEsc from '../../../utils/hooks/useOnClickEsc';
import useOnClickOutside from '../../../utils/hooks/useOnClickOutside';

interface ICardEllipseMenu {
  isVisible: boolean;
  isPrimary: boolean;
  handleClose: () => void;
  anchorElement?: HTMLElement;
  onSetPrimaryCard: () => void;
  onDeleteCard: () => void;
}

const CardEllipseMenu: React.FC<ICardEllipseMenu> = ({
  isVisible,
  isPrimary,
  anchorElement,
  handleClose,
  onSetPrimaryCard,
  onDeleteCard,
}) => {
  const { t } = useTranslation('page-Profile');
  const containerRef = useRef<HTMLDivElement>();

  useOnClickEsc(containerRef, handleClose);
  useOnClickOutside(containerRef, handleClose);

  const handleSetPrimaryCard = () => {
    onSetPrimaryCard();
    handleClose();
  };

  const handleDeleteCard = () => {
    onDeleteCard();
    handleClose();
  };

  return (
    <EllipseMenu
      isOpen={isVisible}
      onClose={handleClose}
      anchorElement={anchorElement}
    >
      {!isPrimary && (
        <EllipseMenuButton onClick={handleSetPrimaryCard}>
          {t('Settings.sections.cards.ellipse.makePrimary')}
        </EllipseMenuButton>
      )}
      <EllipseMenuButton tone='error' onClick={handleDeleteCard}>
        {t('Settings.sections.cards.ellipse.removeCard')}
      </EllipseMenuButton>
    </EllipseMenu>
  );
};

export default CardEllipseMenu;
