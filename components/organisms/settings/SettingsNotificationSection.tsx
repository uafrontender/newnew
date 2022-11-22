import { newnewapi } from 'newnew-api';
import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { useTranslation } from 'next-i18next';

import {
  getMyNotificationsState,
  updateMyNotificationsState,
} from '../../../api/endpoints/notification';
import Lottie from '../../atoms/Lottie';
import Text from '../../atoms/Text';
import loadingAnimation from '../../../public/animations/logo-loading-blue.json';
import Toggle from '../../atoms/Toggle';
import useErrorToasts from '../../../utils/hooks/useErrorToasts';

const SettingsNotificationsSection = () => {
  const { t } = useTranslation('page-Profile');
  const { showErrorToastPredefined } = useErrorToasts();

  const [isLoading, setLoading] = useState<boolean | null>(null);
  const [myNotificationState, setMyNotificationState] = useState<
    newnewapi.INotificationState[] | null
  >(null);

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
      showErrorToastPredefined(undefined);
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

  return (
    <SWrapper>
      {isLoading !== false ? (
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
        myNotificationState !== null &&
        myNotificationState.map((subsection, idx) => (
          <SSubsection
            key={`notificationsource-${subsection.notificationSource}`}
          >
            <Text variant={2} weight={600}>
              {subsection.notificationSource &&
              subsection.notificationSource === 1
                ? t('Settings.sections.notifications.email')
                : t('Settings.sections.notifications.push')}
            </Text>
            <Toggle
              title={
                subsection.notificationSource &&
                subsection.notificationSource === 1
                  ? t('Settings.sections.notifications.email')
                  : t('Settings.sections.notifications.push')
              }
              checked={subsection.isEnabled ?? false}
              onChange={() => handleUpdateItem(idx)}
            />
          </SSubsection>
        ))
      )}
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
