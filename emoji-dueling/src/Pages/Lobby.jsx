import { useNavigate } from "react-router-dom"
import logo from "../assets/Emoji Dueling Logo.png"
import { useEffect, useState } from "react"
import "../css/Home.css"
import NickNameInput from "../components/NicknameInput"
import RoomCodeInput from "../components/RoomCodeInput"
import JoinRoom from "../components/JoinRoom"

function Lobby() {


    const navigate = useNavigate()
    return (
        <>
            <div className="container">

                <NickNameInput />
                <RoomCodeInput />
                <button className="button-ready"> READY </button>
                <button className="button-purple" onClick={() => { navigate(`/`) }}>Exit Lobby</button>
                {/* Routes need to eventually be changed to handle dynamic room links. LATER */}
            </div>
        </>
    )
}

export default Lobby