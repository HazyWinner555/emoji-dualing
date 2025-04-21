import { useNavigate } from "react-router-dom"

function JoinRoom() {

    return (
        <>
            <div className="joinRoomContainer">
                Room Code
                <input type="text" placeholder="Room Code" />
                <button onClick={() => { navigate(`/lobby`) }}>Join Room</button>
                {/* Routes need to be updated to take dynamic room codes. */}
            </div>
        </>
    )
}

export default JoinRoom