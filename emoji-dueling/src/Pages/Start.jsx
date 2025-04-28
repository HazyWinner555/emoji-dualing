import { useNavigate, useParams } from "react-router-dom"


function Start() {
    const navigate = useNavigate()
    const { roomCode, userIsHost: userIsHostParam } = useParams()
    const userIsHost = userIsHostParam === "host"
    const opponentIsHost = !userIsHost
    return (
        <>
            Start page text
            <button onClick={() => { navigate(`/${roomCode}/${userIsHostParam}/duel`) }}>Duel page</button>

        </>
    )
}

export default Start