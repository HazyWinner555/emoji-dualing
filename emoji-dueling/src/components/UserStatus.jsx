function UserStatus(props) {

    return (
        <>
            <div className="UserStatusContainer">
                <div className="block">
                    {props.username}
                </div>
                <div className="wl">
                    <div className="block">
                        {props.wins}
                    </div>
                    <div className="block">
                        {props.losses}
                    </div>
                </div>
            </div>
        </>
    )
}

export default UserStatus