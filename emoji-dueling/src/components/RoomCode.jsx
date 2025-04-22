

function RoomCode(props) {
    var roomCode = props.roomCode
    function copyRoomCode(e) {
        navigator.clipboard.writeText(roomCode)
    }
    return (
        <>
            <p>Room Code </p>
            <div className="roomCodeInputContainer">
                <input readonly
                    className="roomCodeInput" value={roomCode} />
                <button className="copyButton" onClick={(e) => { copyRoomCode(e) }}>📋</button>
            </div>
        </>
    )
}

export default RoomCode