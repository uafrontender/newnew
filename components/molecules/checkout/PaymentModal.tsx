import React, { useEffect, useState } from 'react';
import styled, { useTheme } from 'styled-components';
import { useTranslation } from 'next-i18next';

import useCards from '../../../utils/hooks/useCards';
import StripeElements from '../../../HOC/StripeElementsWithClientSecret';
import { ISetupIntent } from '../../../utils/hooks/useStripeSetupIntent';

import Modal, { ModalType } from '../../organisms/Modal';
import InlineSvg from '../../atoms/InlineSVG';
import GoBackButton from '../GoBackButton';
import CheckoutForm from './CheckoutForm';
import Lottie from '../../atoms/Lottie';

import CancelIcon from '../../../public/images/svg/icons/outlined/Close.svg';
import logoAnimation from '../../../public/animations/mobile_logo.json';
import useErrorToasts from '../../../utils/hooks/useErrorToasts';
import { Mixpanel } from '../../../utils/mixpanel';
import { useAppState } from '../../../contexts/appStateContext';

interface IPaymentModal {
  isOpen: boolean;
  zIndex: number;
  redirectUrl: string;
  modalType?: ModalType;
  amount?: number;
  showTocApply?: boolean;
  bottomCaption?: React.ReactNode;
  onClose: () => void;
  handlePayWithCard?: (params: {
    cardUuid?: string;
    saveCard?: boolean;
  }) => void;
  children: React.ReactNode;
  setupIntent: ISetupIntent;
}

const PaymentModal: React.FC<IPaymentModal> = ({
  isOpen,
  zIndex,
  setupIntent,
  redirectUrl,
  modalType,
  amount,
  showTocApply,
  bottomCaption,
  onClose,
  handlePayWithCard,
  children,
}) => {
  const theme = useTheme();
  const { t } = useTranslation('modal-PaymentModal');
  const { showErrorToastCustom } = useErrorToasts();
  const { resizeMode } = useAppState();
  const isMobile = ['mobile', 'mobileS', 'mobileM', 'mobileL'].includes(
    resizeMode
  );

  const [isLoadingSetupIntent, setIsLoadingSetupIntent] = useState(false);
  const { isCardsLoading } = useCards();

  useEffect(() => {
    const getSetupIntent = async () => {
      setIsLoadingSetupIntent(true);

      const { errorKey } = await setupIntent.init();

      if (errorKey) {
        showErrorToastCustom(t(errorKey as any));
      }

      setIsLoadingSetupIntent(false);
    };

    if (!setupIntent.setupIntentClientSecret && setupIntent) {
      getSetupIntent();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [setupIntent, setupIntent.setupIntentClientSecret, t]);

  return (
    <Modal
      show={isOpen}
      modalType={modalType}
      additionalz={zIndex}
      onClose={onClose}
    >
      <SWrapper>
        <SContentContainer
          showTocApply={showTocApply ?? false}
          onClick={(e) => {
            e.stopPropagation();
          }}
        >
          {isMobile ? (
            <SGoBackButton
              onClickCapture={() => {
                Mixpanel.track('Click Close Button Mobile', {
                  _stage: 'Post',
                  _component: 'PaymentModal',
                });
              }}
              onClick={() => onClose()}
            />
          ) : (
            <SCloseButton
              onClickCapture={() => {
                Mixpanel.track('Click Close Button Desktop', {
                  _stage: 'Post',
                  _component: 'PaymentModal',
                });
              }}
              onClick={() => onClose()}
            >
              <InlineSvg
                svg={CancelIcon}
                fill={theme.colorsThemed.text.primary}
                width='24px'
                height='24px'
              />
            </SCloseButton>
          )}
          <SHeaderContainer>{children}</SHeaderContainer>
          {(isLoadingSetupIntent || isCardsLoading) && (
            <Lottie
              width={55}
              height={55}
              options={{
                loop: true,
                autoplay: true,
                animationData: logoAnimation,
              }}
            />
          )}
          <StripeElements
            stipeSecret={setupIntent?.setupIntentClientSecret || undefined}
          >
            <CheckoutForm
              setupIntent={setupIntent}
              redirectUrl={redirectUrl}
              amount={amount}
              bottomCaption={bottomCaption}
              handlePayWithCard={handlePayWithCard}
              showTocApply={showTocApply}
            />
          </StripeElements>
        </SContentContainer>
      </SWrapper>
    </Modal>
  );
};

PaymentModal.defaultProps = {
  amount: undefined,
  showTocApply: undefined,
  bottomCaption: null,
  handlePayWithCard: () => {},
};

export default PaymentModal;

const SWrapper = styled.div`
  width: 100%;
  height: 100%;

  display: flex;
  justify-content: center;
  align-items: center;

  /* No select */
  -webkit-touch-callout: none;
  -webkit-user-select: none;
  -khtml-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  user-select: none;
`;

const SContentContainer = styled.div<{
  showTocApply: boolean;
}>`
  position: relative;
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  overflow-y: scroll;

  /* Hide scrollbar */
  ::-webkit-scrollbar {
    display: none;
  }
  scrollbar-width: none;
  -ms-overflow-style: none;

  background-color: ${({ theme }) =>
    theme.name === 'dark'
      ? theme.colorsThemed.background.secondary
      : theme.colorsThemed.background.primary};

  padding: 16px;

  ${({ theme }) => theme.media.tablet} {
    width: 480px;
    height: fit-content;
    /* min-height: 360px; */
    /* max-height: 480px; */
    margin: auto;

    border-radius: ${({ theme }) => theme.borderRadius.medium};

    padding: 24px;
    max-height: 90vh;
    /* padding-bottom: 116px; */
  }
`;

const SGoBackButton = styled(GoBackButton)`
  padding-top: 8px;
  padding-bottom: 22px;
  margin-left: -4px;
`;

const SCloseButton = styled.button`
  position: absolute;
  right: 24px;

  display: flex;
  justify-content: center;
  align-items: center;

  width: fit-content;
  border: transparent;
  background: transparent;

  background: ${({ theme }) =>
    theme.name === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'};
  padding: 8px;
  border-radius: 11px;

  color: ${({ theme }) => theme.colorsThemed.text.primary};
  font-size: 20px;
  line-height: 28px;
  font-weight: bold;
  text-transform: capitalize;

  cursor: pointer;
`;

const SHeaderContainer = styled.div`
  margin-bottom: 16px;

  ${({ theme }) => theme.media.tablet} {
    margin-bottom: 24px;
  }
`;
