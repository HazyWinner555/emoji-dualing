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
                Room Code
                <input type="text" placeholder="Room Code" value={roomCode} onChange={handleRoomCodeInputChange} />
                <button onClick={() => { navigate(`/${roomCode}/guest/lobby`) }}>Join Room</button>
            </div>
        </>
    )
}

export default JoinRoom