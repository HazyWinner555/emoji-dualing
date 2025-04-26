import { useEffect, useState } from "react"
import UserStatus from "../components/UserStatus"
import { useNavigate, useParams } from "react-router-dom"
import EmojiInput from "../components/EmojiInput"
import "../css/Duel.css"

function Duel(props) {
    // props.userusername
    // props.opponentusername
    // 
    const isTesting = true
    const isTestingOpponentReaction = true
    const { roomCode, userIsHost: userIsHostParam } = useParams()
    const userIsHost = userIsHostParam === "host"
    const opponentIsHost = !userIsHost
    const [userUsername, setUserUsername] = useState(null)
    const [userLives, setUserLives] = useState(3)
    const [opponentUsername, setOpponentUsername] = useState(null)
    const [opponentLives, setOpponentLives] = useState(3)
    const navigate = useNavigate()
    const [questionEmoji, setQuestionEmoji] = useState()
    const [emojiList, setEmojiList] = useState([])
    const [playerTapEmoji, setPlayerTapEmoji] = useState()
    const [playerTapCorrectness, setPlayerTapCorrectness] = useState(0)
    const [opponentTap, setOpponentTap] = useState(0)
    const [isRevealed, setIsRevealed] = useState(false)

    useEffect(() => {

        if (isTesting) {
            setUserUsername("😈 Moji Master")
            setOpponentUsername("👑 Moticon Champion")
            setEmojiList(["😈", "👑", "👻", "📋"])
            setQuestionEmoji("😈")
        }
    }, ([]))
    function submitPlayerTap(emoji) {
        if (isTesting) {
            // LOCAL FAKE SERVER
            if (emoji === questionEmoji) {
                setPlayerTapCorrectness(2);
            } else {
                setPlayerTapCorrectness(1);
            }
        } else {
            // REAL SERVER CALL GOES HERE
            // Example:
            // socket.emit('playerTap', { emoji });
        }

    }

    function submitOpponentTap(emoji) {
        if (isTesting) {
            setOpponentTap(1);
        }
    }
    function handlePlayerTap(emoji) {
        setPlayerTapEmoji(emoji);
        setPlayerTapCorrectness(-1); // Waiting for server
        submitPlayerTap(emoji);
    }

    return (
        <>
            <UserStatus username={userUsername} lives={userLives} isHost={userIsHost} view="duel" />

            <div>
                {/* Ready? / Set / Go! / You got it! (time) / You didn’t get it! (time) / They got it (time) / They didn’t get it (time) */}
                <div className="emoji-input-container">
                    <EmojiInput emoji={questionEmoji} isQuestion={true} isRevealed={isRevealed} />
                    {emojiList.map((index, key) => {
                        return (<EmojiInput key={key}
                            emoji={index} isQuestion={false}
                            questionEmoji={questionEmoji} playerTapEmoji={playerTapEmoji}
                            opponentTap={opponentTap} playerTapCorrectness={playerTapCorrectness} isRevealed={isRevealed}
                            onPlayerTap={handlePlayerTap} // Pass the function!
                        />)
                    })}
                </div>
                {isTesting ? <button onClick={() => {
                    setIsRevealed(!isRevealed)
                }}>Toggle Revealed</button> : ""}

                {isTesting ?
                    <div>
                        <button onClick={() => {
                            if (isRevealed) {
                                submitOpponentTap("😈")
                            }
                        }} >Test Opponent Reaction😈</button>
                        <button onClick={() => {
                            if (isRevealed) {
                                submitOpponentTap("👑")
                            }
                        }} >Test Opponent Reaction👑</button>
                    </div>
                    : ""}
            </div>

            <UserStatus username={opponentUsername} lives={opponentLives} isHost={opponentIsHost} view="duel" />
            {/* After each button press, a call to the server is made. After one player reaches 0 hearts, → https://trello.com/c/P72w7ddP/53-gameover-page */}
        </>
    )
}

export default Duel