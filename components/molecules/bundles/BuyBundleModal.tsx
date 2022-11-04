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
import { useGetAppConstants } from '../../../contexts/appConstantsContext';

interface IBuyBundleModal {
  show: boolean;
  creator: newnewapi.IUser;
  successUrl: string;
  onClose: () => void;
}

const BuyBundleModal: React.FC<IBuyBundleModal> = React.memo(
  ({ show, creator, successUrl, onClose }) => {
    const { t } = useTranslation('common');
    const { resizeMode } = useAppSelector((state) => state.ui);
    const { appConstants } = useGetAppConstants();
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
                {appConstants.bundleOffers?.map((bundleOffer, index) => (
                  <SBundleOfferCard
                    key={bundleOffer.bundleUuid}
                    bundleLevel={index}
                    bundleOffer={bundleOffer}
                    onClick={() => setBundleToBuy(bundleOffer)}
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
            successUrl={successUrl}
            onClose={() => setBundleToBuy(undefined)}
            onCloseSuccessModal={() => onClose()}
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
