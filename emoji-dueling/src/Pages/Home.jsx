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
    const navigate = useNavigate();
    const socket = ServerConnection();

    useEffect(() => {
        if (socket) {
            const handleMessage = (event) => {
                if (event.data.startsWith("ROOM_CREATED:")) {
                    const newRoomID = event.data.split(":")[1];
                    setRoomID(newRoomID);
                    navigate(`/${newRoomID}/host/lobby`);
                }
            };
            
            socket.addEventListener('message', handleMessage);
            
            return () => {
                socket.removeEventListener('message', handleMessage);
            };
        }
    }, [socket, navigate]);

    const createRoomAndNavigate = useCallback(() => {
        if (socket && socket.readyState === WebSocket.OPEN) {
            socket.send("CREATE_ROOM");
        }
    }, [socket]);

    function joinRoomChangeHandler(e) {
        setJoinRoomLink(e.target.value);
    }

    return (
        <div className="container">
            <img src={logo} className="logo" alt="Emoji Dueling Logo" />
            <NickNameInput />
            <JoinRoom onChange={joinRoomChangeHandler} />
            <button onClick={createRoomAndNavigate}>Host Room</button>
        </div>
    );
}

export default Home;