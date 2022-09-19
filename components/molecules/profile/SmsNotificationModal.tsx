import { useTranslation } from 'next-i18next';
import React, { useCallback, useState, useEffect } from 'react';
import styled, { useTheme } from 'styled-components';
import { newnewapi } from 'newnew-api';
import assets from '../../../constants/assets';
import Button from '../../atoms/Button';
import InlineSvg from '../../atoms/InlineSVG';
import Text from '../../atoms/Text';
import Modal from '../../organisms/Modal';
import PhoneNumberInput from './PhoneNumberInput';
import CloseIcon from '../../../public/images/svg/icons/outlined/Close.svg';

export interface SubscriptionToCreator {
  userId: string;
  username: string;
}

interface ISmsNotificationModal {
  show: boolean;
  subscription: SubscriptionToCreator;
  zIndex?: number;
  onSubmit: (newPhoneNumber: newnewapi.PhoneNumber) => Promise<string>;
  onClose: () => void;
}

const SmsNotificationModal: React.FC<ISmsNotificationModal> = React.memo(
  ({ show, subscription, zIndex, onSubmit, onClose }) => {
    const theme = useTheme();
    const [phoneNumber, setPhoneNumber] = useState<string | undefined>();
    const [busy, setBusy] = useState(false);

    useEffect(() => {
      if (!show) {
        setPhoneNumber(undefined);
      }
    }, [show]);

    const onSmsNotificationRequest = useCallback(
      (newPhoneNumber: newnewapi.PhoneNumber) => {
        setBusy(true);
        onSubmit(newPhoneNumber)
          .then(() => {
            setPhoneNumber(newPhoneNumber.number);
          })
          .catch(() => {
            // Do nothing handled by parent
          })
          .finally(() => {
            setBusy(false);
          });
      },
      [onSubmit]
    );

    if (!show) {
      return null;
    }

    return (
      <Modal show overlaydim additionalz={zIndex} onClose={onClose}>
        <Container>
          <Content
            onClick={(e) => {
              e.stopPropagation();
            }}
          >
            {!phoneNumber && (
              <SCloseButton onClick={onClose}>
                <InlineSvg
                  svg={CloseIcon}
                  fill={theme.colorsThemed.text.primary}
                  width='24px'
                  height='24px'
                />
              </SCloseButton>
            )}
            <Logo
              src={
                theme.name === 'light'
                  ? assets.common.lightAnimatedLogo
                  : assets.common.darkAnimatedLogo
              }
              alt='NewNew logo'
            />

            {phoneNumber ? (
              <SuccessStepContent phoneNumber={phoneNumber} onClose={onClose} />
            ) : (
              <RequestStepContent
                subject={subscription.username}
                busy={busy}
                onSmsNotificationRequest={onSmsNotificationRequest}
              />
            )}
          </Content>
        </Container>
      </Modal>
    );
  }
);

interface IRequestStepContent {
  subject: string;
  busy: boolean;
  onSmsNotificationRequest: (phoneNumber: newnewapi.PhoneNumber) => void;
}
const RequestStepContent: React.FC<IRequestStepContent> = ({
  subject,
  busy,
  onSmsNotificationRequest,
}) => {
  const { t } = useTranslation('common');
  // const [acceptedTos, setAcceptedTos] = useState(false);
  const [currentCountryCode, setCurrentCountryCode] = useState('');
  const [currentPhoneNumber, setCurrentPhoneNumber] = useState('');
  const [phoneNumberError, setPhoneNumberError] = useState<
    string | undefined
  >();

  const handlePhoneNumberChanged = useCallback(
    (countryCode: string, phoneNumber: string, errorCode?: number) => {
      if (errorCode && phoneNumber) {
        setPhoneNumberError(t(`smsNotifications.phoneError.${errorCode}`));
      } else {
        setPhoneNumberError(undefined);
      }

      setCurrentCountryCode(countryCode);
      setCurrentPhoneNumber(phoneNumber);
    },
    [t]
  );

  const disabled =
    busy || !!phoneNumberError || !currentCountryCode || !currentPhoneNumber;

  return (
    <>
      <STitle>{t('smsNotifications.title')}</STitle>
      <SDescription>
        {/* TODO: make data highlighted by color */}
        {t('smsNotifications.description', { subject })}
      </SDescription>

      <PhoneNumberInput
        value={currentPhoneNumber}
        disabled={busy}
        onChange={handlePhoneNumberChanged}
      />
      <PhoneErrorText variant={3} tone='error'>
        {phoneNumberError}
      </PhoneErrorText>
      {/* TODO: Add a checkbox and TOS here with links */}
      <SButton
        disabled={disabled}
        onClick={() => {
          if (disabled) {
            return;
          }

          const phoneNumber = new newnewapi.PhoneNumber({
            countryCode: currentCountryCode,
            number: currentPhoneNumber,
          });
          onSmsNotificationRequest(phoneNumber);
        }}
      >
        {t('smsNotifications.button.continue')}
      </SButton>
    </>
  );
};

interface ISuccessStepContent {
  phoneNumber: string;
  onClose: () => void;
}

const SuccessStepContent: React.FC<ISuccessStepContent> = ({
  phoneNumber,
  onClose,
}) => {
  const { t } = useTranslation('common');
  return (
    <>
      <STitle>{t('smsNotifications.success')}</STitle>
      <SDescription>
        {/* TODO: make data highlighted by color */}
        {t('smsNotifications.confirmation', { phoneNumber })}
      </SDescription>

      <SButton
        onClick={() => {
          onClose();
        }}
      >
        {t('smsNotifications.button.close')}
      </SButton>
    </>
  );
};

export default SmsNotificationModal;

const Container = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
`;

const Content = styled.div`
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  margin: 16px;
  border-radius: 16px;
  z-index: 1;
  background: ${(props) => props.theme.colorsThemed.background.secondary};

  width: 100%;
  padding: 16px;

  ${({ theme }) => theme.media.tablet} {
    width: min-content;
    padding: 40px 96px;
  }
`;

const SCloseButton = styled.div`
  position: absolute;
  top: 24px;
  right: 24px;
  cursor: pointer;
`;

const Logo = styled.img`
  object-fit: contain;
  height: 144px;
  width: 192px;
  margin-bottom: 24px;
`;

const STitle = styled.div`
  white-space: nowrap;
  color: ${(props) => props.theme.colorsThemed.text.primary};

  font-size: 24px;
  line-height: 32px;
  font-weight: 700;
  margin-bottom: 8px;

  ${({ theme }) => theme.media.tablet} {
    font-size: 32px;
    line-height: 40px;
  }
`;

const SDescription = styled.div`
  color: ${(props) => props.theme.colorsThemed.text.secondary};
  font-size: 16px;
  line-height: 24px;
  font-weight: 600;
  margin-bottom: 24px;

  text-align: center;
`;

const PhoneErrorText = styled(Text)`
  height: 18px;
  margin-top: 3px;
  margin-bottom: 3px;
`;

const SButton = styled(Button)`
  width: auto;
  margin-top: 32px;
`;
