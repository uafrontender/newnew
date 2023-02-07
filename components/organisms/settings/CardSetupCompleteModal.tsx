import React, { useEffect, useState, useContext } from 'react';
import { useTranslation } from 'next-i18next';
import styled, { useTheme } from 'styled-components';
import { newnewapi } from 'newnew-api';

// Components
import Modal from '../Modal';
import Text from '../../atoms/Text';
import Button from '../../atoms/Button';
import ModalPaper, { SContent } from '../ModalPaper';

// Assets
import pensiveIcon from '../../../public/images/png/emoji/pensive.png';
import partingIcon from '../../../public/images/png/emoji/partying.png';

// Utils
import { SocketContext } from '../../../contexts/socketContext';
import { checkCardStatus } from '../../../api/endpoints/card';
import useCards from '../../../utils/hooks/useCards';
import assets from '../../../constants/assets';
import Headline from '../../atoms/Headline';
import { Mixpanel } from '../../../utils/mixpanel';

const getCardStatusMessage = (cardStatus: newnewapi.CardStatus) => {
  switch (cardStatus) {
    case newnewapi.CardStatus.ADDED:
      return 'Settings.sections.cards.status.added';
    case newnewapi.CardStatus.CANNOT_BE_ADDED:
      return 'Settings.sections.cards.status.cannotBeAdded';
    case newnewapi.CardStatus.DUPLICATE:
      return 'Settings.sections.cards.status.duplicate';
    case newnewapi.CardStatus.IN_PROGRESS:
      return 'Settings.sections.cards.status.inProgress';
    default:
      return 'Settings.sections.cards.status.requestFailed';
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
  const { addCardMutation } = useCards();
  const socketConnection = useContext(SocketContext);
  const theme = useTheme();

  const [message, setMessage] = useState('');
  const [isProcessing, setIsProcessing] = useState(true);
  const [isError, setIsError] = useState(false);
  const [isStatusChecked, setIsStatusChecked] = useState(false);
  const [isCardAdded, setIsCardAdded] = useState(false);

  useEffect(() => {
    const controller = new AbortController();

    const handleCheckCardStatus = async () => {
      try {
        if (!clientSecret || !setupIntentId) {
          throw new Error('Something went wrong');
        }

        if (isStatusChecked) {
          return;
        }

        const payload = new newnewapi.CheckCardStatusRequest({
          stripeSetupIntentId: setupIntentId,
          stripeSetupIntentClientSecret: clientSecret,
        });
        const response = await checkCardStatus(payload, controller.signal);

        if (!response.data || response.error) {
          // skip abort request error
          if (response.error && (response.error as any)?.code !== 20) {
            throw new Error(response.error?.message || 'An error occurred');
          }

          return;
        }

        if (response.data.cardStatus !== newnewapi.CardStatus.IN_PROGRESS) {
          setIsProcessing(false);
          setIsStatusChecked(true);
        }

        if (
          response.data.cardStatus !== newnewapi.CardStatus.IN_PROGRESS &&
          response.data.cardStatus !== newnewapi.CardStatus.ADDED
        ) {
          setIsError(true);
        }

        if (
          response.data.cardStatus === newnewapi.CardStatus.ADDED &&
          response.data.card
        ) {
          addCardMutation?.mutate(response.data.card);
          setIsCardAdded(true);
        }

        setMessage(t(getCardStatusMessage(response.data.cardStatus)));
      } catch (err) {
        console.error(err);
        setIsProcessing(false);
      }
    };

    if (clientSecret) {
      handleCheckCardStatus();
    }

    return () => {
      controller.abort();
    };
  }, [clientSecret, setupIntentId, isStatusChecked, t, addCardMutation]);

  useEffect(() => {
    const handleCardAdded = (data: any) => {
      const arr = new Uint8Array(data);
      const decoded = newnewapi.CardStatusChanged.decode(arr);
      if (!decoded) return;

      setMessage(t(getCardStatusMessage(decoded.cardStatus)));

      if (decoded.cardStatus !== newnewapi.CardStatus.IN_PROGRESS) {
        setIsProcessing(false);
        setIsStatusChecked(true);
      }

      if (
        decoded.cardStatus !== newnewapi.CardStatus.IN_PROGRESS &&
        decoded.cardStatus !== newnewapi.CardStatus.ADDED
      ) {
        setIsError(true);
      }
      if (decoded.cardStatus === newnewapi.CardStatus.ADDED && decoded.card) {
        addCardMutation?.mutate(decoded.card);
        setIsCardAdded(true);
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

  const handleCloseModal = () => {
    Mixpanel.track('Close Add Card Complete Modal', {
      _stage: 'Settings',
      _component: 'CardSetupCompleteModal',
    });

    closeModal();
  };

  return (
    <Modal show={show} onClose={handleCloseModal} overlaydim>
      <SModalPaper onClose={handleCloseModal} isCloseButton isMobileFullScreen>
        <SModalContent>
          {/* Loading view */}
          {isProcessing && (
            <SContentWrapper>
              <SLogo
                src={
                  theme.name === 'light'
                    ? assets.common.lightLogoAnimated()
                    : assets.common.darkLogoAnimated()
                }
                alt='NewNew logo'
              />
              <Headline variant={6}>
                {t('Settings.sections.cards.adding')}
              </Headline>
            </SContentWrapper>
          )}

          {/* Error view */}
          {isError && (
            <SContentWrapper>
              <SEmoji src={pensiveIcon.src} alt='Pensive' />
              <SHeadline variant={6}>
                {t('Settings.sections.cards.ooops')}
              </SHeadline>
              <SText variant={2} weight={600}>
                {message}
              </SText>
            </SContentWrapper>
          )}

          {/* Success view */}
          {isCardAdded && (
            <SContentWrapper>
              <SEmoji
                src={partingIcon.src}
                alt='Parting'
                style={{ width: '77px' }}
              />
              <Headline variant={6}>
                {' '}
                {t('Settings.sections.cards.success')}
              </Headline>
              <SText variant={2} weight={600}>
                {message}
              </SText>
            </SContentWrapper>
          )}

          {!isProcessing && (
            <SButton
              id='add-card-success'
              view='primary'
              onClick={() => {
                Mixpanel.track('Got It Button Clicked', {
                  _stage: 'Settings',
                  _component: 'CardSetupCompleteModal',
                });
                closeModal();
              }}
            >
              {tCommon('gotIt')}
            </SButton>
          )}
        </SModalContent>
      </SModalPaper>
    </Modal>
  );
};

export default CardSetupCompleteModal;

CardSetupCompleteModal.defaultProps = {};

const SModalPaper = styled(ModalPaper)`
  & > div:not(:first-child) {
    height: 100%;
  }

  ${({ theme }) => theme.media.tablet} {
    width: 493px;
    height: 344px;
    padding: 52px;

    ${SContent} {
      padding: 52px;
      margin: -52px;
      height: 344px;
    }
  }
`;

const SModalContent = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  flex: 1;
  height: 100%;
`;

const SLogo = styled.img`
  width: 99px;
  height: 74px;
  margin-bottom: 16px;
`;

const SText = styled(Text)`
  margin-top: 8px;
  color: ${({ theme }) => theme.colorsThemed.text.secondary};

  ${({ theme }) => theme.media.tablet} {
    margin-top: 16px;
  }
`;

const SEmoji = styled.img`
  width: 64px;
  height: 64px;
  margin-bottom: 24px;

  ${({ theme }) => theme.media.tablet} {
    margin-bottom: 16px;
  }
`;

const SHeadline = styled(Headline)`
  ${({ theme }) => theme.media.tablet} {
    font-size: 32px;
    line-height: 40px;
  }
`;

const SButton = styled(Button)`
  width: 100%;

  ${({ theme }) => theme.media.tablet} {
    width: auto;
    margin-top: auto;
  }
`;

const SContentWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  margin: auto 0;

  ${({ theme }) => theme.media.tablet} {
    margin: 0;
  }
`;
