import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';

const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [lastUpdate, setLastUpdate] = useState(null);

  useEffect(() => {
    // Explicitly target backend server port 5000 for direct WebSocket connections
    const backendUrl = `${window.location.protocol}//${window.location.hostname}:5000`;
    const socketInstance = io(backendUrl, {
      transports: ['polling', 'websocket'],
      reconnectionAttempts: 5,
      reconnectionDelay: 1000
    });

    socketInstance.on('connect', () => {
      console.log('⚡ Socket connected to backend:', socketInstance.id);
    });

    socketInstance.on('booking_updated', (data) => {
      console.log('🔔 Booking update received via socket:', data);
      setLastUpdate({ timestamp: Date.now(), data });
    });

    setSocket(socketInstance);

    return () => {
      socketInstance.disconnect();
    };
  }, []);

  return (
    <SocketContext.Provider value={{ socket, lastUpdate }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);
