import { useEffect, useRef } from "react";
import wsService from "../services/websocket";

export const useWebSocket = (eventHandlers = {}) => {
  const handlersRef = useRef(eventHandlers);

  useEffect(() => {
    handlersRef.current = eventHandlers;
  }, [eventHandlers]);
  useEffect(() => {
    const handlers = handlersRef.current;
    const unsubscribeFunctions = [];

    // Register event handlers and store unsubscribe functions
    Object.entries(handlers).forEach(([event, handler]) => {
      const unsubscribe = wsService.on(event, handler);
      unsubscribeFunctions.push(unsubscribe);
    });

    return () => {
      // Cleanup event handlers using unsubscribe functions
      unsubscribeFunctions.forEach((unsubscribe) => unsubscribe());
    };
  }, []);

  return {
    emit: wsService.emit.bind(wsService),
    joinRoom: wsService.joinRoom.bind(wsService),
    leaveRoom: wsService.leaveRoom.bind(wsService),
    isConnected: wsService.isConnected,
  };
};

export const useRealtimeUpdates = (room, onUpdate) => {
  useWebSocket({
    [`${room}-update`]: onUpdate,
  });

  useEffect(() => {
    wsService.joinRoom(room);
    return () => wsService.leaveRoom(room);
  }, [room]);
};
