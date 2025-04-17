import { useNavigate } from "react-router-dom"
import logo from "../assets/logo.png"
import { useEffect, useState } from "react"
import "../css/Home.css"

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
            <div className="home-page-container">

                <img src={logo} />
                <p>Join Room</p>
                <input type="text" placeholder="room link" onChange={(e) => { joinRoomChangeHandler(e) }} />
                <button onClick={() => { navigate(`/${joinRoomLink}`) }}>Join Room</button>
                <button onCanPlay={() => { navigate(`/${hostRoomLink}`) }}></button>
            </div>
        </>
    )
}

export default Home