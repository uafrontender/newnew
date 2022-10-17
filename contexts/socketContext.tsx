import React, { createContext, useState, useEffect } from 'react';
import { useCookies } from 'react-cookie';
import { Socket, io } from 'socket.io-client';

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
    const socketConnected = io(ENDPOINT, {
      ...(cookies.accessToken
        ? {
            query: {
              token: cookies.accessToken,
            },
          }
        : {}),
      transports: ['websocket'],
    });
    setSocket(() => socketConnected);

    function cleanup() {
      socketConnected.disconnect();
    }

    return cleanup;
  }, [cookies]);

  return (
    <SocketContext.Provider value={socket}>{children}</SocketContext.Provider>
  );
};

export default SocketContextProvider;
