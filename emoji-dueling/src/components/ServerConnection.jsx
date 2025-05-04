import { useState, useEffect } from 'react';

let socketInstance = null;


const ServerConnection = () => {
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    if (!socketInstance) {
      const newSocket = new WebSocket('ws://localhost:8080/game');
      socketInstance = newSocket;
      setSocket(socket);
    }
    else {
      setSocket(socketInstance);
    }
  }, []);

  return socket;
};

export default ServerConnection;