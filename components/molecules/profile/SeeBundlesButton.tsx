import React, { useState } from 'react';
import { newnewapi } from 'newnew-api';
import styled, { useTheme } from 'styled-components';

import { useTranslation } from 'next-i18next';
import BuyBundleModal from '../bundles/BuyBundleModal';
import VoteIconLight from '../../../public/images/decision/vote-icon-light.png';
import VoteIconDark from '../../../public/images/decision/vote-icon-dark.png';
import CreatorsBundleModal from '../bundles/CreatorsBundleModal';

interface ISeeBundlesButton {
  className?: string;
  user: newnewapi.IUser;
  creatorsBundle?: newnewapi.ICreatorBundle;
}

const SeeBundlesButton: React.FC<ISeeBundlesButton> = ({
  className,
  user,
  creatorsBundle,
}) => {
  const theme = useTheme();
  const { t } = useTranslation('page-Profile');
  const [buyBundleModalOpen, setBuyBundleModalOpen] = useState(false);
  const [creatorsBundleModalOpen, setCreatorsBundleModalOpen] = useState(false);

  if (
    !user.options?.isCreator ||
    (!user.options.isOfferingBundles && !creatorsBundle)
  ) {
    return null;
  }

  return (
    <>
      {creatorsBundle ? (
        <SButton
          className={className}
          onClick={() => {
            setCreatorsBundleModalOpen(true);
          }}
        >
          <SBundleIcon
            src={theme.name === 'light' ? VoteIconLight.src : VoteIconDark.src}
          />
          {t('profileLayout.buttons.votesLeft', {
            amount: creatorsBundle?.bundle?.votesLeft,
          })}
        </SButton>
      ) : (
        <SButton
          highlighted
          className={className}
          onClick={() => {
            setBuyBundleModalOpen(true);
          }}
        >
          {t('profileLayout.buttons.buyBundles')}
        </SButton>
      )}

      {creatorsBundle && (
        <CreatorsBundleModal
          show={creatorsBundleModalOpen}
          creatorBundle={creatorsBundle}
          onBuyMore={() => {
            setBuyBundleModalOpen(true);
          }}
          onClose={() => {
            setCreatorsBundleModalOpen(false);
          }}
        />
      )}
      <BuyBundleModal
        show={buyBundleModalOpen}
        creator={user}
        onClose={() => {
          setBuyBundleModalOpen(false);
          setCreatorsBundleModalOpen(false);
        }}
      />
    </>
  );
};

export default SeeBundlesButton;

const SButton = styled.button<{ highlighted?: boolean }>`
  display: flex;
  align-items: center;
  justify-content: center;

  white-space: nowrap;

  font-size: 14px;
  line-height: 24px;
  font-weight: bold;

  padding: ${({ highlighted }) => (highlighted ? '12px 24px' : '12px 16px')};

  color: ${({ theme, highlighted }) =>
    highlighted ? theme.colors.darkGray : theme.colorsThemed.text.primary};
  background: ${({ theme, highlighted }) =>
    highlighted
      ? theme.colorsThemed.accent.yellow
      : theme.colorsThemed.background.quinary};
  border-radius: ${({ theme }) => theme.borderRadius.medium};
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

const SBundleIcon = styled.img`
  width: 24px;
  height: 24px;
  margin-right: 4px;
`;
