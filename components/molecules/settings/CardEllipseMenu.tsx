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
}

const CardEllipseMenu: React.FC<ICardEllipseMenu> = ({
  isVisible,
  isPrimary,
  anchorElement,
  handleClose,
}) => {
  const { t } = useTranslation('page-Profile');
  const containerRef = useRef<HTMLDivElement>();

  useOnClickEsc(containerRef, handleClose);
  useOnClickOutside(containerRef, handleClose);

  return (
    <EllipseMenu
      isOpen={isVisible}
      onClose={handleClose}
      anchorElement={anchorElement}
    > 
      {!isPrimary && (
        <EllipseMenuButton>
          {t('Settings.sections.cards.ellipse.makePrimary')}
        </EllipseMenuButton>
      )}
      <EllipseMenuButton tone='error'>
        {t('Settings.sections.cards.ellipse.removeCard')}
      </EllipseMenuButton>
    </EllipseMenu>
  );
};

export default CardEllipseMenu;

