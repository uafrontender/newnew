import React, { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'next-i18next';
import styled, { useTheme } from 'styled-components';
import {
  useStripe,
  useElements,
  PaymentElement,
} from '@stripe/react-stripe-js';

// Redux
import { useAppSelector } from '../../../redux-store/store';

// Components
import Modal from '../../organisms/Modal';
import Button from '../../atoms/Button';
import Text from '../../atoms/Text';
import InlineSvg from '../../atoms/InlineSVG';
import GoBackButton from '../GoBackButton';
import Lottie from '../../atoms/Lottie';

// Assets
import CancelIcon from '../../../public/images/svg/icons/outlined/Close.svg';
import logoAnimation from '../../../public/animations/mobile_logo.json';

// Utils
import { useOnClickOutside } from '../../../utils/hooks/useOnClickOutside';

interface IAddCardModal {
  show: boolean;
  closeModal: () => void;
}

const AddCardModal: React.FC<IAddCardModal> = ({ show, closeModal }) => {
  const { t } = useTranslation('page-Profile');
  const { t: tCommon } = useTranslation('common');

  const theme = useTheme();
  const { ui } = useAppSelector((state) => state);
  const isMobile = ['mobile', 'mobileS', 'mobileM', 'mobileL'].includes(
    ui.resizeMode
  );

  const ref = useRef(null);

  useOnClickOutside(ref, closeModal);

  const stripe = useStripe();
  const elements = useElements();

  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isStripeReady, setIsStripeReady] = useState(false);

  const handleSubmit = async (e: React.ChangeEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsLoading(true);

    const { error } = await stripe.confirmSetup({
      elements,
      confirmParams: {
        return_url: `${process.env.NEXT_PUBLIC_APP_URL}/profile/settings/card-setup-complete`,
      },
    });

    setIsLoading(false);

    if (error) {
      setErrorMessage(error.message || 'An error occurred');
    }
  };

  useEffect(() => {
    if (!show) {
      setErrorMessage('');
      setIsStripeReady(false);
    }
  }, [show]);

  return (
    <Modal show={show} onClose={closeModal} overlaydim>
      <SContainer>
        <SModal ref={ref}>
          {isMobile ? (
            <SGoBackButtonMobile onClick={closeModal}>
              {t('Settings.sections.cards.button.addNewCard')}
            </SGoBackButtonMobile>
          ) : (
            <SGoBackButtonDesktop onClick={closeModal}>
              <div> {t('Settings.sections.cards.button.addNewCard')}</div>
              <InlineSvg
                svg={CancelIcon}
                fill={theme.colorsThemed.text.primary}
                width='24px'
                height='24px'
              />
            </SGoBackButtonDesktop>
          )}
          {!isStripeReady && (
            <SLoader>
              <Lottie
                width={50}
                height={50}
                options={{
                  loop: true,
                  autoplay: true,
                  animationData: logoAnimation,
                }}
              />
            </SLoader>
          )}
          <SForm onSubmit={handleSubmit}>
            <PaymentElement
              onReady={() => {
                setIsStripeReady(true);
              }}
            />
            {errorMessage && (
              <SErrorText variant={3} tone='error'>
                {errorMessage}
              </SErrorText>
            )}
            {isStripeReady && (
              <SModalButtons>
                <SCancelButton onClick={closeModal} view='secondary'>
                  {tCommon('button.cancel')}
                </SCancelButton>
                <SAddButton
                  view='primary'
                  disabled={!stripe}
                  type='submit'
                  style={{
                    ...(isLoading ? { cursor: 'wait' } : {}),
                  }}
                >
                  {t('Settings.sections.cards.button.addCard')}
                </SAddButton>
              </SModalButtons>
            )}
          </SForm>
        </SModal>
      </SContainer>
    </Modal>
  );
};

export default AddCardModal;

AddCardModal.defaultProps = {};

const SContainer = styled.div`
  display: flex;
  height: 100%;
  width: 100%;
  position: absolute;
  justify-content: center;
  align-items: center;
`;

const SModal = styled.div`
  position: relative;
  overflow-y: auto;

  display: flex;
  flex-direction: column;

  width: 100%;
  height: 100%;

  /* Hide scrollbar */
  ::-webkit-scrollbar {
    display: none;
  }
  scrollbar-width: none;
  -ms-overflow-style: none;

  background: ${(props) =>
    props.theme.name === 'light'
      ? props.theme.colors.white
      : props.theme.colorsThemed.background.secondary};

  ${({ theme }) => theme.media.tablet} {
    width: 464px;
    height: auto;
    max-height: 75vh;
    min-height: 445px;

    border-radius: ${({ theme }) => theme.borderRadius.medium};
  }

  ${({ theme }) => theme.media.desktop} {
    width: 480px;
  }
`;

const SGoBackButtonMobile = styled(GoBackButton)`
  width: 100%;
  padding: 18px 16px 6px;
`;

const SGoBackButtonDesktop = styled.button`
  display: flex;
  justify-content: space-between;
  align-items: center;

  width: 100%;
  border: transparent;
  background: transparent;
  padding: 24px;
  padding-bottom: 4px;

  color: ${({ theme }) => theme.colorsThemed.text.primary};
  font-size: 20px;
  line-height: 28px;
  font-weight: bold;

  cursor: pointer;
`;

const SForm = styled.form`
  padding: 24px;
  padding-top: 0;
`;

const SModalButtons = styled.div`
  display: flex;
  margin-top: 32px;
`;

const SCancelButton = styled(Button)`
  display: none;

  padding: 12px 24px;
  line-height: 24px;
  font-size: 14px;
  margin-right: auto;
  flex-shrink: 0;

  ${({ theme }) => theme.media.tablet} {
    display: block;
  }
`;

const SAddButton = styled(Button)`
  flex: 1;
  ${({ theme }) => theme.media.tablet} {
    flex: initial;
  }
`;

const SErrorText = styled(Text)`
  text-align: center;
  margin-top: 8px;
`;

const SLoader = styled.div`
  top: 50%;
  left: 50%;
  z-index: 20;
  position: absolute;
  transform: translate(-50%, -50%);
`;
