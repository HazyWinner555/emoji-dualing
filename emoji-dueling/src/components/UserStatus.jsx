import "../css/Lobby.css"

function UserStatus(props) {
    var containerClass
    if (props.username == null) {
        containerClass = "nullContainer"
    }
    else if (props.isHost == true) {
        containerClass = "hostContainer"
    }
    else {
        containerClass = "guestContainer"
    }
    return (
        <>
            <div className={`userStatusContainer ${containerClass}`}>
                <div className="scoreContainer">
                    <p className="usernamePara">
                        {props.username ? props.username : "👻 Waiting for opponent"}
                    </p>

                    <p className="winsLossesPara">
                        {props.username ? `Wins ${props.score[0]} | Losses ${props.score[1]} ` : ""}
                    </p>

                </div>

                <div className="readyContainer">

                    {props.isReady ? "✔️" : "✖️"}
                </div>
            </div>
        </>
    )
}

export default UserStatus