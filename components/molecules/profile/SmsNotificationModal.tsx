import { Trans, useTranslation } from 'next-i18next';
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
import CheckMark from '../CheckMark';
import { I18nNamespaces } from '../../../@types/i18next';

export interface SubscriptionToCreator {
  type: 'creator';
  userId: string;
  username: string;
}

export interface SubscriptionToPost {
  type: 'post';
  postUuid: string;
  postTitle: string;
}

type Subscription = SubscriptionToCreator | SubscriptionToPost;

function getSubscriptionSubject(subscription: Subscription): string {
  if (subscription.type === 'creator') {
    return subscription.username;
  }

  if (subscription.type === 'post') {
    return subscription.postTitle;
  }

  throw new Error(`Unexpected subscription type ${(subscription as any).type}`);
}

interface ISmsNotificationModal {
  show: boolean;
  subscription: Subscription;
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
                  ? assets.common.lightLogoAnimated()
                  : assets.common.darkLogoAnimated()
              }
              alt='NewNew logo'
            />

            {phoneNumber ? (
              <SuccessStepContent phoneNumber={phoneNumber} onClose={onClose} />
            ) : (
              <RequestStepContent
                subject={getSubscriptionSubject(subscription)}
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
  const [acceptedTos, setAcceptedTos] = useState(false);
  const [currentCountryCode, setCurrentCountryCode] = useState('');
  const [currentPhoneNumber, setCurrentPhoneNumber] = useState('');
  const [phoneNumberError, setPhoneNumberError] = useState<
    string | undefined
  >();
  const [phoneErrorVisible, setPhoneErrorVisible] = useState(false);

  const handlePhoneNumberChanged = useCallback(
    (countryCode: string, phoneNumber: string, errorCode?: number) => {
      if (phoneNumber && phoneNumber.length > 5 && errorCode) {
        setPhoneNumberError(
          t(
            `smsNotifications.phoneError.${
              errorCode as unknown as string as keyof I18nNamespaces['common']['smsNotifications']['phoneError']
            }`
          )
        );
      } else {
        setPhoneNumberError(undefined);
      }

      setCurrentCountryCode(countryCode);
      setCurrentPhoneNumber(phoneNumber);
    },
    [t]
  );

  useEffect(() => {
    if (phoneNumberError) {
      const timer = setTimeout(() => {
        setPhoneErrorVisible(true);
      }, 3000);

      return () => {
        clearTimeout(timer);
      };
    }

    setPhoneErrorVisible(false);
    return () => {};
  }, [phoneNumberError]);

  const disabled =
    busy ||
    !acceptedTos ||
    !!phoneNumberError ||
    !currentCountryCode ||
    !currentPhoneNumber;

  return (
    <>
      <STitle>{t('smsNotifications.title')}</STitle>
      <SDescription>
        <Trans
          t={t}
          i18nKey='smsNotifications.description'
          // @ts-ignore
          components={[<SubjectSpan />, { subject }]}
        />
      </SDescription>

      <PhoneNumberInput
        value={currentPhoneNumber}
        disabled={busy}
        onChange={handlePhoneNumberChanged}
      />
      <PhoneErrorText variant={3} tone='error'>
        {phoneErrorVisible ? phoneNumberError : ''}
      </PhoneErrorText>
      <STosSection>
        <CheckMark
          size='small'
          label=''
          selected={acceptedTos}
          handleChange={() => {
            setAcceptedTos((curr) => !curr);
          }}
        />
        <STosText>
          <Trans
            t={t}
            i18nKey='smsNotifications.tos'
            components={[
              <STosLink href='https://terms.newnew.co' />,
              <STosLink href='https://privacy.newnew.co' />,
            ]}
          />
        </STosText>
      </STosSection>
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
        <Trans
          t={t}
          i18nKey='smsNotifications.confirmation'
          // @ts-ignore
          components={[<SubjectSpan />, { phoneNumber }]}
        />
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
    min-width: 500px;
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

const SubjectSpan = styled.span`
  font-size: 16px;
  line-height: 24px;
  font-weight: 600;
  color: ${(props) => props.theme.colorsThemed.text.primary};
`;

const PhoneErrorText = styled(Text)`
  height: 18px;
  margin-top: 3px;
  margin-bottom: 3px;
`;

const STosSection = styled.div`
  display: flex;
  flex-direction: row;
  align-items: start;
`;

const STosText = styled.div`
  color: ${(props) => props.theme.colorsThemed.text.tertiary};
  font-size: 12px;
  line-height: 16px;
  font-weight: 600;
  margin-bottom: 32px;
  text-align: center;
`;

const STosLink = styled.a`
  color: ${(props) => props.theme.colorsThemed.text.secondary};
  font-size: 12px;
  line-height: 16px;
  font-weight: 600;
`;

const SButton = styled(Button)`
  width: auto;
  margin-top: 32px;
`;
