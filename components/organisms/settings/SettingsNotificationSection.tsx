import { newnewapi } from 'newnew-api';
import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { useTranslation } from 'next-i18next';

import { updateMyNotificationsState } from '../../../api/endpoints/notification';
import Text from '../../atoms/Text';
import Toggle from '../../atoms/Toggle';
import useErrorToasts from '../../../utils/hooks/useErrorToasts';

import { usePushNotifications } from '../../../contexts/pushNotificationsContext';
import { Mixpanel } from '../../../utils/mixpanel';
import Loader from '../../atoms/Loader';
import { useUserData } from '../../../contexts/userDataContext';

const SettingsNotificationsSection = () => {
  const { t } = useTranslation('page-Profile');
  const { showErrorToastPredefined } = useErrorToasts();
  const { userData } = useUserData();

  const [isEmailNotificationEnabled, setIsEmailNotificationEnabled] = useState(
    userData?.options?.isEmailNotificationsEnabled ?? false
  );
  const [isEmailLoading, setIsEmailLoading] = useState<boolean>(false);

  useEffect(() => {
    setIsEmailNotificationEnabled(
      userData?.options?.isEmailNotificationsEnabled ?? false
    );
  }, [userData?.options?.isEmailNotificationsEnabled]);

  const {
    isSubscribed,
    isPushNotificationSupported,
    unsubscribe,
    requestPermission,
  } = usePushNotifications();
  const [isWebPushLoading, setIsWebPushLoading] = useState<boolean>(false);

  const updateEmailNotificationState = async (e: React.SyntheticEvent) => {
    if (isEmailLoading) {
      return;
    }

    Mixpanel.track('Update My Notification State', {
      _stage: 'Settings',
      _source: newnewapi.NotificationState.NotificationSource.EMAIL,
      _isEnabled: (e.target as HTMLInputElement).checked,
    });

    setIsEmailLoading(true);

    try {
      const payload = new newnewapi.UpdateMyNotificationsStateRequest({
        notificationState: {
          notificationSource:
            newnewapi.NotificationState.NotificationSource.EMAIL,
          isEnabled: (e.target as HTMLInputElement).checked,
        },
      });
      const res = await updateMyNotificationsState(payload);
      if (res.error) {
        throw new Error(res.error?.message ?? 'Request failed');
      }

      setIsEmailNotificationEnabled((e.target as HTMLInputElement).checked);
    } catch (err) {
      console.error(err);
      showErrorToastPredefined(undefined);
      setIsEmailNotificationEnabled(isEmailNotificationEnabled);
    } finally {
      setIsEmailLoading(false);
    }
  };

  const turnOnPushNotifications = async () => {
    Mixpanel.track('Turn On Push Notifications', {
      _stage: 'Settings',
    });
    setIsWebPushLoading(true);
    await requestPermission();
    setIsWebPushLoading(false);
  };

  const turnOffPushNotification = async () => {
    Mixpanel.track('Turn Off Push Notifications', {
      _stage: 'Settings',
    });
    setIsWebPushLoading(true);
    await unsubscribe();
    setIsWebPushLoading(false);
  };

  return (
    <SWrapper>
      <>
        <SSubsection>
          <Text variant={2} weight={600}>
            {t('Settings.sections.notifications.email')}
          </Text>
          <Toggle
            title={t('Settings.sections.notifications.email')}
            checked={isEmailNotificationEnabled}
            onChange={updateEmailNotificationState}
          />
          {isEmailLoading && <SLoader size='xs' />}
        </SSubsection>

        {isPushNotificationSupported && (
          <SSubsection>
            <Text variant={2} weight={600}>
              {t('Settings.sections.notifications.push')}
            </Text>
            <Toggle
              title={t('Settings.sections.notifications.push')}
              checked={isSubscribed}
              onChange={
                isSubscribed ? turnOffPushNotification : turnOnPushNotifications
              }
            />
            {isWebPushLoading && <SLoader size='xs' />}
          </SSubsection>
        )}
      </>
    </SWrapper>
  );
};

export default SettingsNotificationsSection;

const SWrapper = styled.div`
  padding-bottom: 12px;
`;

const SSubsection = styled.div`
  position: relative;
  display: flex;
  flex-direction: row;
  justify-content: space-between;

  padding-top: 16px;
  padding-bottom: 16px;
`;

const SLoader = styled(Loader)`
  position: absolute;
  right: 40px;
  top: 50%;
  transform: translateY(-50%);
`;
