import UserStatus from "../components/UserStatus"
import NicknameInput from "../components/NicknameInput"
import RoomCode from "../components/RoomCode"
import { useState } from "react"
import { useEffect } from "react"


function Lobby() {
    const isTesting = true
    const isTestingNullUser = true
    const [userUsername, setUserUsername] = useState(null)
    const [userIsHost, setUserHost] = useState(true)
    const [userScore, setUserScore] = useState([0, 0])
    const [userIsReady, setUserReady] = useState(false)
    const [opponentUsername, setOpponentUsername] = useState(null)
    const [opponentIsHost, setOpponentHost] = useState(false)
    const [opponentScore, setOpponentScore] = useState([0, 0])
    const [opponentIsReady, setOpponentReady] = useState(false)
    useEffect(() => {

        if (isTesting) {
            setUserUsername("😈 Moji Master")
            setUserHost(true)
            setUserScore([5, 0])
            setUserReady(false)
        }
        if (!(isTestingNullUser) && isTesting) {
            setOpponentUsername("👑 Moticon Champion")
            setOpponentHost(false)
            setOpponentScore([0, 5])
            setOpponentReady(true)
        } else if (isTestingNullUser && isTesting) {
            setOpponentUsername(null)
            setOpponentHost(null)
            setOpponentScore([0, 0])
            setOpponentReady(null)
        }
    }, ([]))

    var readyButtonClassName = userIsReady ? "readyButtonReady" : "readyButtonUnready"
    function handleReady(e) {
        e.preventDefault()
        setUserReady(!(userIsReady))
    }
    return (
        <>
            <div className="lobbyContainer">
                <UserStatus username={userUsername} isReady={userIsReady} isHost={userIsHost} score={userScore} />
                <UserStatus username={opponentUsername} isReady={opponentIsReady} isHost={opponentIsHost} score={opponentScore} />
                <NicknameInput />
                <RoomCode roomCode="HARD-CODE" />
                {/* Needs to be changed */}
                <button className={"readyButton " + readyButtonClassName} onClick={(e) => { handleReady(e) }}>
                    {userIsReady ? "READY" : "UNREADY"}
                </button>
            </div>
        </>
    )
}

export default Lobby