import { useNavigate } from "react-router-dom"

function JoinRoom() {

    return (
        <>
            <div className="joinRoomContainer">
                <p> Room Code</p>
                <input type="text" placeholder="Room Code" />
                <button className="button-blue" onClick={() => { navigate(`/lobby`) }}>Join Room</button>
                {/* Routes need to be updated to take dynamic room codes. */}
            </div>
        </>
    )
}

export default JoinRoom