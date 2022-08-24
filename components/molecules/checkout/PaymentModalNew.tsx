import React, { useEffect, useState } from 'react';
import styled, { useTheme } from 'styled-components';

import { useAppSelector } from '../../../redux-store/store';
import { useCards } from '../../../contexts/cardsContext';
import StripeElements from '../../../HOC/StripeElementsWithClientSecret';

import Modal from '../../organisms/Modal';
import InlineSvg from '../../atoms/InlineSVG';
import GoBackButton from '../GoBackButton';
import Lottie from '../../atoms/Lottie';

import CancelIcon from '../../../public/images/svg/icons/outlined/Close.svg';
import logoAnimation from '../../../public/animations/mobile_logo.json';
import {
  StripePayment,
  StripePaymentFinalizeOptions,
} from '../../../utils/stripePayment';
import CheckoutFormNew from './CheckoutFormNew';

interface IPaymentModal {
  stripePayment: StripePayment;
  isOpen: boolean;
  zIndex: number;
  redirectUrl: string;
  amount?: number;
  showTocApply?: boolean;
  bottomCaption?: React.ReactNode;
  onPay: (options: StripePaymentFinalizeOptions) => void;
  onClose: () => void;
  children: React.ReactNode;
}

const PaymentModalNew: React.FC<IPaymentModal> = ({
  stripePayment,
  isOpen,
  zIndex,
  redirectUrl,
  amount,
  showTocApply,
  bottomCaption,
  onPay,
  onClose,
  children,
}) => {
  const theme = useTheme();
  const { resizeMode } = useAppSelector((state) => state.ui);
  const isMobile = ['mobile', 'mobileS', 'mobileM', 'mobileL'].includes(
    resizeMode
  );
  const { isCardsLoading } = useCards();

  const [isLoadingSetupIntent, setIsLoadingSetupIntent] = useState(false);
  const [currentStripeToken, setCurrentStripeToken] = useState<string>();

  useEffect(() => {
    setIsLoadingSetupIntent(true);
    stripePayment.initialize().then(({ status, token }) => {
      if (status!) setCurrentStripeToken(token);
      setIsLoadingSetupIntent(false);
    });
  }, [stripePayment]);

  return (
    <Modal show={isOpen} overlaydim additionalz={zIndex} onClose={onClose}>
      <SWrapper>
        <SContentContainer
          showTocApply={showTocApply ?? false}
          onClick={(e) => {
            e.stopPropagation();
          }}
        >
          {isMobile && <SGoBackButton onClick={() => onClose()} />}
          {!isMobile && (
            <SCloseButton onClick={() => onClose()}>
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
          <StripeElements stipeSecret={currentStripeToken}>
            <CheckoutFormNew
              stripePayment={stripePayment}
              redirectUrl={redirectUrl}
              amount={amount}
              bottomCaption={bottomCaption}
              onPay={onPay}
            />
          </StripeElements>
        </SContentContainer>
      </SWrapper>
    </Modal>
  );
};

PaymentModalNew.defaultProps = {
  amount: undefined,
  showTocApply: undefined,
  bottomCaption: null,
};

export default PaymentModalNew;

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
  max-height: 90vh;
  overflow-y: scroll;

  /* Hide scrollbar */
  ::-webkit-scrollbar {
    display: none;
  }
  scrollbar-width: none;
  -ms-overflow-style: none;

  background-color: ${({ theme }) => theme.colorsThemed.background.secondary};

  padding: 16px;

  ${({ theme }) => theme.media.tablet} {
    width: 480px;
    height: fit-content;
    /* min-height: 360px; */
    /* max-height: 480px; */
    margin: auto;

    border-radius: ${({ theme }) => theme.borderRadius.medium};

    padding: 24px;
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
  flex-grow: 1;

  ${({ theme }) => theme.media.tablet} {
    margin-bottom: 24px;
  }
`;
