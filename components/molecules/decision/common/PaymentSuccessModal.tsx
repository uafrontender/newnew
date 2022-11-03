import React from 'react';
import { useTranslation } from 'next-i18next';
import styled, { css, useTheme } from 'styled-components';

import Button from '../../../atoms/Button';
import Modal from '../../../organisms/Modal';
import Headline from '../../../atoms/Headline';

import { TPostType } from '../../../../utils/switchPostType';

import assets from '../../../../constants/assets';
import VoteAnimationBackground from '../../../atoms/VoteAnimationBackground';

const DARK_IMAGES: any = {
  ac: assets.creation.darkAcStatic,
  cf: assets.creation.darkCfStatic,
  mc: assets.floatingAssets.darkVotes,
};

const LIGHT_IMAGES: any = {
  ac: assets.creation.lightAcStatic,
  cf: assets.creation.lightCfStatic,
  mc: assets.floatingAssets.lightVotes,
};
interface IPaymentSuccessModal {
  postType: TPostType;
  isVisible: boolean;
  children: React.ReactNode;
  closeModal: () => void;
}

const PaymentSuccessModal: React.FC<IPaymentSuccessModal> = ({
  postType,
  isVisible,
  children,
  closeModal,
}) => {
  const { t } = useTranslation('modal-Post');
  const theme = useTheme();

  return (
    <Modal show={isVisible} additionalz={14} onClose={closeModal}>
      {/* TODO: add animation for bids as well? */}
      {postType === 'mc' ? <VoteAnimationBackground /> : null}
      <SContainer onClick={(e) => e.stopPropagation()}>
        <SModal>
          <SImageWrapper>
            <SImg
              src={
                theme.name === 'light'
                  ? LIGHT_IMAGES[postType]
                  : DARK_IMAGES[postType]
              }
              alt='Post type'
              postType={postType}
            />
          </SImageWrapper>
          <SModalTitle variant={6}>
            {t(`paymentSuccessModal.title.${postType}`)}
          </SModalTitle>
          <SModalMessage>{children}</SModalMessage>
          <SDoneButton
            id='paymentSuccess'
            onClick={closeModal}
            view='primaryGrad'
          >
            {t('paymentSuccessModal.doneButton')}
          </SDoneButton>
        </SModal>
      </SContainer>
    </Modal>
  );
};

export default PaymentSuccessModal;

const SContainer = styled.div`
  display: flex;
  height: 100%;
  justify-content: center;
  align-items: center;
`;

const SModal = styled.div`
  position: relative;

  max-width: 480px;
  width: 100%;
  background: ${(props) =>
    props.theme.name === 'light'
      ? props.theme.colorsThemed.background.primary
      : props.theme.colorsThemed.background.secondary};
  border-radius: ${(props) => props.theme.borderRadius.large};
  color: ${(props) =>
    props.theme.name === 'light'
      ? props.theme.colorsThemed.text.primary
      : props.theme.colors.white};
  padding: 40px;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  line-height: 24px;
`;

const SModalTitle = styled(Headline)`
  margin-bottom: 16px;
  text-align: center;
`;

const SModalMessage = styled.p`
  text-align: center;
  color: ${({ theme }) => theme.colorsThemed.text.secondary};
  font-weight: 500;
  font-size: 16px;
  line-height: 24px;
  margin-bottom: 24px;
`;

const SDoneButton = styled(Button)`
  width: 100%;
`;

const SImageWrapper = styled.div`
  width: 150px;
  height: 150px;
  margin: 0 auto 32px;
  position: relative;
`;

const SImg = styled.img<{
  postType: TPostType;
}>`
  position: absolute;
  left: 50%;
  transform: translate(-50%);
  bottom: 0;
  object-fit: contain;

  ${({ postType }) => {
    switch (postType) {
      case 'ac': {
        return css`
          width: 180px;
          height: 180px;
          left: 0;
          transform: none;
        `;
      }
      case 'mc': {
        return css`
          width: 136px;
          height: 122px;
        `;
      }
      case 'cf': {
        return css`
          width: 129px;
          height: 168px;
        `;
      }
      default: {
        return css`
          width: 150px;
          height: 150px;
        `;
      }
    }
  }}
`;
