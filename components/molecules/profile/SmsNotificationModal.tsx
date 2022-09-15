import { useTranslation } from 'next-i18next';
import React, { useCallback, useState } from 'react';
import styled, { useTheme } from 'styled-components';
import assets from '../../../constants/assets';
import Button from '../../atoms/Button';
import InlineSvg from '../../atoms/InlineSVG';
import Text from '../../atoms/Text';
import Modal from '../../organisms/Modal';
import PhoneNumberInput from './PhoneNumberInput';
import CloseIcon from '../../../public/images/svg/icons/outlined/Close.svg';

interface ISmsNotificationModal {
  show: boolean;
  subject: string;
  zIndex?: number;
  onClose: () => void;
}

const SmsNotificationModal: React.FC<ISmsNotificationModal> = React.memo(
  ({ show, subject, zIndex, onClose }) => {
    const { t } = useTranslation('common');
    const theme = useTheme();
    const [showSuccess, setShowSuccess] = useState(false);
    const [currentPhoneNumber, setCurrentPhoneNumber] = useState<string>('');
    const [phoneNumberError, setPhoneNumberError] = useState<
      string | undefined
    >();

    const handlePhoneNumberChanged = useCallback(
      (phoneNumber: string, errorCode?: number) => {
        if (errorCode && phoneNumber) {
          setPhoneNumberError(t(`smsNotifications.phoneError.${errorCode}`));
        } else {
          setPhoneNumberError(undefined);
        }

        setCurrentPhoneNumber(phoneNumber);
      },
      [t]
    );

    const submitSmsNotificationsRequest = useCallback(() => {
      if (!currentPhoneNumber || phoneNumberError) {
        return;
      }

      // TODO: send a request. Wait for success.

      setShowSuccess(true);
    }, [currentPhoneNumber, phoneNumberError]);

    return (
      <Modal show={show} overlaydim additionalz={zIndex} onClose={onClose}>
        <Container>
          <Content
            onClick={(e) => {
              e.stopPropagation();
            }}
          >
            {!showSuccess && (
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

            <STitle>
              {showSuccess
                ? t('smsNotifications.success')
                : t('smsNotifications.title')}
            </STitle>
            <SDescription>
              {/* TODO: make data highlighted by color */}
              {showSuccess
                ? t('confirmation', { currentPhoneNumber })
                : t('smsNotifications.description', { subject })}
            </SDescription>

            {!showSuccess && (
              <>
                <PhoneNumberInput
                  value={currentPhoneNumber}
                  onChange={handlePhoneNumberChanged}
                />
                <PhoneErrorText variant={3} tone='error'>
                  {phoneNumberError}
                </PhoneErrorText>
                {/* TODO: Add a checkbox and TOS here with links */}
              </>
            )}
            <SButton
              disabled={!showSuccess && !!phoneNumberError}
              onClick={() => {
                if (showSuccess) {
                  onClose();
                } else {
                  submitSmsNotificationsRequest();
                }
              }}
            >
              {showSuccess
                ? t('smsNotifications.button.close')
                : t('smsNotifications.button.continue')}
            </SButton>
          </Content>
        </Container>
      </Modal>
    );
  }
);

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
