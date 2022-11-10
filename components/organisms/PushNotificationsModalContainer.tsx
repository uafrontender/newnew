import React, { useState } from 'react';

import { usePushNotifications } from '../../contexts/pushNotificationsContext';
import PushNotificationAlert from './PushNotificationsAlert';

import PushNotificationsRequestModal from './PushNotificationsRequestModal';
import PushNotificationsSuccessModal from './PushNotificationsSuccessModal';

const PushNotificationModalContainer: React.FC = React.memo(() => {
  const {
    isPermissionRequestModalOpen,
    isPushNotificationAlertShown,
    closePermissionRequestModal,
    closePushNotificationAlert,
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
      <PushNotificationAlert
        show={isPushNotificationAlertShown}
        onClose={closePushNotificationAlert}
      />
    </>
  );
});

export default PushNotificationModalContainer;
