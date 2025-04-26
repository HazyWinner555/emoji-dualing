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
                <button className="button-blue" onClick={() => { navigate(`/${roomCode}/guest/lobby`) }}>Join Room</button>
                {/* Routes need to be updated to take dynamic room codes. */}
            </div>
        </>
    )
}

export default JoinRoom