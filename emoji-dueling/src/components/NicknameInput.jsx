/*
    This should update the username sent to the server.
*/

import React, { useState, useEffect } from 'react';
import ServerConnection from '../components/ServerConnection';

function NicknameInput({ onUsernameChange = () => {}, initialUsername = "" }) {
    const socket = ServerConnection();
    const [username, setUsername] = useState(initialUsername);
    const [isValid, setIsValid] = useState(true);
    const [statusMessage, setStatusMessage] = useState("");
    const [typingTimeout, setTypingTimeout] = useState(null);
    const [isManuallyCleared, setIsManuallyCleared] = useState(false);

    // Request default username on mount if empty
    useEffect(() => {
        if (!username && !isManuallyCleared && socket?.readyState === WebSocket.OPEN) {
            socket.send("GET_DEFAULT_USERNAME");
        }
    }, [socket, isManuallyCleared]);

    // Handle incoming messages
    useEffect(() => {
        if (!socket) return;

        const handleMessage = (event) => {
            const data = event.data;
            
            if (data === "INVALID_USER") {
                setIsValid(false);
                setStatusMessage("Username is invalid");
            } 
            else if (data.startsWith("DEFAULT_USERNAME_SET:")) {
                // Only set default if field is empty and wasn't manually cleared
                if (username === "" && !isManuallyCleared) {
                    const newUsername = data.split(":")[1];
                    setUsername(newUsername);
                    onUsernameChange(newUsername);
                    setIsValid(true);
                    setStatusMessage(`Default username set: ${newUsername}`);
                }
            }
            else if (data === "USERNAME_UPDATED") {
                setIsValid(true);
                setStatusMessage("Username updated successfully");
                setIsManuallyCleared(false); // Reset flag after successful update
            }
        };

        socket.addEventListener('message', handleMessage);
        return () => socket.removeEventListener('message', handleMessage);
    }, [socket, onUsernameChange, username, isManuallyCleared]);

    const handleChange = (e) => {
        const newUsername = e.target.value;
        setUsername(newUsername);
        setStatusMessage("");
        setIsValid(true);

        // Clear any pending updates
        if (typingTimeout) {
            clearTimeout(typingTimeout);
        }

        // If user manually cleared the field
        if (newUsername === "") {
            setIsManuallyCleared(true);
            return;
        }

        // Set a timeout to send the update after typing stops (500ms delay)
        const timeout = setTimeout(() => {
            if (socket?.readyState === WebSocket.OPEN) {
                socket.send(`SET_USERNAME:${newUsername}`);
                onUsernameChange(newUsername);
            }
        }, 500);

        setTypingTimeout(timeout);
    };

    // Clean up timeout on unmount
    useEffect(() => {
        return () => {
            if (typingTimeout) {
                clearTimeout(typingTimeout);
            }
        };
    }, [typingTimeout]);

    return (
        <div>
            <p>Nickname 😈</p>
            <input 
                type="text" 
                placeholder={isManuallyCleared ? "Type a nickname or leave empty" : "Moji Master 😈"} 
                value={username}
                onChange={handleChange} 
            />
        </div>
    );
}

export default NicknameInput
