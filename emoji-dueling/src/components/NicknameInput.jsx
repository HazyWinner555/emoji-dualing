/*
    This should update the username sent to the server.
*/

function NickNameInput() {

    return (
        <>
            <div>

                <p>Nickname 😈</p>
                <input type="text" placeholder="Moji Master 😈" />
                {/* use "socket.emit('SET_USERNAME', { username })" */}
                
            </div>
        </>
    )
}

export default NickNameInput
