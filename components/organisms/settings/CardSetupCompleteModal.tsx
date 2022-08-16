import React, { useEffect, useState, useContext } from 'react';
import { useTranslation } from 'next-i18next';
import styled from 'styled-components';
import { newnewapi } from 'newnew-api';

// Components
import Modal from '../Modal';
import Text from '../../atoms/Text';
import Button from '../../atoms/Button';
import Lottie from '../../atoms/Lottie';
import ModalPaper from '../ModalPaper';

// Assets
import logoAnimation from '../../../public/animations/mobile_logo.json';

// Utils
import { SocketContext } from '../../../contexts/socketContext';
import { checkCardStatus } from '../../../api/endpoints/card';
import { useCards } from '../../../contexts/cardsContext';

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
  clientSecret: string | null;
  setupIntentId: string | null;
}

const CardSetupCompleteModal: React.FC<ICardSetupCompleteModal> = ({
  show,
  closeModal,
  clientSecret,
  setupIntentId,
}) => {
  const { t } = useTranslation('page-Profile');
  const { t: tCommon } = useTranslation('common');
  const socketConnection = useContext(SocketContext);
  const { handleSetCard } = useCards();

  const [message, setMessage] = useState('Saving your card. Please wait');
  const [isProcessing, setIsProcessing] = useState(true);
  const [isError, setIsError] = useState(false);

  useEffect(() => {
    if (!clientSecret) {
      return;
    }

    const handleCheckCardStatus = async () => {
      try {
        if (!clientSecret || !setupIntentId) {
          throw new Error('Something went wrong');
        }

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
          if (response.data.card) {
            handleSetCard(response.data.card);
          }
        }

        setMessage(getCardStatusMessage(response.data.cardStatus));
      } catch (err) {
        console.error(err);
        setMessage('Something went wrong');
        setIsProcessing(false);
      }
    };

    handleCheckCardStatus();
  }, [clientSecret, setupIntentId, handleSetCard]);

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
      <ModalPaper
        title={t('Settings.sections.cards.button.addNewCard')}
        onClose={closeModal}
        isCloseButton
        isMobileFullScreen
      >
        <SModalContent>
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
        </SModalContent>
      </ModalPaper>
    </Modal>
  );
};

export default CardSetupCompleteModal;

CardSetupCompleteModal.defaultProps = {};

const SModalContent = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  flex: 1;
  min-height: 100px;
`;

const SText = styled(Text)<{
  $isError: boolean;
}>`
  margin-bottom: 10px;
  color: ${({ theme, $isError }) =>
    !$isError
      ? theme.colorsThemed.text.secondary
      : theme.colorsThemed.accent.error};
`;

const SButton = styled(Button)`
  margin-top: 30px;

  ${({ theme }) => theme.media.tablet} {
    margin-top: auto;
  }
`;

const SLoader = styled.div`
  margin-top: 20px;
`;
