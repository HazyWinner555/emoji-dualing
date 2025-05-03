import React, { useRef, useEffect, useState } from 'react';
import { ServerContext } from './ServerContext';

export function ServerProvider({ children }) {
    const socketRef = useRef(null);
    const [roomState, setRoomState] = useState(null);
    const roomCreationCallbackRef = useRef(null);

    const requestRoomCreation = (callback) => {
        roomCreationCallbackRef.current = callback;
        sendMessage("CREATE_ROOM"); // or whatever the server expects to trigger room creation
    };

    useEffect(() => {
        socketRef.current = new WebSocket('ws://localhost:8080/ws');

        socketRef.current.onmessage = (event) => {
            const data = JSON.parse(event.data);
            setRoomState(prev => ({ ...prev, ...data })); // adjust merge strategy as needed
        };

        return () => {
            socketRef.current?.close();
        };
    }, []);

    function sendMessage(msg) {
        if (socketRef.current?.readyState === WebSocket.OPEN) {
            socketRef.current.send(JSON.stringify(msg));
        }
    }

    const value = {
        sendMessage,
        roomState,
        socket: socketRef.current,
    };

    return (
        <ServerContext.Provider value={value}>
            {children}
        </ServerContext.Provider>
    );
}
