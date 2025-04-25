import { useNavigate } from "react-router-dom"
import logo from "../assets/Emoji Dueling Logo.png"
import { useEffect, useState } from "react"
import "../css/Home.css"
import NickNameInput from "../components/NicknameInput"
import RoomCodeInput from "../components/RoomCodeInput"
import LobbyContainerPurple from "../components/LobbyContainerPurple.jsx"
import LobbyContainerOrange from "../components/LobbyContainerOrange.jsx"
import JoinRoom from "../components/JoinRoom"

function Lobby() {


    const navigate = useNavigate()
    return (
        <>
            <div className="container">

                <div className="lobbyContainers">
                    <LobbyContainerPurple />
                    <LobbyContainerOrange />
                </div>

                <div className="lobbyInputs">
                    <NickNameInput />
                    <RoomCodeInput />
                </div>

                <div className="lobbyButtons">
                    <button className="button-ready"> <b> READY </b> </button>
                    <button className="button-purple" onClick={() => { navigate(`/`) }}>Exit Lobby</button>
                </div>
                {/* Routes need to eventually be changed to handle dynamic room links. LATER */}
            </div>
        </>
    )
}

export default Lobby