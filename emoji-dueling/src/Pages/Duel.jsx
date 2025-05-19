import { useEffect, useState } from "react"
import UserStatus from "../components/UserStatus"
import { useNavigate, useParams } from "react-router-dom"
import EmojiInput from "../components/EmojiInput"
import "../css/Duel.css"

/*
    TO DO:

    Randomize emoji list
    Send reaction times to the next page to determine the winner.
    ... use Context, probably. 
*/
function Duel(props) {
    const isTesting = true // to test opponent responses
    const testingButtons = false // to show or hide the test buttons

    // Room code will eventually connect to the Server.
    // UserIsHost & OpponentIsHost are for styling the boxes
    const { roomCode, userIsHost: userIsHostParam } = useParams()
    const userIsHost = userIsHostParam === "host"
    const opponentIsHost = !userIsHost

    // username and lives is for display in the boxes, and for tracking when the game ends.
    const [userUsername, setUserUsername] = useState(localStorage.getItem("username") ? localStorage.getItem("username") : "😈 Moji Master")
    const [userLives, setUserLives] = useState(3)
    const [opponentUsername, setOpponentUsername] = useState(null)
    const [opponentLives, setOpponentLives] = useState(3)

    // questionEmoji and emojiList are so that we can dynamically display different emojis to be matched.
    // isRevealed will allow users to see the emojis and tap them. (Won't accept tap unless revealed)
    const [questionEmoji, setQuestionEmoji] = useState()
    const [emojiList, setEmojiList] = useState([])
    const [isRevealed, setIsRevealed] = useState(false)
    const [playerTapEmoji, setPlayerTapEmoji] = useState(null)                    // playerTapEmoji, playerTapStatus, and opponentTapStatus are all for validating taps & locking out once either responds.
    const [playerTapStatus, setPlayerTapStatus] = useState(0)
    const [opponentTapStatus, setOpponentTapStatus] = useState(0)

    // gameover ensures that no further taps are made once the game ends
    const [gameover, setGameover] = useState(false)

    // roundText is for feedback so you know what's happening, roundStart is for measuring reaction time,
    // and reactionTimes are used to determine when the tap came in and also score at the end of the match
    const [roundText, setRoundText] = useState("")
    const [roundStart, setRoundStart] = useState(Date.now());
    const [reactionTimes, setReactionTimes] = useState([])

    // Variable that checks if the User won the round or not, for simplicity's sake
    var userWin = false;

    // This is so that we can use useNavigate
    const navigate = useNavigate()

    // Random number applied to the timer between each round.
    let delay = 3000;

    // This const contains all of the emojis
    const mojis = [
            "😀", "😃", "😄", "😁", "😆", "🥹", "😅", "😂", "🤣", "🥲",
            "☺️", "😇", "😊", "🙂", "🙃", "😉", "😌", "😍", "🥰", "😘",
            "😗", "😙", "😚", "😋", "😛", "😝", "😜", "🤪", "🤨", "🧐",
            "🤓", "😎", "🥸", "🤩", "🥳", "😏", "😒", "😞", "😔", "😟",
            "😕", "🙁", "☹️", "😣", "😖", "😫", "😩", "🥺", "😢", "😭",
            "😤", "😠", "🤯", "😳", "😶‍🌫️", "😱", "😨", "😰", "😥", "😓",
            "🤗", "🤔", "🫣", "🤭", "🫢", "🤫", "🫠", "🤥", "😶", "😐",
            "🫤", "😑", "🫨", "😬", "🙄", "😯", "😦", "😧", "😮", "😲",
            "😴", "😮‍💨", "🤐", "😵", "😵‍💫", "🥴"
            ]

    // This is an empty array for storing all of the emojis currently being used in this round
    let emojisChosen = [];
    let thisEmojis = [];
    let number = 0;


    // Gets a random emoji from the Emoji List, picking a different Emoji if the random number selects a duplicate.
    function getRandomEmoji() {
                var rand = Math.floor(Math.random() * (mojis.length - 1 + 1)) + 0
                let different = false
                while (different = false) {
                    if (emojisChosen.includes(mojis[rand])) {
                        rand = Math.floor(Math.random() * (mojis.length - 1 + 1)) + 0
                    } else {
                        different = true
                    }
                }
                
                    return rand
                
    }
                
    // Establish dummy variables for the user, opponent, and the emojis we're using.
    useEffect(() => {
        if (isTesting) {

            thisEmojis = ["?", "?", "?", "?"];

            setUserUsername(userUsername)
            setOpponentUsername("👑 Moticon Champion")
            setEmojiList(thisEmojis)
            setQuestionEmoji(thisEmojis[0])
            setRoundText("Ready...")
        }
    }, ([]))

    // Sets up the 4 emojis that will be used in the round.
    function setEmojis() {

            thisEmojis = [];
            emojisChosen = [];
            number = 0;

            for (let index = -1; index < 3; index++) {
                number = getRandomEmoji(emojisChosen, mojis)

                emojisChosen.push(number);
                console.log(emojisChosen)
                thisEmojis.push(mojis[number]);
                console.log(mojis[number])
                
            }
            setEmojiList(thisEmojis)
            setQuestionEmoji(thisEmojis[Math.floor(Math.random() * (3 - 0 + 1)) + 0])

    }

    // This handles game over, the end of a round, and moves you to the gameover page
    function handleLifeChange(userLives, opponentLives) {
        if (userLives <= 0 || opponentLives <= 0) {
            setGameover(true)
            if (userLives > opponentLives) {
                setRoundText(`Game Over!\n You won!`)
                localStorage.setItem("victory", true)
                localStorage.setItem("wins", (Number(localStorage.getItem("wins")) + 1))
                console.log(localStorage.getItem("wins"))
            }
            else {
                setRoundText(`Game Over!\n You lost!`)
                localStorage.setItem("victory", false)
                localStorage.setItem("losses", (Number(localStorage.getItem("losses")) + 1))
                console.log(localStorage.getItem("losses"))
            }

            console.log(reactionTimes)
            const moveToGameoverPage = setTimeout(() => {

                navigate(`/${roomCode}/${userIsHostParam}/gameover`, { state: { reactionTimes, userWin } })
            }, 3000);

            return () => clearTimeout(moveToGameoverPage)
        }
        else {


            const resetRoundVariables = setTimeout(() => {
                setPlayerTapStatus(0)
                setOpponentTapStatus(0)
                setRoundText("Ready...")
                setIsRevealed(false)
                setEmojis()
                setTimeout(() => {
                    setRoundText("Go!")
                    setRoundStart(Date.now());
                    setIsRevealed(true)
                }, delay);
            }, delay);
            delay = 1000 + Math.floor(Math.random() * 3000);


            return () => clearTimeout(resetRoundVariables);




            // send also who was the ender

        }
    }

    useEffect(() => {
        handleLifeChange(userLives, opponentLives)
    }, ([userLives, opponentLives]))


    function endRound(ender, isCorrect) {
        const roundEnd = Date.now();
        const timeElapsed = roundEnd - roundStart
        console.log(ender)
        setReactionTimes(prev => [...prev, [ender, timeElapsed, isCorrect]]);
        return (timeElapsed)
    }

    function submitPlayerTap(emoji) {
        if (isTesting) {
            // LOCAL FAKE SERVER
            if (!(playerTapStatus > 0) && !(opponentTapStatus > 0) && !gameover && userLives > 0 && opponentLives > 0) { // if the game is stll valid
                if (roundStart) {
                    const timeElapsed = endRound(userUsername, emoji === questionEmoji)
                    if (emoji === questionEmoji) { // if the user is right
                        setPlayerTapStatus(2); // correct player tap
                        setOpponentLives(opponentLives - 1);
                        setRoundText("Nice one! " + timeElapsed)
                    } else {
                        setPlayerTapStatus(1); // incorrect player tap
                        setUserLives(userLives - 1);
                        setRoundText("Not quite... " + timeElapsed)
                    }
                }
            }
        } else {
            // REAL SERVER CALL GOES HERE
            // Example:
            // socket.emit('playerTap', { emoji });
        }

    }

    function submitOpponentTapStatus(emoji) {
        if (isTesting) {
            if (!(playerTapStatus > 0) && !(opponentTapStatus > 0) && !gameover && userLives > 0 && opponentLives > 0) {
                // if nobody's tapped yet, and the game isn't over
                setOpponentTapStatus(1) // opponent tap received
                if (roundStart) {
                    const timeElapsed = endRound(opponentUsername, emoji === questionEmoji)
                    if (emoji === questionEmoji) { // correct opponent tap
                        setUserLives(userLives - 1);
                        setRoundText("Too slow! " + timeElapsed)
                    } else {
                        setOpponentLives(opponentLives - 1);
                        setRoundText("Free Win! " + timeElapsed)
                    }
                }

            }
        }
    }

    function handlePlayerTap(emoji) {
        setPlayerTapEmoji(emoji);
        setPlayerTapStatus(-1); // Waiting for server
        submitPlayerTap(emoji);
    }

    return (
        <>
            {/* opponent userstatus */}
            <UserStatus username={opponentUsername} lives={opponentLives} isHost={opponentIsHost} isOpponent={false} view="duel" />
            <div className="duelPage">
                {/* question emoji and answer emojis */}
                <div className="emoji-input-container">
                    <h1>{roundText}</h1>
                    <div className="question-container">
                        <EmojiInput emoji={questionEmoji} isQuestion={true} isRevealed={isRevealed}
                            questionEmoji={questionEmoji}
                            playerTapEmoji={playerTapEmoji}
                            opponentTapStatus={opponentTapStatus}
                            playerTapStatus={playerTapStatus}
                            onPlayerTap={handlePlayerTap} />
                    </div>
                    <div className="answers-container">
                        {emojiList.map((index, key) => {
                            return (<EmojiInput key={key}
                                emoji={index} isQuestion={false}
                                questionEmoji={questionEmoji} playerTapEmoji={playerTapEmoji}
                                opponentTapStatus={opponentTapStatus} playerTapStatus={playerTapStatus} isRevealed={isRevealed}
                                onPlayerTap={handlePlayerTap} // Pass the function!
                            />)
                        })}
                    </div>
                </div>
                {/* for testing mock responses (just change the isTesting variable to enable all testing) */}
                {testingButtons ?

                    <div>
                        <button onClick={() => {
                            if (isRevealed) {
                                submitOpponentTapStatus("😈")
                            }
                        }} >Test Opponent Reaction😈</button>
                        <button onClick={() => {
                            if (isRevealed) {
                                submitOpponentTapStatus("👑")
                            }
                        }} >Test Opponent Reaction👑</button>
                    </div>
                    : ""}
            </div>
            {/* player userStatus */}
            <UserStatus username={userUsername} lives={userLives} isHost={userIsHost} isOpponent={true} view="duel" />
        </>
    )
}

export default Duel