/*
    User data should be taken from the server.
        Relevant user data: username, score (wins/losses), host state
        See full user object structure in the UserStatus component.    
    Ensure navigate function works correctly with server.
        The generic links are as follows:
        /roomCode/isHost/Page
*/

import UserStatus from "../components/UserStatus"
import "../css/Start.css"
import logo from "../assets/Emoji Dueling Logo.png"
import vsLogo from "../assets/vsLogo.png"
import { useState } from "react"
import { useEffect } from "react"
import { useNavigate, useParams } from "react-router-dom"

function Start() {
    const isTestng = true

    const navigate = useNavigate()
    const { roomCode, userIsHost: userIsHostParam } = useParams()
    const userIsHost = userIsHostParam === "host"
    const opponentIsHost = !userIsHost

    let playerUsername, opponentUsername, playerWins, playerLoss, opponentWins, opponentLoss, isHost
    
    if (isTestng) {                                                 // All of thiss data should be set up by the server.
        playerUsername = "😈 Moji Master"
        opponentUsername = "👑 Moticon Champion"
        playerWins = 10
        playerLoss = 0
        opponentWins = 0
        opponentLoss = 10
        isHost = userIsHost
    }
    useEffect(() => {
        const moveToDuelPage = setTimeout(() => {
            navigate(`/${roomCode}/${userIsHostParam}/duel`)
        }, 3000);
        return () => clearTimeout(moveToDuelPage);
    }, []);

    return (
        <>
            <div>
                <div>
                    <UserStatus username={opponentUsername} wins={opponentWins} losses={opponentLoss} view={"start"} isHost={isHost} />
                </div>
                <img src={vsLogo} className="vslogo" />
                <div>
                    <UserStatus username={playerUsername} wins={playerWins} losses={playerLoss} view={"start"} isHost={isHost} />
                </div>
            </div>
        </>
    )
}

export default Start