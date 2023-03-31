/* eslint-disable react/no-array-index-key */
import React, { useState } from 'react';
import { useTranslation } from 'next-i18next';
import styled from 'styled-components';
import { newnewapi } from 'newnew-api';

import preventParentClick from '../../../utils/preventParentClick';
import Modal, { ModalType } from '../../organisms/Modal';
import ModalPaper from '../../organisms/ModalPaper';
import UserAvatar from '../UserAvatar';
import BundleOfferCard from './BunldeOfferCard';
import BundlePaymentModal from './BundlePaymentModal';
import { useGetAppConstants } from '../../../contexts/appConstantsContext';
import { useAppState } from '../../../contexts/appStateContext';
import DisplayName from '../../atoms/DisplayName';

interface IBuyBundleModal {
  show: boolean;
  creator: newnewapi.IUser;
  successPath: string;
  modalType?: ModalType;
  additionalZ?: number;
  onClose: () => void;
  onSuccess?: () => void;
}

const BuyBundleModal: React.FC<IBuyBundleModal> = React.memo(
  ({
    show,
    modalType,
    creator,
    successPath,
    additionalZ,
    onClose,
    onSuccess,
  }) => {
    const { t } = useTranslation('common');
    const { resizeMode } = useAppState();
    const { appConstants } = useGetAppConstants();
    const isMobile = ['mobile', 'mobileS', 'mobileM', 'mobileL'].includes(
      resizeMode
    );

    const [bundleToBuy, setBundleToBuy] = useState<
      newnewapi.IBundleOffer | undefined
    >();

    return (
      <>
        <Modal
          show={show}
          modalType={bundleToBuy !== undefined ? 'covered' : modalType}
          {...(additionalZ
            ? {
                additionalz: additionalZ,
              }
            : {})}
          onClose={onClose}
        >
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
              <SDisplayName user={creator} />
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
            {...(additionalZ
              ? {
                  additionalZ: additionalZ + 1,
                }
              : {})}
            successPath={successPath}
            modalType='following'
            onClose={() => setBundleToBuy(undefined)}
            onCloseSuccessModal={() => {
              if (onSuccess) {
                onSuccess();
              }

              onClose();
            }}
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

const SDisplayName = styled(DisplayName)`
  color: ${(props) => props.theme.colorsThemed.text.primary};
  font-weight: 700;
  font-size: 20px;
  line-height: 28px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;

  margin-bottom: 16px;
  max-width: 100%;

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
