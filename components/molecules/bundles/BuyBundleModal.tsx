/* eslint-disable react/no-array-index-key */
import React, { useState } from 'react';
import { useTranslation } from 'next-i18next';
import styled from 'styled-components';
import { newnewapi } from 'newnew-api';

import preventParentClick from '../../../utils/preventParentClick';
import Modal from '../../organisms/Modal';
import ModalPaper from '../../organisms/ModalPaper';
import UserAvatar from '../UserAvatar';
import BundleOfferCard from './BunldeOfferCard';
import { useAppSelector } from '../../../redux-store/store';
import BundlePaymentModal from './BundlePaymentModal';

// Load from app constants
const OFFERED_BUNDLES: newnewapi.BundleOffer[] = [
  new newnewapi.BundleOffer({
    bundleUuid: '1',
    price: new newnewapi.MoneyAmount({ usdCents: 500 }),
    votesAmount: 100,
    accessDurationInSeconds: 60 * 60 * 24 * 30,
  }),
  new newnewapi.BundleOffer({
    bundleUuid: '2',
    price: new newnewapi.MoneyAmount({ usdCents: 2500 }),
    votesAmount: 4500,
    accessDurationInSeconds: 60 * 60 * 24 * 30 * 3,
  }),
  new newnewapi.BundleOffer({
    bundleUuid: '3',
    price: new newnewapi.MoneyAmount({ usdCents: 5000 }),
    votesAmount: 10000,
    accessDurationInSeconds: 60 * 60 * 24 * 30 * 6,
  }),
  new newnewapi.BundleOffer({
    bundleUuid: '4',
    price: new newnewapi.MoneyAmount({ usdCents: 7500 }),
    votesAmount: 20000,
    accessDurationInSeconds: 60 * 60 * 24 * 30 * 12,
  }),
];

interface IBuyBundleModal {
  show: boolean;
  creator: newnewapi.IUser;
  onClose: () => void;
}

const BuyBundleModal: React.FC<IBuyBundleModal> = React.memo(
  ({ show, creator, onClose }) => {
    const { t } = useTranslation('common');
    const { resizeMode } = useAppSelector((state) => state.ui);
    const isMobile = ['mobile', 'mobileS', 'mobileM', 'mobileL'].includes(
      resizeMode
    );

    const [bundleToBuy, setBundleToBuy] = useState<
      newnewapi.IBundleOffer | undefined
    >();

    return (
      <>
        <Modal show={show} onClose={onClose}>
          <SModalPaper
            title={!isMobile ? t('modal.buyBundle.title') : undefined}
            onClose={onClose}
            onClick={preventParentClick()}
            isCloseButton
            isMobileFullScreen={isMobile}
          >
            <Content>
              {isMobile && (
                <SMobileTitle>{t('modal.buyBundle.title')}</SMobileTitle>
              )}
              <SUserAvatar avatarUrl={creator.avatarUrl ?? ''} />
              <SUsername>{creator.username}</SUsername>
              <SOfferedBundleList>
                {OFFERED_BUNDLES.map((bundle, index) => (
                  <SBundleOfferCard
                    key={bundle.bundleUuid}
                    bundleLevel={index}
                    bundleOffer={bundle}
                    onClick={() => setBundleToBuy(bundle)}
                  />
                ))}
              </SOfferedBundleList>
              <Terms>{t('modal.buyBundle.terms')}</Terms>
            </Content>
          </SModalPaper>
        </Modal>
        {bundleToBuy && (
          <BundlePaymentModal
            creator={creator}
            bundleOffer={bundleToBuy}
            onClose={() => setBundleToBuy(undefined)}
          />
        )}
      </>
    );
  }
);

export default BuyBundleModal;

const SModalPaper = styled(ModalPaper)`
  width: 100%;

  ${({ theme }) => theme.media.tablet} {
    max-width: 550px;
  }

  ${({ theme }) => theme.media.laptop} {
    max-width: 1100px;
  }
`;

const Content = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const SMobileTitle = styled.h1`
  color: ${(props) => props.theme.colorsThemed.text.primary};
  font-weight: 700;
  font-size: 24px;
  line-height: 32px;
  margin-top: 24px;
  margin-bottom: 48px;
  width: 100%;
`;

const SUserAvatar = styled(UserAvatar)`
  width: 48px;
  height: 48px;
  border-radius: 50%;
  margin-bottom: 8px;

  ${({ theme }) => theme.media.laptop} {
    width: 64px;
    height: 64px;
  }
`;

const SUsername = styled.h4`
  color: ${(props) => props.theme.colorsThemed.text.primary};
  font-weight: 700;
  font-size: 20px;
  line-height: 28px;
  margin-bottom: 16px;

  ${({ theme }) => theme.media.laptop} {
    font-size: 24px;
    line-height: 32px;
    margin-bottom: 24px;
  }
`;

const SOfferedBundleList = styled.div`
  width: 100%;
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 16px;

  ${({ theme }) => theme.media.laptop} {
    gap: 20px;
    margin-bottom: 24px;
  }
`;

const SBundleOfferCard = styled(BundleOfferCard)`
  width: 100%;

  ${({ theme }) => theme.media.tablet} {
    width: calc(50% - 8px);
  }

  ${({ theme }) => theme.media.laptop} {
    width: calc(25% - 15px);
  }
`;

const Terms = styled.p`
  color: ${(props) => props.theme.colorsThemed.text.secondary};
  font-weight: 600;
  font-size: 14px;
  line-height: 24px;

  width: 100%;
  text-align: center;
`;
