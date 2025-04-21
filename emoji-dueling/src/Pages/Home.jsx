import { useNavigate } from "react-router-dom"
import logo from "../assets/Emoji Dueling Logo.png"
import { useEffect, useState } from "react"
import "../css/Home.css"
import NickNameInput from "../components/NicknameInput"
import JoinRoom from "../components/JoinRoom"

function Home() {
    function generateRoomLink() {


        const newRoomLink = "newRoomLink"
        return (newRoomLink)
    }
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
                <button onCanPlay={() => { navigate(`/${hostRoomLink}`) }}>Host Room</button>
            </div>
        </>
    )
}

export default Home