import React, { useState } from 'react';
import { newnewapi } from 'newnew-api';
import styled from 'styled-components';

import { useTranslation } from 'next-i18next';
import BuyBundleModal from '../bundles/BuyBundleModal';

interface ISeeBundlesButton {
  className?: string;
  creator: newnewapi.IUser;
}

const SeeBundlesButton: React.FC<ISeeBundlesButton> = ({
  className,
  creator,
}) => {
  const { t } = useTranslation('page-Profile');
  const [buyBundleModalOpen, setBuyBundleModalOpen] = useState(false);

  return (
    <>
      <SButton
        className={className}
        onClick={() => {
          setBuyBundleModalOpen(true);
        }}
      >
        {t('profileLayout.buttons.viewBundles')}
      </SButton>
      <BuyBundleModal
        show={buyBundleModalOpen}
        creator={creator}
        onClose={() => {
          setBuyBundleModalOpen(false);
        }}
      />
    </>
  );
};

export default SeeBundlesButton;

const SButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;

  white-space: nowrap;

  font-size: 14px;
  line-height: 24px;
  font-weight: bold;

  padding: 12px 16px;

  color: ${({ theme }) => theme.colors.darkGray};
  background: ${({ theme }) => theme.colorsThemed.accent.yellow};
  border-radius: ${(props) => props.theme.borderRadius.medium};
  border: transparent;

  cursor: pointer;

  /* No select */
  -webkit-touch-callout: none;
  -webkit-user-select: none;
  -khtml-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  user-select: none;
`;
