/*
    Navigate function needs to create a room and then navigate to that room.  
    Once the room is created, the roomCode needs ot be updated.
    As long as the roomCode sent from the server is updated properly, the first navigate should work correctly, and further naigation works as is.
    The generic links are as follows:
        /roomCode/isHost/Page
    The only non-Page Component that needs updating is NickNameInput.
*/

import { useNavigate } from "react-router-dom"
import logo from "../assets/Emoji Dueling Logo.png"
import { useEffect, useState } from "react"
import "../css/Home.css"
import NickNameInput from "../components/NicknameInput"
import JoinRoom from "../components/JoinRoom"

function Home() {

    function joinRoomChangeHandler(e) {
        setJoinRoomLink(e)
        console.log(e, joinRoomLink)
    }
    const navigate = useNavigate()
    const [joinRoomLink, setJoinRoomLink] = useState("")
    const [hostRoomLink, setHostRoomLink] = useState("")
    return (
        <>
            <div className="container">

                <img src={logo} className="logo" />
                <NickNameInput />
                <JoinRoom />
<<<<<<< HEAD
                <button className="button-purple" onClick={() => { navigate(`${Math.random().toString(36).slice(2, 7)}/host/lobby`) }}>Host Room</button>
                {/* Routes need to eventually be changed to handle dynamic room links. LATER */}
=======
                <button onClick={() => { navigate(`${Math.random().toString(36).slice(2, 7)}/host/lobby`) }}>Host Room</button>
>>>>>>> main
            </div>
        </>
    )
}

export default Home