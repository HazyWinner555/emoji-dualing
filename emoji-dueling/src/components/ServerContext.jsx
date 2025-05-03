import React, { createContext, useContext, useEffect, useRef, useState } from "react";

// 1. Define the context
export const ServerContext = createContext(null);

// 2. Custom hook to use the context
export const useServer = () => {
    const ctx = useContext(ServerContext);
    if (!ctx) throw new Error("useServer must be used within a ServerProvider");
    return ctx;
}

// 3. ServerProvider component
export const ServerProvider = ({ children }) => {
    const [connected, setConnected] = useState(false);
    const [messages, setMessages] = useState([]); // Optional: Store incoming messages
    const socketRef = useRef(null);

    useEffect(() => {
        const socket = new WebSocket("ws://localhost:8080/game"); // adjust your URL
        socketRef.current = socket;

        socket.onopen = () => {
            console.log("WebSocket connected");
            setConnected(true);
        };

        socket.onmessage = (message) => {
            console.log("Message received:", message.data);
            try {
                const data = JSON.parse(message.data);
                if (data.startsWith("ROOM_CREATED:")) {
                    const roomID = data.split(":")[1];
                    setRoomState(prev => ({ ...prev, roomID }));

                    if (roomCreationCallbackRef.current) {
                        roomCreationCallbackRef.current(roomID); // trigger the waiting handler
                        roomCreationCallbackRef.current = null;  // clear after use
                    }
                }                // handle the data as needed
            } catch (err) {
                console.error("Failed to parse message:", message.data);
            }
        };

        socket.onclose = () => {
            console.log("WebSocket disconnected");
            setConnected(false);
        };

        socket.onerror = (err) => {
            console.error("WebSocket error:", err);
        };

        return () => {
            socket.close();
        };
    }, []);

    const send = (msg) => {
        if (socketRef.current?.readyState === WebSocket.OPEN) {
            socketRef.current.send(JSON.stringify(msg));
        } else {
            console.warn("WebSocket is not open");
        }
    };

    return (
        <ServerContext.Provider value={{ send, connected, messages }}>
            {children}
        </ServerContext.Provider>
    );
};
