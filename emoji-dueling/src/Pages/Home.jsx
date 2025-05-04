/*
    Navigate function needs to create a room and then navigate to that room.  
    Once the room is created, the roomCode needs ot be updated.
    As long as the roomCode sent from the server is updated properly, the first navigate should work correctly, and further naigation works as is.
    The generic links are as follows:
        /roomCode/isHost/Page
    The only non-Page Component that needs updating is NickNameInput.
*/

<<<<<<< Updated upstream
import { useNavigate } from "react-router-dom"
import logo from "../assets/Emoji Dueling Logo.png"
import { useEffect, useState } from "react"
import "../css/Home.css"
import NickNameInput from "../components/NicknameInput"
import JoinRoom from "../components/JoinRoom"
import { useServer } from '../components/ServerContext';
import RoomCode from "../components/RoomCode"
function Home() {
    // const { send, connected, messages, roomState, requestRoomCreation } = useServer();


    const navigate = useNavigate()
    // const [hostRoomLink, setHostRoomLink] = useState("")
    return (
        <>
            <div className="container">

                <img src={logo} className="logo" />
                <NickNameInput />
                <JoinRoom />
                <button className="hostRoomButton" onClick={() => {
                    // requestRoomCreation((roomID) => {                        when server integration works properly, this will be how.
                    //     console.log("Room created with ID:", roomID);
                    //     navigate(`/${roomID}/host/lobby`);
                    // });
                    navigate(`${Math.random().toString(36).slice(2, 7)}/host/lobby`)
                }}>
                    Host Room
                </button>

            </div>
        </>
    )
}

export default Home;