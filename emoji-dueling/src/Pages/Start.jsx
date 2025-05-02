import UserStatus from "../components/UserStatus"
import "../css/Start.css"
import logo from "../assets/Emoji Dueling Logo.png"
import { useState } from "react"
import { useEffect } from "react"
import { useNavigate, useParams } from "react-router-dom"

function Start() {
    const isTestng = true

    const navigate = useNavigate()
    const { roomCode, userIsHost: userIsHostParam } = useParams()
    const userIsHost = userIsHostParam === "host"
    const opponentIsHost = !userIsHost

    let usernameX, usernameY, xWin, xLoss, yLoss, yWin
    if (isTestng) {
        usernameX = "abc"
        usernameY = "bcd"
        xWin = 10
        xLoss = 0
        yWin = 0
        yLoss = 10
    }
    useEffect(() => {
        const moveToDuelPage = setTimeout(() => {
            console.log("Function run!")
            navigate(`/${roomCode}/${userIsHostParam}/duel`)
        }, 5000);

        return () => clearTimeout(moveToDuelPage);
    }, []);

    return (
        <>
            <div className="container">
                <div className="x">
                    <UserStatus username={usernameX} wins={xWin} losses={xLoss} view={"start"} />
                </div>
                <img src={logo} className="logo" />
                <div className="y">
                    <UserStatus username={usernameY} wins={yWin} losses={yLoss} view={"start"} />
                </div>
            </div>
        </>
    )
}

export default Start