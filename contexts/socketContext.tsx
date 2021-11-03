import React, { createContext, useState, useEffect } from 'react';
import socketIOClient, { Socket } from 'socket.io-client';

const ENDPOINT = process.env.NEXT_PUBLIC_SOCKET_URL ?? '';

export const SocketContext = createContext<Socket>({} as any);

const SocketContextProvider: React.FC = ({ children }) => {
  const [socket, setSocket] = useState({} as Socket);

  useEffect(() => {
    const socketConnected = socketIOClient(ENDPOINT);
    setSocket(() => socketConnected);

    function cleanup() {
      socketConnected.disconnect();
    }

    return cleanup;
  }, []);

  return (
    <SocketContext.Provider
      value={socket}
    >
      {children}
    </SocketContext.Provider>
  );
};

export default SocketContextProvider;
