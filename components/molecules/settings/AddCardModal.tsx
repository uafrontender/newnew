import React, { useRef, useState } from 'react';
import { useTranslation } from 'next-i18next';
import styled from 'styled-components';
import {
  useStripe,
  useElements,
  PaymentElement,
} from '@stripe/react-stripe-js';

import Modal from '../../organisms/Modal';
import Button from '../../atoms/Button';
import Text from '../../atoms/Text';

import { useOnClickOutside } from '../../../utils/hooks/useOnClickOutside';

interface IAddCardModal {
  show: boolean;
  closeModal: () => void;
}

const AddCardModal: React.FC<IAddCardModal> = ({ show, closeModal }) => {
  const { t } = useTranslation('page-Profile');
  const { t: tCommon } = useTranslation('common');

  const ref = useRef(null);

  useOnClickOutside(ref, closeModal);

  const stripe = useStripe();
  const elements = useElements();

  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.ChangeEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsLoading(true);

    const { error } = await stripe.confirmSetup({
      elements,
      confirmParams: {
        return_url:
          'http://localhost:4000/profile/settings/card-setup-complete',
      },
    });

    console.log(error, 'error');

    setIsLoading(false);

    if (error) {
      // This point will only be reached if there is an immediate error when
      // confirming the payment. Show error to your customer (for example, payment
      // details incomplete)
      if (error.message) {
        setErrorMessage(error.message);
      }
    }
  };

  return (
    <Modal show={show} onClose={closeModal} overlaydim>
      <SContainer>
        <SModal ref={ref}>
          <SModalTitle>
            {t('Settings.sections.cards.button.addNewCard')}
          </SModalTitle>
          <form onSubmit={handleSubmit}>
            <PaymentElement />
            {errorMessage && (
              <SErrorText variant={3} tone='error'>
                {errorMessage}
              </SErrorText>
            )}
            <SModalButtons>
              <SCancelButton onClick={closeModal} view='secondary'>
                {tCommon('button.cancel')}
              </SCancelButton>
              <Button
                view='primary'
                disabled={!stripe}
                type='submit'
                style={{
                  ...(isLoading ? { cursor: 'wait' } : {}),
                }}
              >
                {t('Settings.sections.cards.button.addCard')}
              </Button>
            </SModalButtons>
          </form>
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
  max-width: 480px;
  min-height: 200px;
  width: 100%;
  background: ${(props) =>
    props.theme.name === 'light'
      ? props.theme.colors.white
      : props.theme.colorsThemed.background.secondary};
  border-radius: ${(props) => props.theme.borderRadius.medium};
  color: ${(props) =>
    props.theme.name === 'light'
      ? props.theme.colorsThemed.text.primary
      : props.theme.colors.white};
  padding: 24px;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  line-height: 24px;
`;

const SModalTitle = styled.strong`
  font-size: 20px;
  margin-bottom: 16px;
`;

const SModalButtons = styled.div`
  display: flex;
  margin-top: 24px;
`;

const SCancelButton = styled(Button)`
  padding: 12px 24px;
  line-height: 24px;
  font-size: 14px;
  margin-right: auto;
  flex-shrink: 0;
`;

const SErrorText = styled(Text)`
  text-align: center;
  margin-top: 8px;
`;
