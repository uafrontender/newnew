import React, { createContext, useState, useEffect } from 'react';
import { useCookies } from 'react-cookie';
import { Socket, io } from 'socket.io-client';

const ENDPOINT = process.env.NEXT_PUBLIC_SOCKET_URL ?? '';

export const SocketContext = createContext<Socket>({} as any);

interface IReactFunction {
  children: React.ReactNode;
}

const SocketContextProvider: React.FC<IReactFunction> = ({ children }) => {
  const [socket, setSocket] = useState({} as Socket);
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
