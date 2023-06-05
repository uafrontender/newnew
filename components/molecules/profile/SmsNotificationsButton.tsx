import React, { useState, useContext, useEffect, useCallback } from 'react';
import { newnewapi } from 'newnew-api';

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
  getGuestSmsNotificationsSubscriptionStatus,
  getSmsNotificationsSubscriptionStatus,
  subscribeGuestToSmsNotifications,
  subscribeToSmsNotifications,
  unsubscribeFromSmsNotifications,
  unsubscribeGuestFromSmsNotifications,
} from '../../../api/endpoints/phone';
import { useAppSelector } from '../../../redux-store/store';
import useErrorToasts from '../../../utils/hooks/useErrorToasts';
import getGuestId from '../../../utils/getGuestId';
import { useAppState } from '../../../contexts/appStateContext';

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
}

const SmsNotificationsButton: React.FC<ISmsNotificationsButton> = ({
  subscription,
}) => {
  const { t } = useTranslation();
  const { t: tProfile } = useTranslation('page-Profile');
  const { showErrorToastCustom } = useErrorToasts();
  const theme = useTheme();
  const { socketConnection } = useContext(SocketContext);
  const currentUser = useAppSelector((state) => state.user);
  const { resizeMode } = useAppState();

  const isMobile = ['mobile', 'mobileS', 'mobileM', 'mobileL'].includes(
    resizeMode
  );

  const [subscribedToSmsNotifications, setSubscribedToSmsNotifications] =
    useState(false);
  const [smsNotificationModalOpen, setSmsNotificationModalOpen] =
    useState(false);

  const handleSmsNotificationModalClose = useCallback(
    () => setSmsNotificationModalOpen(false),
    []
  );

  // TODO: Add a hook for handling sms notifications status
  const submitPhoneSmsNotificationsRequest = useCallback(
    async (phoneNumber: newnewapi.PhoneNumber): Promise<string> => {
      try {
        if (!currentUser.loggedIn) {
          const guestId = getGuestId();

          const res = await subscribeGuestToSmsNotifications(
            { creatorUuid: subscription.userId },
            guestId,
            phoneNumber
          );

          if (
            !res?.data ||
            res.error ||
            (res.data.status !== newnewapi.SmsNotificationsStatus.SUCCESS &&
              res.data.status !==
                newnewapi.SmsNotificationsStatus.SERVICE_SMS_SENT)
          ) {
            throw new Error(
              res?.error?.message ??
                t(
                  getSmsNotificationSubscriptionErrorMessage(
                    res.data?.status
                  ) as any
                )
            );
          }

          // TODO: set on phone number confirmed (on polling returns a confirmed number)
          localStorage.setItem(
            SAVED_PHONE_COUNTRY_CODE_KEY,
            phoneNumber.countryCode
          );
          localStorage.setItem(SAVED_PHONE_NUMBER_KEY, phoneNumber.number);
        } else {
          const res = await subscribeToSmsNotifications(
            { creatorUuid: subscription.userId },
            phoneNumber
          );

          if (
            !res?.data ||
            res.error ||
            (res.data.status !== newnewapi.SmsNotificationsStatus.SUCCESS &&
              res.data.status !==
                newnewapi.SmsNotificationsStatus.SERVICE_SMS_SENT)
          ) {
            throw new Error(
              res?.error?.message ??
                t(
                  getSmsNotificationSubscriptionErrorMessage(
                    res.data?.status
                  ) as any
                )
            );
          }
        }

        return phoneNumber.number;
      } catch (err: any) {
        console.error(err);
        showErrorToastCustom(err.message);
        // Rethrow for a child
        throw err;
      }
    },
    [currentUser.loggedIn, showErrorToastCustom, subscription.userId, t]
  );

  const handleSmsNotificationButtonClicked = useCallback(async () => {
    if (subscribedToSmsNotifications) {
      if (!currentUser.loggedIn) {
        const guestId = getGuestId();
        const res = await unsubscribeGuestFromSmsNotifications(
          { creatorUuid: subscription.userId },
          guestId
        );

        if (!res?.data || res.error) {
          console.error('Unsubscribe from SMS failed');
          showErrorToastCustom(t('smsNotifications.error.requestFailed'));
        }
      } else {
        const res = await unsubscribeFromSmsNotifications({
          creatorUuid: subscription.userId,
        });

        if (!res?.data || res.error) {
          console.error('Unsubscribe from SMS failed');
          showErrorToastCustom(t('smsNotifications.error.requestFailed'));
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
        const res = await subscribeToSmsNotifications({
          creatorUuid: subscription.userId,
        });

        if (
          !res?.data ||
          res.error ||
          (res.data.status !== newnewapi.SmsNotificationsStatus.SUCCESS &&
            res.data.status !==
              newnewapi.SmsNotificationsStatus.SERVICE_SMS_SENT)
        ) {
          throw new Error(
            res?.error?.message ??
              t(
                getSmsNotificationSubscriptionErrorMessage(
                  res.data?.status
                ) as any
              )
          );
        }
      } catch (err: any) {
        console.error(err);
        showErrorToastCustom(err.message);
      }
    } else {
      setSmsNotificationModalOpen(true);
    }
  }, [
    subscribedToSmsNotifications,
    currentUser.loggedIn,
    currentUser.userData?.options?.isPhoneNumberConfirmed,
    subscription.userId,
    showErrorToastCustom,
    t,
    submitPhoneSmsNotificationsRequest,
  ]);

  useEffect(() => {
    if (!currentUser._persist?.rehydrated) {
      return () => {};
    }

    if (!currentUser.loggedIn) {
      const pollGuestSmsSubscriptionStatus = async () => {
        const guestId = getGuestId();
        const res = await getGuestSmsNotificationsSubscriptionStatus(
          { creatorUuid: subscription.userId },
          guestId
        );

        if (!res?.data || res.error) {
          console.error('Unable to get sms notifications status');
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
      getSmsNotificationsSubscriptionStatus({
        creatorUuid: subscription.userId,
      }).then((res) => {
        if (!res?.data || res.error) {
          console.error('Unable to get sms notifications status');
          return;
        }

        setSubscribedToSmsNotifications(
          res.data.status === newnewapi.SmsNotificationsStatus.SUCCESS
        );
      });
    }

    return () => {};
  }, [
    currentUser._persist?.rehydrated,
    currentUser.loggedIn,
    subscription.userId,
    t,
  ]);

  useEffect(() => {
    const handleSubscribedToSms = async (data: any) => {
      const arr = new Uint8Array(data);
      const decoded = newnewapi.SmsNotificationsSubscribed.decode(arr);

      if (!decoded) {
        return;
      }

      if (decoded.object?.creatorUuid === subscription.userId) {
        setSubscribedToSmsNotifications(true);
      }
    };

    const handleUnsubscribedFromSms = async (data: any) => {
      const arr = new Uint8Array(data);
      const decoded = newnewapi.SmsNotificationsUnsubscribed.decode(arr);

      if (!decoded) {
        return;
      }

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
        <SMobileIconButton
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
        </SMobileIconButton>
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
          {tProfile(
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

// TODO: add hover/active effects
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
`;

const SMobileIconButton = styled(SIconButton)``;

const SIconButtonWithText = styled(SIconButton)`
  gap: 12px;
  padding: 12px 24px;
  font-weight: 700;
  font-size: 14px;
  line-height: 24px;
  display: none;
`;
