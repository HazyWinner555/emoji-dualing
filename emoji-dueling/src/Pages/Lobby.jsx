import UserStatus from "../components/UserStatus"
import NicknameInput from "../components/NicknameInput"
import RoomCode from "../components/RoomCode"
import { useState } from "react"
import { useEffect } from "react"
import { useNavigate, useParams } from "react-router-dom"


function Lobby() {
    const isTesting = true
    const isTestingNullUser = false
    const [userUsername, setUserUsername] = useState(null)
    const [userScore, setUserScore] = useState([0, 0])
    const [userIsReady, setUserReady] = useState(false)
    const [opponentUsername, setOpponentUsername] = useState(null)
    const [opponentScore, setOpponentScore] = useState([0, 0])
    const [opponentIsReady, setOpponentReady] = useState(false)
    const { roomCode, userIsHost: userIsHostParam } = useParams()
    const userIsHost = userIsHostParam === "host"
    const opponentIsHost = !userIsHost
    const navigate = useNavigate();
    useEffect(() => {

        if (isTesting) {
            setUserUsername("😈 Moji Master")
            setUserScore([5, 0])
            setUserReady(false)
        }
        if (!(isTestingNullUser) && isTesting) {
            setOpponentUsername("👑 Moticon Champion")
            setOpponentScore([0, 5])
            setOpponentReady(true)
        } else if (isTestingNullUser && isTesting) {
            setOpponentUsername(null)
            setOpponentScore([0, 0])
            setOpponentReady(null)
        }
    }, ([]))

    var readyButtonClassName = userIsReady ? "readyButtonUnready" : "readyButtonReady"
    function handleReady(e) {
        e.preventDefault()
        setUserReady(!(userIsReady))
    }

    useEffect(() => {
        if (userIsReady && opponentIsReady) {
            navigate(`/${roomCode}/${userIsHostParam}/start`)
        }
    }, [userIsReady, opponentIsReady])

    return (
        <>
            <div className="lobbyContainer">
                <UserStatus username={userUsername} isReady={userIsReady} isHost={userIsHost} score={userScore} view="lobby" />
                <UserStatus username={opponentUsername} isReady={opponentIsReady} isHost={opponentIsHost} score={opponentScore} view="lobby" />
                <NicknameInput />
                <RoomCode roomCode={roomCode} />
                <button className={"readyButton " + readyButtonClassName} onClick={(e) => { handleReady(e) }}>
                    {userIsReady ? "UNREADY" : "READY"}
                </button>
                <button onClick={() => { navigate("/") }}>Return to Lobby</button>
            </div>
        </>
    )
}

export default Lobby