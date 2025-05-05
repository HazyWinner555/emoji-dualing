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
import { useNavigate, useParams } from "react-router-dom"
import RoundSummary from "../components/RoundSummary";


function Gameover() {
    const isTesting = true;
    const testingRounds = 5;
    const { roomCode, userIsHost: userIsHostParam, userWin: userWinParam } = useParams()
    const userIsHost = userIsHostParam === "host"
    const navigate = useNavigate()

    const [userUsername, setUserUsername] = useState(null)
    const userWin = userWinParam
    const [userIsReady, setUserIsReady] = useState(false)

    const [opponentUsername, setOpponentUsername] = useState(null)
    const opponentWin = !userWin
    const [opponentIsReady, setOpponentReady] = useState(false)
    const [opponentLeft, setOpponentLeft] = useState(false)

    const [rounds, setRounds] = useState([])


    const [readyButtonClassName, setReadyButtonClassName] = useState("readyButtonReady")

    function handleReady(e) {                                       // The server should probably handle readying and unreadying.
        if (opponentLeft) {
            setReadyButtonClassName("opponentLeft")
        }
        else if (userIsReady) {
            setReadyButtonClassName("readyButtonReady")
            setUserIsReady(!userIsReady)
        }
        else if (!userIsReady) {
            setReadyButtonClassName("readyButtonUnready")
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
        if (isTesting && !userUsername && !opponentUsername) {
            setUserUsername("😈 Moji Master")
            setOpponentUsername("👑 Moticon Champion")
        }
    }, [isTesting, userUsername, opponentUsername])

    useEffect(() => {                                           // this can be deleted and the round stuff can be moved up to the previous useeffect.

        if (isTesting && userUsername && opponentUsername) {
            if (testingRounds == 5) {
                setRounds(
                    [
                        [`${userUsername.slice(0, 2)}`, 5000, true],
                        [`${opponentUsername.slice(0, 2)}`, 4500, true],
                        [`${userUsername.slice(0, 2)}`, 2500, false],
                        [`${opponentUsername.slice(0, 2)}`, 3000, false],
                        [`${userUsername.slice(0, 2)}`, 4000, true],
                    ]
                )
                setUserIsReady(false)
                setOpponentReady(false)
            }
        }

    }, [isTesting, testingRounds, userUsername, opponentUsername])


    return (
        <div className="logo-background">
            {userWin ? <>
                <h1> VICTORY </h1>
                <UserStatus winner={userWin} username={userUsername} view="gameover" />
                <UserStatus winner={opponentWin} username={opponentUsername} view="gameover" />
            </> : <>
                <h1> DEFEAT </h1>
                <UserStatus winner={opponentWin} username={opponentUsername} view="gameover" />
                <UserStatus winner={userWin} username={userUsername} view="gameover" />
            </>}
            {rounds.map((round, index) => {
                return (<RoundSummary userEmoji={rounds[index][0]} time={rounds[index][1]} isCorrect={rounds[index][2]} round={index + 1} />)
            })

            }
            {/* These buttons should all send calls to the server. */}
            <div className="game-over-buttons">
            <button className={`rematch-button ${readyButtonClassName}`} onClick={() => { handleReady() }}> {opponentLeft ? "Cannot rematch. Opponent left room." : ""}{userIsReady && !opponentLeft ? "" : "Rematch!"} {userIsReady && !opponentIsReady && !opponentLeft ? "Waiting for opponent..." : ""}</button>
            <button className="button-blue" onClick={() => { navigate(`/${roomCode}/${userIsHost}/lobby`) }}>Return to Lobby</button>
            <button className="lc-orange" onClick={() => { navigate(`/`) }}>Main Menu</button>
            </div>
        </div>
    )
}

export default Gameover