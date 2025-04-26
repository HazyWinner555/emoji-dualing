

function RoomCode(props) {
    var roomCode = props.roomCode
    function copyRoomCode(e) {
        navigator.clipboard.writeText(roomCode)
    }
    return (
        <>
            <p>Room Code </p>
            <div className="roomCodeInputContainer">
                
                <p className="roomCodeInput">{roomCode}</p>
                <button className="copyButton" onClick={(e) => { copyRoomCode(e) }}>📋</button>
            </div>
        </>
    )
}

export default RoomCode