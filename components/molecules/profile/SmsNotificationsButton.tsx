import React, { useState, useContext, useEffect, useCallback } from 'react';
import { newnewapi } from 'newnew-api';
import { v4 as uuidv4 } from 'uuid';
import { toast } from 'react-toastify';
import { useTranslation } from 'next-i18next';

import styled, { useTheme } from 'styled-components';
import InlineSvg from '../../atoms/InlineSVG';
import NotificationsIconFilled from '../../../public/images/svg/icons/filled/Notifications.svg';
import NotificationsIconOutlined from '../../../public/images/svg/icons/outlined/Notifications.svg';
import { SocketContext } from '../../../contexts/socketContext';
import SmsNotificationModal, {
  SubscriptionToCreator,
} from './SmsNotificationModal';
import {
  getGuestSmsNotificationsSubscriptionToCreatorStatus,
  getSmsNotificationsSubscriptionToCreatorStatus,
  subscribeGuestToCreatorSmsNotifications,
  subscribeToCreatorSmsNotifications,
  unsubscribeFromCreatorSmsNotifications,
  unsubscribeGuestFromCreatorSmsNotifications,
} from '../../../api/endpoints/phone';
import { useAppSelector } from '../../../redux-store/store';

const SAVED_PHONE_COUNTRY_CODE_KEY = 'savedPhoneCountryCode';
const SAVED_PHONE_NUMBER_KEY = 'savedPhoneNumber';

const getSmsNotificationSubscriptionErrorMessage = (
  status?: newnewapi.SmsNotificationsStatus
) => {
  switch (status) {
    case newnewapi.SmsNotificationsStatus.UNKNOWN_STATUS:
      return 'smsNotifications.error.requestFailed';
    default:
      return 'smsNotifications.error.requestFailed';
  }
};

interface ISmsNotificationsButton {
  subscription: SubscriptionToCreator;
  isMobile?: boolean;
}

const SmsNotificationsButton: React.FC<ISmsNotificationsButton> = ({
  subscription,
  isMobile,
}) => {
  const { t } = useTranslation('page-Profile');
  const theme = useTheme();
  const socketConnection = useContext(SocketContext);
  const currentUser = useAppSelector((state) => state.user);

  const [subscribedToSmsNotifications, setSubscribedToSmsNotifications] =
    useState(false);
  const [smsNotificationModalOpen, setSmsNotificationModalOpen] =
    useState(false);

  const handleSmsNotificationModalClose = useCallback(
    () => setSmsNotificationModalOpen(false),
    []
  );

  // TODO: Move to some other place, create it on app startup
  const getGuestId = useCallback((): string => {
    const GUEST_ID_KEY = 'savedGuestId';
    let guestId = localStorage.getItem(GUEST_ID_KEY);
    if (!guestId) {
      guestId = uuidv4();
      localStorage.setItem(GUEST_ID_KEY, guestId);
    }
    return guestId;
  }, []);

  const submitPhoneSmsNotificationsRequest = useCallback(
    async (phoneNumber: newnewapi.PhoneNumber): Promise<string> => {
      try {
        if (!currentUser.loggedIn) {
          const guestId = getGuestId();

          const res = await subscribeGuestToCreatorSmsNotifications(
            subscription.userId,
            guestId,
            phoneNumber
          );

          if (
            !res.data ||
            res.error ||
            (res.data.status !== newnewapi.SmsNotificationsStatus.SUCCESS &&
              res.data.status !==
                newnewapi.SmsNotificationsStatus.SERVICE_SMS_SENT)
          ) {
            throw new Error(
              res.error?.message ??
                t(getSmsNotificationSubscriptionErrorMessage(res.data?.status))
            );
          }

          localStorage.setItem(
            SAVED_PHONE_COUNTRY_CODE_KEY,
            phoneNumber.countryCode
          );
          localStorage.setItem(SAVED_PHONE_NUMBER_KEY, phoneNumber.number);
        } else {
          const res = await subscribeToCreatorSmsNotifications(
            subscription.userId,
            phoneNumber
          );

          if (
            !res.data ||
            res.error ||
            (res.data.status !== newnewapi.SmsNotificationsStatus.SUCCESS &&
              res.data.status !==
                newnewapi.SmsNotificationsStatus.SERVICE_SMS_SENT)
          ) {
            throw new Error(
              res.error?.message ??
                t(getSmsNotificationSubscriptionErrorMessage(res.data?.status))
            );
          }
        }

        return phoneNumber.number;
      } catch (err: any) {
        console.error(err);
        toast.error(err.message);
        // Rethrow for a child
        throw err;
      }
    },
    [currentUser.loggedIn, getGuestId, subscription.userId, t]
  );

  const handleSmsNotificationButtonClicked = useCallback(async () => {
    if (subscribedToSmsNotifications) {
      if (!currentUser.loggedIn) {
        const guestId = getGuestId();
        const res = await unsubscribeGuestFromCreatorSmsNotifications(
          subscription.userId,
          guestId
        );

        if (!res.data || res.error) {
          console.error('Unsubscribe from SMS failed');
          toast.error(t('smsNotifications.error.requestFailed'));
        }
      } else {
        const res = await unsubscribeFromCreatorSmsNotifications(
          subscription.userId
        );

        if (!res.data || res.error) {
          console.error('Unsubscribe from SMS failed');
          toast.error(t('smsNotifications.error.requestFailed'));
        }
      }
    } else if (!currentUser.loggedIn) {
      const countryCode = localStorage.getItem(SAVED_PHONE_COUNTRY_CODE_KEY);
      const number = localStorage.getItem(SAVED_PHONE_NUMBER_KEY);

      if (countryCode && number) {
        const phoneNumber = new newnewapi.PhoneNumber({
          countryCode,
          number,
        });
        submitPhoneSmsNotificationsRequest(phoneNumber);
      } else {
        setSmsNotificationModalOpen(true);
      }
    } else if (currentUser.userData?.options?.isPhoneNumberConfirmed) {
      try {
        const res = await subscribeToCreatorSmsNotifications(
          subscription.userId
        );

        if (
          !res.data ||
          res.error ||
          (res.data.status !== newnewapi.SmsNotificationsStatus.SUCCESS &&
            res.data.status !==
              newnewapi.SmsNotificationsStatus.SERVICE_SMS_SENT)
        ) {
          throw new Error(
            res.error?.message ??
              t(getSmsNotificationSubscriptionErrorMessage(res.data?.status))
          );
        }
      } catch (err: any) {
        console.error(err);
        toast.error(err.message);
      }
    } else {
      setSmsNotificationModalOpen(true);
    }
  }, [
    currentUser.loggedIn,
    currentUser.userData?.options?.isPhoneNumberConfirmed,
    subscribedToSmsNotifications,
    subscription.userId,
    t,
    getGuestId,
    submitPhoneSmsNotificationsRequest,
  ]);

  useEffect(() => {
    if (!currentUser.loggedIn) {
      const pollGuestSmsSubscriptionStatus = async () => {
        const guestId = getGuestId();
        const res = await getGuestSmsNotificationsSubscriptionToCreatorStatus(
          subscription.userId,
          guestId
        );

        if (!res.data || res.error) {
          console.error('Unable to get sms notifications status');
          toast.error(t('smsNotifications.error.requestFailed'));
          throw new Error('Request failed');
        }

        setSubscribedToSmsNotifications(
          res.data.status === newnewapi.SmsNotificationsStatus.SUCCESS
        );
      };

      pollGuestSmsSubscriptionStatus()
        .then(() => {
          const pollingInterval = setInterval(() => {
            pollGuestSmsSubscriptionStatus().catch(() => {
              clearInterval(pollingInterval);
            });
          }, 5000);

          return () => {
            clearInterval(pollingInterval);
          };
        })
        .catch(() => {
          // Do nothing
        });
    } else {
      getSmsNotificationsSubscriptionToCreatorStatus(subscription.userId).then(
        (res) => {
          if (!res.data || res.error) {
            console.error('Unable to get sms notifications status');
            toast.error(t('smsNotifications.errors.requestFailed'));
            return;
          }

          setSubscribedToSmsNotifications(
            res.data.status === newnewapi.SmsNotificationsStatus.SUCCESS
          );
        }
      );
    }

    return () => {};
  }, [currentUser.loggedIn, subscription.userId, t, getGuestId]);

  useEffect(() => {
    const handleSubscribedToSms = async (data: any) => {
      const arr = new Uint8Array(data);
      const decoded = newnewapi.SmsNotificationsSubscribed.decode(arr);

      if (!decoded) return;

      if (decoded.object?.creatorUuid === subscription.userId) {
        setSubscribedToSmsNotifications(true);
      }
    };

    const handleUnsubscribedFromSms = async (data: any) => {
      const arr = new Uint8Array(data);
      const decoded = newnewapi.SmsNotificationsUnsubscribed.decode(arr);

      if (!decoded) return;

      if (decoded.object?.creatorUuid === subscription.userId) {
        setSubscribedToSmsNotifications(false);
      }

      if (decoded.object && !decoded.object.creatorUuid) {
        // Unsubscribed from all
        setSubscribedToSmsNotifications(false);
      }
    };

    if (socketConnection && currentUser.loggedIn) {
      socketConnection?.on('SmsNotificationsSubscribed', handleSubscribedToSms);
      socketConnection?.on(
        'SmsNotificationsUnsubscribed',
        handleUnsubscribedFromSms
      );
    }

    return () => {
      if (
        socketConnection &&
        socketConnection?.connected &&
        currentUser.loggedIn
      ) {
        socketConnection?.off(
          'SmsNotificationsSubscribed',
          handleSubscribedToSms
        );
        socketConnection?.off(
          'SmsNotificationsUnsubscribed',
          handleUnsubscribedFromSms
        );
      }
    };
  }, [currentUser.loggedIn, subscription.userId, socketConnection]);

  return (
    <>
      {isMobile ? (
        <SIconButton
          active={subscribedToSmsNotifications}
          onClick={handleSmsNotificationButtonClicked}
        >
          <InlineSvg
            svg={
              subscribedToSmsNotifications
                ? NotificationsIconFilled
                : NotificationsIconOutlined
            }
            fill={
              subscribedToSmsNotifications
                ? theme.colors.white
                : theme.colorsThemed.text.primary
            }
            width='24px'
            height='24px'
          />
        </SIconButton>
      ) : (
        <SIconButtonWithText
          active={subscribedToSmsNotifications}
          onClick={handleSmsNotificationButtonClicked}
        >
          <InlineSvg
            svg={
              subscribedToSmsNotifications
                ? NotificationsIconFilled
                : NotificationsIconOutlined
            }
            fill={
              subscribedToSmsNotifications
                ? theme.colors.white
                : theme.colorsThemed.text.primary
            }
            width='24px'
            height='24px'
          />
          {t(
            subscribedToSmsNotifications
              ? 'profileLayout.buttons.disableSmsNotifications'
              : 'profileLayout.buttons.enableSmsNotifications'
          )}
        </SIconButtonWithText>
      )}
      <SmsNotificationModal
        show={smsNotificationModalOpen}
        subscription={subscription}
        onSubmit={submitPhoneSmsNotificationsRequest}
        onClose={handleSmsNotificationModalClose}
      />
    </>
  );
};

export default SmsNotificationsButton;

const SIconButton = styled.div<{
  active: boolean;
}>`
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;

  padding: 12px;
  border-radius: 16px;
  cursor: pointer;

  user-select: none;
  transition: background 0.2s linear;
  color: ${({ theme, active }) =>
    active ? theme.colors.white : theme.colorsThemed.text.primary};
  background: ${({ theme, active }) =>
    active
      ? 'linear-gradient(315deg, rgba(29, 180, 255, 0.85) 0%, rgba(29, 180, 255, 0) 50%), #1D6AFF;'
      : theme.colorsThemed.background.quinary};

  // TODO: add hover/active effects
`;

const SIconButtonWithText = styled(SIconButton)`
  gap: 12px;
  padding: 12px 24px;
  font-weight: 700;
  font-size: 14px;
  line-height: 24px;
`;
