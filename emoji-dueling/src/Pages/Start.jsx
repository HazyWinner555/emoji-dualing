import UserStatus from "../components/UserStatus"
import "../css/Start.css"
import logo from "../assets/Emoji Dueling Logo.png"


function Start() {
    const isTestng = true
    let usernameX, usernameY, xWin, xLoss, yLoss, yWin
    if (isTestng) {
        usernameX = "abc"
        usernameY = "bcd"
        xWin = 10
        xLoss = 0
        yWin = 0
        yLoss = 10
        }

    return (
        <>
            <div className="container">
                <div className="x">
                    <UserStatus username={usernameX} wins={xWin} losses={xLoss} />
                </div>
                <img src={logo} className="logo" />
                <div className="y">
                <UserStatus username={usernameY} wins={yWin} losses={yLoss} />
                </div>
            </div>
        </>
    )
}

export default Start