

function RoundSummary(props) {
    var correctnessClassName
    if (props.isCorrect) {
        correctnessClassName = "correct"
    }
    else {
        correctnessClassName = "incorrect"
    }
    return (
        <div className={`roundSummary`}>
            {props.userEmoji}
            <span className={`${correctnessClassName}`}>
                {props.time}
            </span>
        </div>
    )
}

export default RoundSummary