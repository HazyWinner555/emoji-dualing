import { useNavigate } from "react-router-dom"

function JoinRoom() {

    return (
        <>
            <div className="joinRoomContainer">
                Room Code
                <input type="text" placeholder="Room Code" />
                <button onClick={() => { navigate(`/${joinRoomLink}`) }}>Join Room</button>
            </div>
        </>
    )
}

export default JoinRoom