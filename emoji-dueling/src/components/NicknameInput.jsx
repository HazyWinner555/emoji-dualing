/*
    This should update the username sent to the server.
*/
import React from 'react';
import ServerConnection from '../components/ServerConnection';

function NickNameInput() {
    const socket = ServerConnection();
    const [username, setUsername] = React.useState("");
    const [lastUpdate, setLastUpdate] = React.useState(0);
    const [updated, setUpdated] = React.useState(false);

    const handleChange = (e) => {
        const newUsername = e.target.value;
        setUsername(newUsername);

        const now = Date.now();
        if (now - lastUpdate > 500) {
            setLastUpdate(now);
            setUpdated(false);
        }

        setTimeout(() => {
            if (socket && socket.readyState === WebSocket.OPEN) {
                socket.send(`SET_USERNAME:${newUsername}`);
                setUpdated(true);
            }
        }, 500);
    };

    return (
        <div>
            <p>
                Nickname 😈
            </p>
            <input 
                type="text" 
                placeholder="Moji Master 😈" 
                value={username}
                onChange={handleChange} 
            />
            <p>{updated && <span style={{color: "green"}}>Username updated: {username}</span>}</p>
        </div>
    );
}

export default NickNameInput;
