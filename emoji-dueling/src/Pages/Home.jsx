/*
    Navigate function needs to create a room and then navigate to that room.  
    Once the room is created, the roomCode needs ot be updated.
    As long as the roomCode sent from the server is updated properly, the first navigate should work correctly, and further naigation works as is.
    The generic links are as follows:
        /roomCode/isHost/Page
    The only non-Page Component that needs updating is NickNameInput.
*/

import { useNavigate } from "react-router-dom";
import logo from "../assets/Emoji Dueling Logo.png";
import { useEffect, useState, useCallback } from "react";
import "../css/Home.css";
import NickNameInput from "../components/NicknameInput";
import JoinRoom from "../components/JoinRoom";
import ServerConnection from "../components/ServerConnection";

function Home() {
    const [roomID, setRoomID] = useState(null);
    const [joinRoomLink, setJoinRoomLink] = useState("");
    const [username, setUsername] = useState("");
    const navigate = useNavigate();
    const socket = ServerConnection();

    useEffect(() => {
        if (socket) {
            const handleMessage = (event) => {
                if (event.data.startsWith("ROOM_CREATED:")) {
                    const newRoomID = event.data.split(":")[1];
                    setRoomID(newRoomID);
                    navigate(`/${newRoomID}/host/lobby`);
                } else if (event.data.startsWith("DEFAULT_USERNAME_SET:")) {
                    setUsername(event.data.split(":")[1]);
                }
            };
            
            socket.addEventListener('message', handleMessage);
            
            return () => {
                socket.removeEventListener('message', handleMessage);
            };
        }
    }, [socket, navigate]);

    const createRoomAndNavigate = useCallback(() => {
        if (!socket) {
            alert("Not connected to server. Please refresh the page.");
            return;
        }
    
        // Check connection state with more detailed handling
        if (socket.readyState === WebSocket.CONNECTING) {
            const timeout = setTimeout(() => {
                if (socket.readyState !== WebSocket.OPEN) {
                    alert("Connection taking too long. Please refresh the page.");
                }
            }, 2000);
            return () => clearTimeout(timeout);
        }
    
        if (socket.readyState !== WebSocket.OPEN) {
            alert("Connection not ready. Please wait...");
            return;
        }
    
        try {
            socket.send("CREATE_ROOM");
        } catch (error) {
            console.error("Error sending CREATE_ROOM:", error);
            alert("Failed to create room. Please try again.");
        }
    }, [socket]);

    function joinRoomChangeHandler(e) {
        setJoinRoomLink(e.target.value);
    }

    const handleUsernameChange = (newUsername) => {
        setUsername(newUsername);
        if (socket && socket.readyState === WebSocket.OPEN) {
            socket.send(`SET_USERNAME:${newUsername}`);
        }
    };

    return (
        <div className="container">
            <img src={logo} className="logo" alt="Emoji Dueling Logo" />
            <NickNameInput 
                onUsernameChange={handleUsernameChange} 
                initialUsername={username}
            />
            <JoinRoom onChange={joinRoomChangeHandler} />
            <button onClick={createRoomAndNavigate}>Host Room</button>
        </div>
    );
}

export default Home