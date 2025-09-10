
/**
 * Socket Connection Manager Hook
 */

import { useState, useEffect } from 'react';
import io from 'socket.io-client';
import { SOCKET_SERVER_URL } from './socketConfig';

type Socket = ReturnType<typeof io>;

export const useSocketConnection = (
  enableRealTimeUpdates: boolean,
  onError?: (error: string) => void
) => {
  const [socket, setSocket] = useState<Socket | null>(null);

  useEffect(() => {
    if (!enableRealTimeUpdates) {
      return;
    }

    try {
      const newSocket = io(
        process.env.NEXT_PUBLIC_API_URL || SOCKET_SERVER_URL
      );

      setSocket(newSocket);

      newSocket.on('connect', () => {
        console.log('Connected to workflow socket server');
      });

      newSocket.on('disconnect', () => {
        console.log('Disconnected from workflow socket server');
      });

      return () => {
        newSocket.disconnect();
      };
    } catch (error: any) {
      console.error('Socket connection error:', error);
      if (onError) {
        onError('Failed to connect to workflow real-time updates');
      }
    }
  }, [enableRealTimeUpdates, onError]);

  return socket;
};
