

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
            
            <h2>Round {props.round}:
            <span className={`${correctnessClassName}`}>
            {props.userEmoji}  {props.time}
            </span></h2>
        </div>
    )
}

export default RoundSummary