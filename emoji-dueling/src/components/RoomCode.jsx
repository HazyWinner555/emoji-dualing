

function RoomCode(props) {
    var roomCode = props.roomCode
    function copyRoomCode(e) {
        navigator.clipboard.writeText(roomCode)
    }
    return (
        <>
            <div className="roomCode">
            <p>Room Code </p>
            <div className="roomCodeInputContainer">
                
                <p className="roomCodeInput">{roomCode}</p>
                <button className="copyButton" onClick={(e) => { copyRoomCode(e) }}>📋</button>
            </div>
            </div>
        </>
    )
}

export default RoomCode