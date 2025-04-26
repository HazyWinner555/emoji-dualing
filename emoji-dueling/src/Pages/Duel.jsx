import { useEffect, useState } from "react"
import UserStatus from "../components/UserStatus"
import { useNavigate, useParams } from "react-router-dom"


function Duel(props) {
    // props.userusername
    // props.opponentusername
    // 
    const isTesting = true
    const isTestingOpponentReaction = true
    const { userIsHost } = useParams()
    const { roomCode } = useParams();
    const [userUsername, setUserUsername] = useState(null)
    const [userLives, setUserLives] = useState(3)
    const [opponentUsername, setOpponentUsername] = useState(null)
    const opponentIsHost = !userIsHost
    const [opponentLives, setOpponentLives] = useState(3)
    const navigate = useNavigate()

    if (isTesting) {
        setOpponentUsername("👑 Moticon Champion")
    }

    useEffect(() => {

        if (isTesting) {
            setUserUsername("😈 Moji Master")
            setUserHost(true)
            setUserReady(false)
        }
        if (!(isTestingNullUser) && isTesting) {
            setOpponentUsername("👑 Moticon Champion")
            setOpponentHost(false)
            setOpponentLives([0, 5])
            setOpponentReady(true)
        } else if (isTestingNullUser && isTesting) {
            setOpponentUsername(null)
            setOpponentHost(null)
            setOpponentLives([0, 0])
            setOpponentReady(null)
        }
    }, ([]))
    return (
        <>
            <UserStatus />

            <div>

                Ready? / Set / Go! / You got it! (time) / You didn’t get it! (time) / They got it (time) / They didn’t get it (time)

                Question https://trello.com/c/snzEXP7l/39-emoji-container

                Answer  https://trello.com/c/snzEXP7l/39-emoji-container x 4

            </div>

            Player https://trello.com/c/J6F3FPdL/36-user-status (lives, player)

            After each button press, a call to the server is made. After one player reaches 0 hearts, → https://trello.com/c/P72w7ddP/53-gameover-page
        </>
    )
}

export default Duel