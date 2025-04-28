

function EmojiInput(props) {
    /*  There are four props this component accepts
            1. emoji (String) the emoji that goes inside the box
            2. isQuestion (boolean) whether or not it is the question emoji (ie, the one you have to match)
            3. questionEmoji (String) what the question emoji is (ie, the one you have to match) // this is so that we can compare a given answer to the question
            4. playerTapEmoji (String) which emoji the player tapped
            5. opponentTapStatus (int) whether or not the emoji is correct, and what the server response is.
                -1 awaiting server response
                0: the opponent has not tapped
                1: the opponent tapped
            6. playerTapStatus (int)
                -1: awaiting server response
                0: the player has not tapped
                1: the player tapped, and is incorrect
                2: the palyer tapped, and is correct

            all inputs are gray
            the player taps
                all inputs darken
                the correct input turns green
                if their input was incorrect
                    their input turns red
            the opponent taps
                all inputs darken
                the correct input turns green

    */
    function onClickHandler() {
        if (props.playerTapStatus === 0 && props.isRevealed) {
            props.onPlayerTap(props.emoji); // Tell parent: "they tapped this emoji!"
        }
    }

    if (props.isQuestion) {
        return (
            <>
                <div className="question-emoji-container"> {/*big and centered; gray background; may be better as a Button*/}
                    {props.isRevealed ? `${props.emoji}` : `?`}
                </div>
            </>
        )
    }
    else {
        var answerEmojiClass


        if (props.playerTapStatus <= 0) { // then the player has not yet tapped
            answerEmojiClass = "default"
        }

        if (props.opponentTapStatus > 0 || props.playerTapStatus > 0) { // then a tap has happened
            answerEmojiClass = "dark"
        }

        if (props.questionEmoji === props.emoji && (props.opponentTapStatus > 0 || props.playerTapStatus > 0)) { // then the player was correct && this was the one that they tapped && this is the correct emoji
            answerEmojiClass = "correct"
        }
        else if (props.playerTapEmoji === props.emoji && props.playerTapStatus == 1) { // then the player was incorrect && the player tapped THIS one
            answerEmojiClass = "incorrect"
        }

        return (
            <>
                <button onClick={(e) => { onClickHandler() }} className={`answer-emoji-container ${answerEmojiClass}`}> {/* Small, 1 out of 4; may be better as a Button*/}
                    {props.isRevealed ? `${props.emoji}` : "?"}
                </button>
            </>
        )
    }
}

export default EmojiInput