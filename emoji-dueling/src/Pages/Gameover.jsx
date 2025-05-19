/*
    Data should be taken from the server.
        User data: username, win state (boolean), ready state (boolean)
            Note that, until then
        Rounds: userEmoji (first character in username), time (int/long), correctness (boolean)
    Functions to be moved to the server:
        handleReady() - toggles between ready states (boolean). If opponent has left, does not toggle.
    Navigation buttons should send server calls when the player leaves this page.
 */
import "../css/Gameover.css"
import { useEffect, useState } from "react"
import UserStatus from "../components/UserStatus"
import { useNavigate, useParams, useLocation } from "react-router-dom"
import RoundSummary from "../components/RoundSummary";
import "../css/Gameover.css"

function Gameover() {
    const presentationMode = true;
    const testingRounds = 5;
    const { roomCode, userIsHost: userIsHostParam } = useParams()
    const userIsHost = userIsHostParam === "host"
    const navigate = useNavigate()
    const location = useLocation();
    const reactionTimes = location.state?.reactionTimes;


    const [userUsername, setUserUsername] = useState(null)
    const [userWin, setUserWin] = useState()
    const [userIsReady, setUserIsReady] = useState(false)

    const [opponentUsername, setOpponentUsername] = useState(null)
    const [opponentWin, setOpponentWin] = useState()
    const [opponentIsReady, setOpponentReady] = useState(false)
    const [opponentLeft, setOpponentLeft] = useState(false)

    const [rounds, setRounds] = useState([])
    const [rematchButtonClassName, setRematchButtonClassName] = useState("rematchButtonUnready")
    useEffect(() => {
        const victory = localStorage.getItem("victory") === "true";
        setUserWin(victory)
        setOpponentWin(!victory)
    }, ([]))

    function handleReady(e) {
        console.log(userIsReady)
        // The server should probably handle readying and unreadying.
        if (opponentLeft) {
            setRematchButtonClassName("opponentLeft")
        }
        else if (userIsReady) {
            setRematchButtonClassName("rematchButtonUnready")
            setUserIsReady(!userIsReady)
        }
        else if (!userIsReady) {
            setRematchButtonClassName("rematchButtonReady")
            setUserIsReady(!userIsReady)
        }
        console.log(userIsReady)
    }

    // the server should be able to tell when the opponent has left.

    useEffect(() => {
        if (userIsReady && opponentIsReady) {
            navigate(`/${roomCode}/${userIsHost}/start`)
        }
    })

    useEffect(() => {                                           // The server should set up usernames & rounds.
        // Set default test usernames if they are not yet set
        if (presentationMode && !userUsername && !opponentUsername) {
            setUserUsername("😈 Moji Master")
            setOpponentUsername("👑 Moticon Champion")
        }
    }, [presentationMode, userUsername, opponentUsername])

    useEffect(() => {                                           // this can be deleted and the round stuff can be moved up to the previous useeffect.

        if (presentationMode && userUsername && opponentUsername) {
            if (testingRounds == 5) {
                setRounds(reactionTimes)
                setUserIsReady(false)
                setOpponentReady(false)
            }
        }

    }, [presentationMode, testingRounds, userUsername, opponentUsername])

    function extractUserEmoji(fullUsername) {
        const graphemes = Array.from(fullUsername);
        const emoji = graphemes[0];

        return (emoji)

    }

    return (
        <div className="logo-background">
            {userWin ? <>
                {console.log(userWin)}
                <h1> VICTORY </h1>
                <UserStatus winner={true} username={userUsername} view="gameover" />
                <UserStatus winner={false} username={opponentUsername} view="gameover" />
            </> : <>
                <h1> DEFEAT </h1>
                <UserStatus winner={false} username={userUsername} view="gameover" />
                <UserStatus winner={true} username={opponentUsername} view="gameover" />
            </>}
            <div className="roundSummaryContainer">
                {rounds.map((round, index) => {
                    return (<RoundSummary index={index} userEmoji={extractUserEmoji(rounds[index][0])} time={rounds[index][1]} isCorrect={rounds[index][2]} />)
                })
                }
            </div>
            {/* These buttons should all send calls to the server. */}
            <div className="game-over-buttons">
            <button className={`rematch-button ${rematchButtonClassName}`} onClick={() => {
                handleReady()
            }}> {opponentLeft ? "Cannot rematch. Opponent left room." : ""}{userIsReady && !opponentLeft ? "" : "Rematch!"} {userIsReady && !opponentIsReady && !opponentLeft ? "Waiting for opponent..." : ""}</button>
            <button className="button-blue" onClick={() => {
                localStorage.removeItem("victory")
                navigate(`/${roomCode}/${userIsHost}/lobby`)
            }}>
                Return to lobby.
            </button>
            <button className="lc-orange" onClick={() => {
                localStorage.removeItem("victory")
                navigate(`/`)
            }}>
                Return to main menu.
            </button>
        </div>
    )
}

export default Gameover