import { useState } from "react"
import { useNavigate } from "react-router-dom"

function JoinRoom() {
    const navigate = useNavigate()
    const [roomCode, setRoomCode] = useState("")
    const handleRoomCodeInputChange = (e) => {
        setRoomCode(e.target.value)
    }
    return (
        <>
            <div className="joinRoomContainer">
                <p> Room Code </p>
                <input type="text" placeholder="Room Code" value={roomCode} onChange={handleRoomCodeInputChange} />
                <button className="button-blue" onClick={() => {
                    if (roomCode) {
                        navigate(`/${roomCode}/guest/lobby`)
                    }
                    else {
                        alert("You must type in a room code before clicking join room.")
                    }
                }}>Join Room</button>
            </div>
        </>
    )
}

export default JoinRoom