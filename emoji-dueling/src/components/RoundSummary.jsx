

function RoundSummary(props) {
    var correctnessClassName
    if (props.isCorrect) {
        correctnessClassName = "go-correct"
    }
    else {
        correctnessClassName = "go-incorrect"
    }
    return (
        <div className={`roundSummary`}>
            {props.userEmoji}
            <span className={"round-label"}>
                Round {props.index}: {" "}
            </span>
            <span className={`${correctnessClassName}`}>
                {(props.time / 1000).toFixed(3)} Seconds
            </span>
        </div>
    )
}

export default RoundSummary