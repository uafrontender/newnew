/* eslint-disable react/no-array-index-key */
import React, { useState } from 'react';
import { useTranslation } from 'next-i18next';
import styled from 'styled-components';
import { newnewapi } from 'newnew-api';

import preventParentClick from '../../../utils/preventParentClick';
import Modal from '../../organisms/Modal';
import ModalPaper from '../../organisms/ModalPaper';
import UserAvatar from '../UserAvatar';
import OfferCard from './OfferCard';
import { useAppSelector } from '../../../redux-store/store';
import BundlePaymentModal from './BundlePaymentModal';

// Load from app constants
const OFFERED_BUNDLES: newnewapi.PackOffer[] = [
  new newnewapi.PackOffer({
    packUuid: '1',
    price: new newnewapi.MoneyAmount({ usdCents: 500 }),
    votesAmount: 500,
    accessDurationInSeconds: 60 * 60 * 24 * 30,
  }),
  new newnewapi.PackOffer({
    packUuid: '2',
    price: new newnewapi.MoneyAmount({ usdCents: 2500 }),
    votesAmount: 500,
    accessDurationInSeconds: 60 * 60 * 24 * 30 * 2,
  }),
  new newnewapi.PackOffer({
    packUuid: '3',
    price: new newnewapi.MoneyAmount({ usdCents: 5000 }),
    votesAmount: 500,
    accessDurationInSeconds: 60 * 60 * 24 * 30 * 3,
  }),
  new newnewapi.PackOffer({
    packUuid: '4',
    price: new newnewapi.MoneyAmount({ usdCents: 7500 }),
    votesAmount: 500,
    accessDurationInSeconds: 60 * 60 * 24 * 30 * 4,
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
      newnewapi.IPackOffer | undefined
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
                  <SOfferCard
                    key={bundle.packUuid}
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
            bundle={bundleToBuy}
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
  margin-bottom: 48px;
  width: 100%;
`;

const SUserAvatar = styled(UserAvatar)`
  width: 64px;
  height: 64px;
  border-radius: 50%;
  margin-bottom: 8px;
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
  gap: 20px;
  margin-bottom: 16px;
`;

const SOfferCard = styled(OfferCard)`
  width: 100%;

  ${({ theme }) => theme.media.tablet} {
    width: calc(50% - 10px);
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
