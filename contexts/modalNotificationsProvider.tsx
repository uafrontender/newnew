import React, { createContext, useState, useMemo, useCallback } from 'react';

export interface ModalNotification {
  image: string;
  titleKey: string;
  descriptionKey: string;
  buttonTextKey: string;
}

export const ModalNotificationsContext = createContext<{
  currentNotification?: ModalNotification;
  show: (notification: ModalNotification) => void;
  close: () => void;
}>({
  currentNotification: undefined,
  show: () => {},
  close: () => {},
});

interface IModalNotificationsContextProvider {
  children: React.ReactNode;
}

const ModalNotificationsContextProvider: React.FC<IModalNotificationsContextProvider> =
  ({ children }) => {
    const [notifications, setNotifications] = useState<ModalNotification[]>([]);

    const show = useCallback((notification: ModalNotification) => {
      setNotifications((curr) => [...curr, notification]);
    }, []);

    const close = useCallback(() => {
      setNotifications((curr) => curr.slice(1));
    }, []);

    const contextValue = useMemo(
      () => ({
        currentNotification: notifications[0],
        show,
        close,
      }),
      [notifications]
    );

    return (
      <ModalNotificationsContext.Provider value={contextValue}>
        {children}
      </ModalNotificationsContext.Provider>
    );
  };

export default ModalNotificationsContextProvider;
