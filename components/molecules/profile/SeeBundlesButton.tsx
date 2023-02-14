import React, { useState } from 'react';
import { newnewapi } from 'newnew-api';
import styled, { useTheme } from 'styled-components';

import { useTranslation } from 'next-i18next';
import BuyBundleModal from '../bundles/BuyBundleModal';
import VoteIconLight from '../../../public/images/decision/vote-icon-light.png';
import VoteIconDark from '../../../public/images/decision/vote-icon-dark.png';
import CreatorsBundleModal from '../bundles/CreatorsBundleModal';
import { Mixpanel } from '../../../utils/mixpanel';

interface ISeeBundlesButton {
  className?: string;
  user: newnewapi.IUser;
  creatorBundle?: newnewapi.ICreatorBundle;
}

const SeeBundlesButton: React.FC<ISeeBundlesButton> = ({
  className,
  user,
  creatorBundle,
}) => {
  const theme = useTheme();
  const { t } = useTranslation('page-Profile');
  const [buyBundleModalOpen, setBuyBundleModalOpen] = useState(false);
  const [creatorsBundleModalOpen, setCreatorsBundleModalOpen] = useState(false);

  if (
    !user.options?.isCreator ||
    (!user.options.isOfferingBundles && !creatorBundle)
  ) {
    return null;
  }

  return (
    <>
      {creatorBundle ? (
        <SButton
          className={className}
          onClick={() => {
            setCreatorsBundleModalOpen(true);
          }}
          onClickCapture={() => {
            Mixpanel.track('Open Creators Bundle', {
              _stage: 'Profile',
              _creatorUuid: user.uuid,
              _component: 'SeeBundlesButton',
            });
          }}
        >
          <SBundleIcon
            src={theme.name === 'light' ? VoteIconLight.src : VoteIconDark.src}
          />
          {t('profileLayout.buttons.votesLeft', {
            amount: creatorBundle?.bundle?.votesLeft,
          })}
        </SButton>
      ) : (
        <SButton
          highlighted
          className={className}
          onClick={() => {
            setBuyBundleModalOpen(true);
          }}
          onClickCapture={() => {
            Mixpanel.track('Open Buy Creators Bundle Modal', {
              _stage: 'Profile',
              _creatorUuid: user.uuid,
              _component: 'SeeBundlesButton',
            });
          }}
        >
          {t('profileLayout.buttons.buyBundles')}
        </SButton>
      )}

      {creatorBundle && (
        <CreatorsBundleModal
          show={creatorsBundleModalOpen}
          creatorBundle={creatorBundle}
          type={buyBundleModalOpen ? 'covered' : 'initial'}
          onBuyMore={() => {
            Mixpanel.track('Open Buy Creators Bundle Modal', {
              _stage: 'Profile',
              _creatorUuid: user.uuid,
              _component: 'SeeBundlesButton',
            });
            setBuyBundleModalOpen(true);
          }}
          onClose={() => {
            setCreatorsBundleModalOpen(false);
          }}
        />
      )}
      <BuyBundleModal
        show={buyBundleModalOpen}
        type='following'
        creator={user}
        successPath={`/${user.username}`}
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
