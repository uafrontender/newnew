import React, { useState } from 'react';

import { usePushNotifications } from '../../contexts/pushNotificationsContext';

import PushNotificationsRequestModal from './PushNotificationsRequestModal';
import PushNotificationsSuccessModal from './PushNotificationsSuccessModal';

const PushNotificationModalContainer: React.FC = React.memo(() => {
  const {
    isPermissionRequestModalOpen,
    closePermissionRequestModal,
    subscribe,
  } = usePushNotifications();

  const [
    isPushNotificationSuccessModalOpen,
    setIsPushNotificationSuccessModalOpen,
  ] = useState(false);

  const acceptPushNotification = () => {
    closePermissionRequestModal();
    subscribe(() => {
      setIsPushNotificationSuccessModalOpen(true);
    });
  };

  return (
    <>
      {isPermissionRequestModalOpen && (
        <PushNotificationsRequestModal
          isOpen={isPermissionRequestModalOpen}
          onClose={closePermissionRequestModal}
          onConfirm={acceptPushNotification}
        />
      )}
      {isPushNotificationSuccessModalOpen && (
        <PushNotificationsSuccessModal
          isOpen={isPushNotificationSuccessModalOpen}
          onClose={() => setIsPushNotificationSuccessModalOpen(false)}
        />
      )}
    </>
  );
});

export default PushNotificationModalContainer;
