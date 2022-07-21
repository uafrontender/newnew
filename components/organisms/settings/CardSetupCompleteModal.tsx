import React, { useRef, useEffect, useState, useContext } from 'react';
import { useTranslation } from 'next-i18next';
import styled from 'styled-components';
import { useRouter } from 'next/router';
import { newnewapi } from 'newnew-api';

import { SocketContext } from '../../../contexts/socketContext';
import { checkCardStatus } from '../../../api/endpoints/card';
import { useOnClickOutside } from '../../../utils/hooks/useOnClickOutside';

import Modal from '../Modal';
import Text from '../../atoms/Text';
import Button from '../../atoms/Button';
import Lottie from '../../atoms/Lottie';

import logoAnimation from '../../../public/animations/mobile_logo.json';

const getCardStatusMessage = (cardStatus: newnewapi.CardStatus) => {
  switch (cardStatus) {
    case newnewapi.CardStatus.ADDED:
      return 'Success! Your card has been saved';
    case newnewapi.CardStatus.CANNOT_BE_ADDED:
      return 'Failure! Your card cannot be saved';
    case newnewapi.CardStatus.DUPLICATE:
      return 'This card has been already saved in your profile';
    case newnewapi.CardStatus.IN_PROGRESS:
      return 'Saving your card. Please wait';
    default:
      return 'Something went wrong';
  }
};
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
  const socketConnection = useContext(SocketContext);

  const clientSecret = router.query.setup_intent_client_secret as string;
  const setupIntentId = router.query.setup_intent as string;

  const ref = useRef(null);

  useOnClickOutside(ref, closeModal);

  const [message, setMessage] = useState('Saving your card. Please wait');
  const [isProcessing, setIsProcessing] = useState(true);
  const [isError, setIsError] = useState(false);

  useEffect(() => {
    if (!clientSecret) {
      return;
    }

    const handleCheckCardStatus = async () => {
      try {
        const payload = new newnewapi.CheckCardStatusRequest({
          stripeSetupIntentId: setupIntentId,
          stripeSetupIntentClientSecret: clientSecret,
        });
        const response = await checkCardStatus(payload);

        if (!response.data || response.error) {
          throw new Error(response.error?.message || 'An error occurred');
        }

        if (response.data.cardStatus !== newnewapi.CardStatus.IN_PROGRESS) {
          setIsProcessing(false);
        }

        if (
          response.data.cardStatus !== newnewapi.CardStatus.IN_PROGRESS &&
          response.data.cardStatus !== newnewapi.CardStatus.ADDED
        ) {
          setIsError(true);
        }

        setMessage(getCardStatusMessage(response.data.cardStatus));
      } catch (err) {
        console.error(err);
        setMessage('Something went wrong');
        setIsProcessing(false);
      }
    };

    handleCheckCardStatus();
  }, [clientSecret, setupIntentId]);

  useEffect(() => {
    const handleCardAdded = (data: any) => {
      console.log(data, 'SOCKET');
      const arr = new Uint8Array(data);
      const decoded = newnewapi.CardStatusChanged.decode(arr);
      if (!decoded) return;

      setMessage(getCardStatusMessage(decoded.cardStatus));

      if (decoded.cardStatus !== newnewapi.CardStatus.IN_PROGRESS) {
        setIsProcessing(false);
      }

      if (
        decoded.cardStatus !== newnewapi.CardStatus.IN_PROGRESS &&
        decoded.cardStatus !== newnewapi.CardStatus.ADDED
      ) {
        setIsError(true);
      }
    };

    if (socketConnection) {
      socketConnection?.on('CardStatusChanged', handleCardAdded);
    }

    return () => {
      if (socketConnection && socketConnection?.connected) {
        socketConnection?.off('CardStatusChanged', handleCardAdded);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [socketConnection?.connected]);

  return (
    <Modal show={show} onClose={closeModal} overlaydim>
      <SContainer>
        <SModal ref={ref}>
          <SModalTitle>
            {t('Settings.sections.cards.button.addNewCard')}
          </SModalTitle>
          <SText variant={2} weight={600} $isError={isError}>
            {message}
          </SText>
          {isProcessing && (
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
          {!isProcessing && (
            <SButton view='primary' onClick={closeModal}>
              {tCommon('gotIt')}
            </SButton>
          )}
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

const SText = styled(Text)<{
  $isError: boolean;
}>`
  color: ${({ theme, $isError }) =>
    !$isError
      ? theme.colorsThemed.text.secondary
      : theme.colorsThemed.accent.error};
`;

const SButton = styled(Button)`
  margin-top: auto;
`;

const SLoader = styled.div`
  margin-top: 20px;
`;
