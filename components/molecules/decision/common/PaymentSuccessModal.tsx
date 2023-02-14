import React, { useCallback } from 'react';
import { useTranslation } from 'next-i18next';
import styled, { css, useTheme } from 'styled-components';

import Button from '../../../atoms/Button';
import Modal, { ModalType } from '../../../organisms/Modal';

import { TPostType } from '../../../../utils/switchPostType';

import assets from '../../../../constants/assets';
import AnimatedBackground from '../../../atoms/AnimationBackground';
import TicketSet from '../../../atoms/bundles/TicketSet';
import { formatNumber } from '../../../../utils/format';
import { Mixpanel } from '../../../../utils/mixpanel';

interface IPaymentSuccessModal {
  postType: TPostType;
  show: boolean;
  // TODO: add information about value for guest buying stuff related cases (no data now). Make field mandatory.
  value?: number;
  type?: ModalType;
  children: React.ReactNode;
  closeModal: () => void;
}

const PaymentSuccessModal: React.FC<IPaymentSuccessModal> = ({
  postType,
  show,
  value,
  type,
  children,
  closeModal,
}) => {
  const { t } = useTranslation('page-Post');
  const theme = useTheme();

  const handleCloseModalMixpanel = useCallback(() => {
    Mixpanel.track('Close Payment Success Modal', {
      _stage: 'Payment',
      _component: 'PaymentSuccessModal',
    });
    closeModal();
  }, [closeModal]);

  function getModalImage(typeOfPost: TPostType) {
    switch (typeOfPost) {
      case 'ac':
        return (
          <SImageWrapper>
            <SImg
              src={
                theme.name === 'light'
                  ? assets.common.ac.lightAcStatic
                  : assets.common.ac.darkAcStatic
              }
              alt='Post type'
              postType={postType}
            />
          </SImageWrapper>
        );
      case 'mc':
        return <STicketSet numberOFTickets={3} size={100} shift={27} />;
      case 'cf':
        return (
          <SImageWrapper>
            <SImg
              src={
                theme.name === 'light'
                  ? assets.creation.lightCfStatic
                  : assets.creation.darkCfStatic
              }
              alt='Post type'
              postType={postType}
            />
          </SImageWrapper>
        );
      default:
        throw new Error(`unknown post type ${typeOfPost}`);
    }
  }

  function getFormattedValue(valueToFormat: number, typeOfPost: TPostType) {
    switch (typeOfPost) {
      case 'ac':
        return `$${formatNumber(valueToFormat / 100, true)}`;
      case 'mc':
        return `${formatNumber(valueToFormat, true)}`;
      case 'cf':
        return `$${formatNumber(valueToFormat / 100, true)}`;
      default:
        throw new Error(`unknown post type ${typeOfPost}`);
    }
  }

  return (
    <Modal
      show={show}
      type={type}
      additionalz={14}
      onClose={handleCloseModalMixpanel}
    >
      {postType === 'mc' ? (
        <AnimatedBackground src={assets.decision.votes} alt='vote' />
      ) : (
        <AnimatedBackground src={assets.decision.gold} alt='coin' />
      )}
      <SContainer onClick={(e) => e.stopPropagation()}>
        <SModal>
          {getModalImage(postType)}
          {value && (
            <SModalValue highlighted={postType === 'mc'}>
              {getFormattedValue(value, postType)}
            </SModalValue>
          )}
          <SModalTitle>
            {t(
              `paymentSuccessModal.title.${postType}${
                postType === 'mc' && value === 1 ? '-single' : ''
              }` as any
            )}
          </SModalTitle>
          <SModalMessage>{children}</SModalMessage>
          <SDoneButton
            id='paymentSuccess'
            onClick={handleCloseModalMixpanel}
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

const SModalValue = styled.h1<{ highlighted: boolean }>`
  text-align: center;
  color: ${({ theme, highlighted }) =>
    highlighted && theme.name === 'dark'
      ? theme.colorsThemed.accent.yellow
      : theme.colorsThemed.text.primary};
  font-weight: 700;
  font-size: 46px;
  line-height: 64px;
  margin-bottom: 6px;
`;

const SModalTitle = styled.h3`
  text-align: center;
  color: ${({ theme }) => theme.colorsThemed.text.primary};
  font-weight: 700;
  font-size: 24px;
  line-height: 32px;
  margin-bottom: 16px;
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
  width: min-content;
  margin: auto;
`;

const STicketSet = styled(TicketSet)`
  margin-right: auto;
  margin-bottom: 16px;
  margin-left: auto;
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
