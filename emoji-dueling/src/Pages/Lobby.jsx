/*
    User data should be taken from the server.
        Relevant user data: username, score (wins/losses), ready state, host state
        See full user object structure in the UserStatus component.
    Ensure navigate function works correctly with server.
       The generic links are as follows:
        /roomCode/isHost/Page

*/

import UserStatus from "../components/UserStatus";
import NicknameInput from "../components/NicknameInput";
import RoomCode from "../components/RoomCode";
import { useState, useEffect } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import ServerConnection from "../components/ServerConnection";

function Lobby() {
    const [userUsername, setUserUsername] = useState(null);
    const [userScore, setUserScore] = useState([0, 0]);
    const [userIsReady, setUserReady] = useState(false);
    const [username, setUsername] = useState(null);
    const [opponentUsername, setOpponentUsername] = useState(null);
    const [opponentScore, setOpponentScore] = useState([0, 0]);
    const [opponentIsReady, setOpponentReady] = useState(false);
    const [connectionError, setConnectionError] = useState(null);
    const { roomCode, userIsHost: userIsHostParam } = useParams();
    const userIsHost = userIsHostParam === "host";
    const opponentIsHost = !userIsHost;
    const socket = ServerConnection();
    const navigate = useNavigate();
    const location = useLocation();
    let refreshInterval;

    useEffect(() => {
        if (!socket || socket.readyState !== WebSocket.OPEN) {
            setConnectionError("Not connected to server");
            return;
        }

        // Initial data load when first joining
        if (location.state?.justJoined) {
            socket.send("GET_PLAYER_INFO");
            socket.send("GET_OPPONENT_INFO");
        }

        const handleMessage = (event) => {
            const data = event.data;
            console.log("Received:", data); // Debug logging
            
            if (data.startsWith("PLAYER_INFO:")) {
                const parts = data.split(":");
                setUserUsername(parts[1]);
                setUserScore([parseInt(parts[2]), parseInt(parts[3])]);
            }
            else if (data.startsWith("OPPONENT_INFO:")) {
                const parts = data.split(":");
                setOpponentUsername(parts[1] === "null" ? null : parts[1]);
                setOpponentScore([parseInt(parts[2]), parseInt(parts[3])]);
            }
            else if (data === "OPPONENT_READY") {
                setOpponentReady(true);
            }
            else if (data === "OPPONENT_UNREADY") {
                setOpponentReady(false);
            }
            else if (data === "GAME_STARTING") {
                navigate(`/${roomCode}/${userIsHostParam}/start`);
            }
            else if (data === "PLAYER_JOINED") {
                // When new player joins, refresh opponent info
                socket.send("GET_OPPONENT_INFO");
            }
            else if (data === "HOST_DISCONNECTED") {
                alert("The host has left the game. Returning to main menu.");
                navigate("/");
            }
            else if (data === "PLAYER_DISCONNECTED") {
                setOpponentUsername(null);
                setOpponentScore([0, 0]);
                setOpponentReady(false);
                alert("Your opponent has left the game");
            }
            else if (data.startsWith("ERROR:")) {
                setConnectionError(data.split(":")[1]);
            }
        };

        refreshInterval = setInterval(() => {
            if (socket && socket.readyState === WebSocket.OPEN) {
                socket.send("GET_PLAYER_INFO");
                socket.send("GET_OPPONENT_INFO");
            }
        }, 500);

        socket.addEventListener('message', handleMessage);
        return () => {
            socket.removeEventListener('message', handleMessage);
            clearInterval(refreshInterval);
            
            // Send leave message when exiting lobby
            if (socket && socket.readyState === WebSocket.OPEN) {
                socket.send("LEAVE");
            }
        };
    }, [socket, roomCode, userIsHostParam]);

    const handleReady = (e) => {
        e.preventDefault();
        if (!socket || socket.readyState !== WebSocket.OPEN) {
            setConnectionError("Not connected to server");
            return;
        }

        const newReadyState = !userIsReady;
        setUserReady(newReadyState);
        
        if (newReadyState) {
            socket.send("READY_UP");
        } else {
            socket.send("UNREADY");
        }
    };

    const handleUsernameChange = (newUsername) => {
        if (socket && socket.readyState === WebSocket.OPEN) {
            socket.send(`SET_USERNAME:${newUsername}`);
        }
    };

    const handleExitLobby = () => {
        if (socket && socket.readyState === WebSocket.OPEN) {
            socket.send("LEAVE");
        }
        if (userIsHost) {
            alert("You have left the game. Your opponent will be returned to the main menu.");
        }
        navigate("/");
    };

    const readyButtonClassName = userIsReady ? "readyButtonUnready" : "readyButtonReady";

    return (
        <div className="lobbyContainer">

            
            <UserStatus 
                username={userUsername} 
                onChange={handleUsernameChange}
                isReady={userIsReady} 
                isHost={userIsHost} 
                score={userScore} 
                view="lobby" 
            />
            <UserStatus 
                username={opponentUsername || "null"} 
                isReady={opponentIsReady} 
                isHost={opponentIsHost} 
                score={opponentScore} 
                view="lobby" 
            />
            
            <NicknameInput
                onUsernameChange={(newUsername) => {
                    if (socket && socket.readyState === WebSocket.OPEN) {
                        socket.send(`SET_USERNAME:${newUsername}`);
                        setUserUsername(newUsername); // Update local state
                    }
                }}
                initialUsername={userUsername}
            />
            <RoomCode roomCode={roomCode} />
            
            <button 
                className={"readyButton " + readyButtonClassName} 
                onClick={handleReady}
                disabled={!opponentUsername} // Disable if no opponent
            >
                {userIsReady ? "UNREADY" : "READY"}
            </button>
            
            <button 
                className="exitLobbbyButton" 
                onClick={handleExitLobby}
            >
                Exit Lobby
            </button>
        </div>
    );
}

export default Lobby