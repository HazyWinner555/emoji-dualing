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
            <div className={`userStatusContainer ${containerClass}`}>
                <div className="scoreContainer">
                    <p className="usernamePara">
                        {!props.username || props.username === "null" 
                            ? "👻 Waiting for opponent..." 
                            : props.username}
                    </p>
                    <p className="winsLossesPara">
                        {props.username && props.username !== "null" 
                            ? `Wins ${props.score[0]} | Losses ${props.score[1]}` 
                            : ""}
                    </p>
                </div>
                <div className="readyContainer">
                    {props.isReady ? "✔️" : "✖️"}
                </div>
            </div>
        );
    }
    else if (props.view === "start") {
        let host = "na";
        if (props.isHost == true) {
            host = "hostContainer"
        } else {
            host = "guestContainer"
        }

        return (
        <>
            <div className={`userStatusContainer startContainer ${host}`}>
                <div className="usernamePara">
                    {props.username}
                </div>
                <div className="win-lose">
                    <div className="block">
                        Wins: {props.wins}
                    </div>
                    <div className="block">
                        Losses: {props.losses}
                    </div>
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

        if (props.isOpponent == false) {
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
    else if (props.view === "gameover") {
        if (props.winner == true) {
            containerClass = "winnerContainer"
        }
        else {
            containerClass = "loserContainer"
        }
        
        return (
            <>
                <div className={`userStatusContainer ${containerClass} gameover`}>
                    <div className="scoreContainer">
                        <p className="usernamePara">
                            <span className="userEmoji">{props.username ? (props.username.slice(0, 2)) : ""}</span>{props.username ? props.username.slice(2, props.username.legnth) : ""}
                        </p>
                    </div>

                    <div className="victoryContainer">
                        {props.winner ? "WIN" : "LOSS"}
                    </div>
                </div>
            </>
        )
    }
}

export default UserStatus