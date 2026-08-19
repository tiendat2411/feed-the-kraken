import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';

const SocketContext = createContext();

export const useSocket = () => {
  return useContext(SocketContext);
};

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    // Identify returning user or create new session token
    let token = localStorage.getItem('sessionToken');
    if (!token) {
      token = 'user_' + Math.random().toString(36).substr(2, 9);
      localStorage.setItem('sessionToken', token);
    }

    // Connect to Backend Socket.IO Server
    const newSocket = io(import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001', {
      auth: { token },
    });

    setSocket(newSocket);

    // Clean up on unmount
    return () => {
      newSocket.close();
    };
  }, []);

  return (
    <SocketContext.Provider value={socket}>
      {children}
    </SocketContext.Provider>
  );
};
