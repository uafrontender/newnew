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
import PackPaymentModal from './PackPaymentModal';

interface IBuyPackModal {
  show: boolean;
  creator: newnewapi.IUser;
  offeredPacks: newnewapi.IPackOffer[];
  onClose: () => void;
}

const BuyPackModal: React.FC<IBuyPackModal> = React.memo(
  ({ show, creator, offeredPacks, onClose }) => {
    const { t } = useTranslation('common');
    const { resizeMode } = useAppSelector((state) => state.ui);
    const isMobile = ['mobile', 'mobileS', 'mobileM', 'mobileL'].includes(
      resizeMode
    );

    const [packToBuy, setPackToBuy] = useState<
      newnewapi.IPackOffer | undefined
    >();

    return (
      <>
        <Modal show={show} onClose={onClose}>
          <SModalPaper
            title={
              !isMobile
                ? t('modal.buyPack.title', { username: creator.username })
                : undefined
            }
            onClose={onClose}
            onClick={preventParentClick()}
            isCloseButton
            isMobileFullScreen={isMobile}
          >
            <Content>
              {isMobile && (
                <SMobileTitle>
                  {t('modal.buyPack.title', { username: creator.username })}
                </SMobileTitle>
              )}
              <SUserAvatar avatarUrl={creator.avatarUrl ?? ''} />
              <SUsername>{creator.username}</SUsername>
              <SOfferedPacksList>
                {offeredPacks.map((pack, index) => (
                  <SOfferCard
                    key={pack.packUuid}
                    packLevel={index}
                    packOffer={pack}
                    onClick={() => setPackToBuy(pack)}
                  />
                ))}
              </SOfferedPacksList>
              <Terms>{t('modal.buyPack.terms')}</Terms>
            </Content>
          </SModalPaper>
        </Modal>
        {packToBuy && (
          <PackPaymentModal
            creator={creator}
            pack={packToBuy}
            onClose={() => setPackToBuy(undefined)}
          />
        )}
      </>
    );
  }
);

export default BuyPackModal;

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
  width: 40px;
  height: 40px;
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

const SOfferedPacksList = styled.div`
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
