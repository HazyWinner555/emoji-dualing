import { useState } from "react"
import { useNavigate } from "react-router-dom"
import ServerConnection from "./ServerConnection"

function JoinRoom() {
    const navigate = useNavigate();
    const [roomCode, setRoomCode] = useState("");
    const socket = ServerConnection();
    
    const handleJoinRoom = () => {
        if (!roomCode) {
            alert("You must type in a room code before clicking join room.");
            return;
        }

        // send the join command
        socket.send(`JOIN_ROOM:${roomCode}`);
        
        // navigate
        navigate(`/${roomCode}/guest/lobby`, {
            state: { justJoined: true } // Flag to trigger initial data load
        });
    };

    return (
        <div className="joinRoomContainer">
            Room Code
            <input type="text" placeholder="Room Code" value={roomCode} 
                   onChange={(e) => setRoomCode(e.target.value)} />
            <button className="joinRoomButton" onClick={handleJoinRoom}>
                Join Room
            </button>
        </div>
    );
}

export default JoinRoom