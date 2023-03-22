import React, { createContext, useState, useEffect } from 'react';
import { useCookies } from 'react-cookie';
import { Socket, io } from 'socket.io-client';
import { fetchInitialized } from '../api/apiConfigs';

const ENDPOINT = process.env.NEXT_PUBLIC_SOCKET_URL ?? '';

export const SocketContext = createContext<Socket | undefined>(undefined);

interface ISocketContextProvider {
  children: React.ReactNode;
}

const SocketContextProvider: React.FC<ISocketContextProvider> = ({
  children,
}) => {
  const [socket, setSocket] = useState<Socket | undefined>(undefined);
  const [cookies] = useCookies();

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

      setSocket(() => socketConnected);
    }

    function cleanup() {
      socketConnected?.disconnect?.();
    }

    return cleanup;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cookies, fetchInitialized]);

  return (
    <SocketContext.Provider value={socket}>{children}</SocketContext.Provider>
  );
};

export default SocketContextProvider;
