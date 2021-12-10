import React, { createContext, useState, useEffect } from 'react';
// import { useCookies } from 'react-cookie';
import socketIOClient, { Socket } from 'socket.io-client';

const ENDPOINT = process.env.NEXT_PUBLIC_SOCKET_URL ?? '';

export const SocketContext = createContext<Socket>({} as any);

const SocketContextProvider: React.FC = ({ children }) => {
  const [socket, setSocket] = useState({} as Socket);
  // const [cookies] = useCookies();

  useEffect(() => {
    const socketConnected = socketIOClient(ENDPOINT);
    setSocket(() => socketConnected);

    function cleanup() {
      socketConnected.disconnect();
    }

    return cleanup;
  }, []);

  // Comment out for now;
  // Will use access token if it is available to connect to socket.io
  // useEffect(() => {
  //   const socketConnected = socketIOClient(ENDPOINT, {
  //     ...(cookies.accessToken ? {
  //       query: {
  //         token: cookies.accessToken,
  //       },
  //     } : {}),
  //   });
  //   setSocket(() => socketConnected);

  //   function cleanup() {
  //     socketConnected.disconnect();
  //   }

  //   return cleanup;
  // }, [cookies]);

  return (
    <SocketContext.Provider
      value={socket}
    >
      {children}
    </SocketContext.Provider>
  );
};

export default SocketContextProvider;
