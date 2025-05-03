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
    if (props.view === "lobby") {
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
    else if (props.view === "duel") {
        let heartString = ""
        for (let i = 0; i < props.lives; i++) {
            if (props.isHost) {
                heartString += "💜"
            } else {
                heartString += "❤️"
            }
            
        }
        for (let i = props.lives; i < 3; i++) {
            heartString += "🖤"
        }

        if (props.isOpponent) {
            return (<div className={`userStatusContainer ${containerClass}`}> {/*Flip justify-content between user and opponent.*/}
                <p className="usernamePara">
                    {props.username}
                </p>
                <p className="hearts"> {heartString} </p>
            </div>
            )
        } else {
            return (<div className={`userStatusContainer ${containerClass}`}> {/*Flip justify-content between user and opponent.*/}
                <p className="hearts"> {heartString} </p>
                <p className="usernamePara">
                    {props.username}
                </p>
            </div>
            )
        }
        
    }
}

export default UserStatus