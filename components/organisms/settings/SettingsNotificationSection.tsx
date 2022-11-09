import { newnewapi } from 'newnew-api';
import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { useTranslation } from 'next-i18next';
import { toast } from 'react-toastify';

import {
  getMyNotificationsState,
  updateMyNotificationsState,
} from '../../../api/endpoints/notification';
import Lottie from '../../atoms/Lottie';
import Text from '../../atoms/Text';
import loadingAnimation from '../../../public/animations/logo-loading-blue.json';
import Toggle from '../../atoms/Toggle';

import { usePushNotifications } from '../../../contexts/pushNotificationsContext';
import PushNotificationAlert from '../PushNotificationsAlert';

const SettingsNotificationsSection = () => {
  const { t } = useTranslation('page-Profile');
  const [isLoading, setLoading] = useState<boolean | null>(null);
  const [myNotificationState, setMyNotificationState] = useState<
    newnewapi.INotificationState[] | null
  >(null);

  const {
    inSubscribed,
    permission,
    isLoading: isStateLoading,
    showPermissionRequestModal,
    unsubscribe,
  } = usePushNotifications();

  const [isPushNotificationAlertShown, setIsPushNotificationAlertShown] =
    useState(false);

  const fetchMyNotificationState = async () => {
    if (isLoading) return;
    try {
      setLoading(true);
      const payload = new newnewapi.EmptyRequest();
      const res = await getMyNotificationsState(payload);
      const { data, error } = res;
      if (!data || error) throw new Error(error?.message ?? 'Request failed');
      if (data.notificationState) {
        setMyNotificationState(data.notificationState);
      }
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  const updateMyNotificationState = async (
    item: newnewapi.INotificationState
  ) => {
    if (isLoading) return;
    try {
      const payload = new newnewapi.UpdateMyNotificationsStateRequest({
        notificationState: item,
      });
      const res = await updateMyNotificationsState(payload);
      if (res.error) throw new Error(res.error?.message ?? 'Request failed');
    } catch (err) {
      console.error(err);
      toast.error('toastErrors.generic');
    }
  };

  useEffect(() => {
    if (isLoading === null) {
      fetchMyNotificationState();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoading]);

  const handleUpdateItem = (index: number) => {
    setMyNotificationState((curr) => {
      const arr = curr ? [...curr] : [];
      if (curr) {
        arr[index] = {
          ...curr[index],
          isEnabled: !curr[index].isEnabled,
        };
        updateMyNotificationState(arr[index]);
      }
      return arr;
    });
  };

  const turnOnNotification = () => {
    if (permission === 'denied') {
      setIsPushNotificationAlertShown(true);
    } else {
      showPermissionRequestModal();
    }
  };

  return (
    <SWrapper>
      {isLoading !== false || isStateLoading ? (
        <Lottie
          width={64}
          height={64}
          options={{
            loop: true,
            autoplay: true,
            animationData: loadingAnimation,
          }}
        />
      ) : (
        <>
          {myNotificationState !== null &&
            myNotificationState.map((subsection, idx) => (
              <SSubsection
                key={`notificationsource-${subsection.notificationSource}`}
              >
                <Text variant={2} weight={600}>
                  {subsection.notificationSource &&
                  subsection.notificationSource === 1
                    ? t('Settings.sections.notifications.email')
                    : t('Settings.sections.notifications.inApp')}
                </Text>
                <Toggle
                  title={
                    subsection.notificationSource &&
                    subsection.notificationSource === 1
                      ? t('Settings.sections.notifications.email')
                      : t('Settings.sections.notifications.inApp')
                  }
                  checked={subsection.isEnabled ?? false}
                  onChange={() => handleUpdateItem(idx)}
                />
              </SSubsection>
            ))}
          <SSubsection>
            <Text variant={2} weight={600}>
              {t('Settings.sections.notifications.push')}
            </Text>
            <Toggle
              title={t('Settings.sections.notifications.push')}
              checked={inSubscribed}
              onChange={inSubscribed ? unsubscribe : turnOnNotification}
            />
          </SSubsection>
        </>
      )}
      <PushNotificationAlert
        show={isPushNotificationAlertShown}
        onClose={() => setIsPushNotificationAlertShown(false)}
      />
    </SWrapper>
  );
};

export default SettingsNotificationsSection;

const SWrapper = styled.div`
  padding-bottom: 12px;
`;

const SSubsection = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;

  padding-top: 16px;
  padding-bottom: 16px;
`;
