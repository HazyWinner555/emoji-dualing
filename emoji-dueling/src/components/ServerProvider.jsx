import React, { useRef, useEffect, useState } from 'react';
import { ServerContext } from './ServerContext';
export function ServerProvider({ children }) {
    const socketRef = useRef(null);
    const [roomState, setRoomState] = useState(null);
    const roomCreationCallbackRef = useRef(null);

    // expose this to your components
    const requestRoomCreation = (callback) => {
        roomCreationCallbackRef.current = callback;
        sendMessage({ type: "CREATE_ROOM" });
    };

    useEffect(() => {
        socketRef.current = new WebSocket('ws://localhost:8080/game');

        socketRef.current.onopen = () => {
            console.log("WebSocket connection established.");
        };

        socketRef.current.onclose = () => {
            console.log("WebSocket connection closed.");
        };

        socketRef.current.onerror = (error) => {
            console.error("WebSocket error:", error);
        };

        socketRef.current.onmessage = (event) => {
            const raw = event.data;

            // Handle plain-text room creation
            if (raw.startsWith("ROOM_CREATED:")) {
                const roomID = raw.split(":")[1];
                setRoomState(prev => ({ ...prev, roomID }));
                if (roomCreationCallbackRef.current) {
                    roomCreationCallbackRef.current(roomID);
                    roomCreationCallbackRef.current = null;
                }
                return;
            }

            // Handle plain-text username assignment
            if (raw.startsWith("USERNAME:")) {
                const username = raw.split(":")[1];
                setRoomState(prev => ({ ...prev, username }));
                return;
            }

            // Try JSON fallback
            try {
                const data = JSON.parse(raw);
                setRoomState(prev => ({ ...prev, ...data }));
            } catch (err) {
                console.error("Failed to parse message:", raw);
            }
        };

        return () => {
            socketRef.current?.close();
        };
    }, []);

    function sendMessage(msg) {
        console.log("Sending message to server:", msg);
        if (socketRef.current?.readyState !== WebSocket.OPEN) {
            console.warn("WebSocket is not open, current state:", socketRef.current?.readyState);
        }

        if (socketRef.current?.readyState === WebSocket.OPEN) {
            const toSend = typeof msg === "string" ? msg : JSON.stringify(msg);
            socketRef.current.send(toSend);
        } else {
            console.warn("WebSocket not open. Message not sent:", msg);
        }
    }

    const value = {
        sendMessage,
        send: sendMessage,
        requestRoomCreation,
        roomState,
        socket: socketRef.current,
    };

    return (
        <ServerContext.Provider value={value}>
            {children}
        </ServerContext.Provider>
    );
}
