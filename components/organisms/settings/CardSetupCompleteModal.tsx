import React, { useRef, useEffect, useState, useContext } from 'react';
import { useTranslation } from 'next-i18next';
import styled, { useTheme } from 'styled-components';
import { useRouter } from 'next/router';
import { newnewapi } from 'newnew-api';

// Redux
import { useAppSelector } from '../../../redux-store/store';

// Components
import Modal from '../Modal';
import Text from '../../atoms/Text';
import Button from '../../atoms/Button';
import Lottie from '../../atoms/Lottie';
import InlineSvg from '../../atoms/InlineSVG';
import GoBackButton from '../../molecules/GoBackButton';

// Assets
import logoAnimation from '../../../public/animations/mobile_logo.json';
import CancelIcon from '../../../public/images/svg/icons/outlined/Close.svg';

// Utils
import { SocketContext } from '../../../contexts/socketContext';
import { useOnClickOutside } from '../../../utils/hooks/useOnClickOutside';
import { checkCardStatus } from '../../../api/endpoints/card';

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

  const theme = useTheme();
  const { ui } = useAppSelector((state) => state);
  const isMobile = ['mobile', 'mobileS', 'mobileM', 'mobileL'].includes(
    ui.resizeMode
  );

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
  position: relative;

  display: flex;
  flex-direction: column;

  width: 100%;
  height: 100%;

  background: ${(props) =>
    props.theme.name === 'light'
      ? props.theme.colors.white
      : props.theme.colorsThemed.background.secondary};

  ${({ theme }) => theme.media.tablet} {
    width: 464px;
    height: 250px;
    max-height: 250px;
    min-height: 250px;

    border-radius: ${({ theme }) => theme.borderRadius.medium};
  }

  ${({ theme }) => theme.media.desktop} {
    width: 480px;
  }
`;

const SModalContent = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 16px 24px 32px;
  flex: 1;
`;

const SGoBackButtonMobile = styled(GoBackButton)`
  width: 100%;
  padding: 18px 16px;
`;

const SGoBackButtonDesktop = styled.button`
  display: flex;
  justify-content: space-between;
  align-items: center;

  width: 100%;
  border: transparent;
  background: transparent;
  padding: 24px;

  color: ${({ theme }) => theme.colorsThemed.text.primary};
  font-size: 20px;
  line-height: 28px;
  font-weight: bold;

  cursor: pointer;
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
  margin-top: 40px;

  ${({ theme }) => theme.media.tablet} {
    margin-top: auto;
  }
`;

const SLoader = styled.div`
  margin-top: 20px;
`;
