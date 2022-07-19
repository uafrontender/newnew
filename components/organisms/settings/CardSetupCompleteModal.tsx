import React, { useRef, useEffect, useState } from 'react';
import { useTranslation } from 'next-i18next';
import styled from 'styled-components';
import { useRouter } from 'next/router';
import { useStripe } from '@stripe/react-stripe-js';

import Modal from '../Modal';
import Text from '../../atoms/Text';
import Button from '../../atoms/Button';

import { useOnClickOutside } from '../../../utils/hooks/useOnClickOutside';

interface ICardSetupCompleteModal {
  show: boolean;
  closeModal: () => void;
}

const CardSetupCompleteModal: React.FC<ICardSetupCompleteModal> = ({
  show,
  closeModal,
}) => {
  const { t } = useTranslation('page-Profile');
  const { t: tCommon } = useTranslation('common');
  const router = useRouter();
  const stripe = useStripe();

  const ref = useRef(null);

  useOnClickOutside(ref, closeModal);

  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!stripe) {
      return;
    }

    const clientSecret = router.query.setup_intent_client_secret as string;

    stripe.retrieveSetupIntent(clientSecret).then(({ setupIntent }) => {
      switch (setupIntent?.status) {
        case 'succeeded':
          setMessage('Success! Your payment method has been saved.');
          break;

        case 'processing':
          setMessage(
            "Processing payment details. We'll update you when processing is complete."
          );
          break;

        case 'requires_payment_method':
          // Redirect your user back to your payment page to attempt collecting
          // payment again
          setMessage(
            'Failed to process payment details. Please try another payment method.'
          );
          break;
        default:
          setMessage('Unknown');
      }
    });
  }, [stripe, router]);

  return (
    <Modal show={show} onClose={closeModal} overlaydim>
      <SContainer>
        <SModal ref={ref}>
          <SModalTitle>
            {t('Settings.sections.cards.button.addNewCard')}
          </SModalTitle>
          <SText variant={2} weight={600}>
            {message}
          </SText>
          <SButton view='primary' onClick={closeModal}>
            {tCommon('gotIt')}
          </SButton>
        </SModal>
      </SContainer>
    </Modal>
  );
};

export default CardSetupCompleteModal;

CardSetupCompleteModal.defaultProps = {};

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
  height: 200px;
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
  align-items: center;
  line-height: 24px;
`;

const SModalTitle = styled.strong`
  font-size: 20px;
  margin-bottom: 16px;
`;

const SText = styled(Text)`
  color: ${({ theme }) => theme.colorsThemed.text.secondary};
`;

const SButton = styled(Button)`
  margin-top: auto;
`;
