import logo from "../assets/Emoji Dueling Logo.png"
import { useEffect, useState } from "react"
import "../css/Home.css"
import NickNameInput from "../components/NicknameInput"
import RoomCodeInput from "../components/RoomCodeInput"
import LobbyContainerPurple from "../components/LobbyContainerPurple.jsx"
import LobbyContainerOrange from "../components/LobbyContainerOrange.jsx"
import JoinRoom from "../components/JoinRoom"
import UserStatus from "../components/UserStatus"
import NicknameInput from "../components/NicknameInput"
import RoomCode from "../components/RoomCode"
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
            <div className="container">
                <div className="lobbyContainers">
                <UserStatus username={userUsername} isReady={userIsReady} isHost={userIsHost} score={userScore} view="lobby" />
                <UserStatus username={opponentUsername} isReady={opponentIsReady} isHost={opponentIsHost} score={opponentScore} view="lobby" />
                </div>
                <div className="lobbyInputs">
                <NicknameInput />
                
                <RoomCode roomCode={roomCode} />
                
                </div>
                <div className="lobbyButtons">
                <button className={"readyButton " + readyButtonClassName} onClick={(e) => { handleReady(e) }}>
                    {userIsReady ? "UNREADY" : "READY"}
                </button>
                <button className="button-purple" onClick={() => { navigate("/") }}>Return to Lobby</button>
                </div>
            </div>
        </>
    )
}

export default Lobby