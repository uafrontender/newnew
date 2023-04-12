import React, { createContext, useState, useEffect, useMemo } from 'react';
import { useCookies } from 'react-cookie';
import { Socket, io } from 'socket.io-client';
import { fetchInitialized } from '../api/apiConfigs';

const ENDPOINT = process.env.NEXT_PUBLIC_SOCKET_URL ?? '';

export const SocketContext = createContext<{
  isSocketConnected: boolean;
  socketConnection: Socket | undefined;
}>({
  isSocketConnected: false,
  socketConnection: undefined,
});

interface ISocketContextProvider {
  children: React.ReactNode;
}

const SocketContextProvider: React.FC<ISocketContextProvider> = ({
  children,
}) => {
  const [socket, setSocket] = useState<Socket | undefined>(undefined);
  const [cookies] = useCookies();

  const [isSocketConnected, setIsSocketConnected] = useState(false);

  useEffect(() => {
    const onSocketConnected = () => {
      setIsSocketConnected(true);
    };

    const onSocketDisconnected = () => {
      setIsSocketConnected(false);
    };
    if (socket) {
      socket?.on('connect', onSocketConnected);

      socket?.on('disconnect', onSocketDisconnected);
    }

    return () => {
      socket?.off('connect', onSocketConnected);

      socket?.off('disconnect', onSocketDisconnected);
    };
  }, [socket]);

  // Will use access token if it is available to connect to socket.io
  useEffect(() => {
    let socketConnected = {} as Socket;

    if (fetchInitialized) {
      socketConnected = io(ENDPOINT, {
        ...(cookies.accessToken
          ? {
              query: {
                token: cookies.accessToken,
              },
            }
          : {}),
        withCredentials: true,
        // transports: ['websocket', 'polling'],
      });

      setSocket(socketConnected);
    }

    function cleanup() {
      socketConnected?.disconnect?.();
    }

    return cleanup;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cookies?.accessToken, fetchInitialized]);

  const value = useMemo(
    () => ({
      isSocketConnected,
      socketConnection: socket,
    }),
    [isSocketConnected, socket]
  );

  return (
    <SocketContext.Provider value={value}>{children}</SocketContext.Provider>
  );
};

export default SocketContextProvider;
