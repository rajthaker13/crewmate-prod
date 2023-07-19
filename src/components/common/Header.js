import React from "react";
import "../../styles/Header.css"
import { Avatar } from "@material-ui/core";
import AccessTimeIcon from "@material-ui/icons/AccessTime";
import SearchIcon from "@material-ui/icons/Search";
import HelpOutlineIcon from "@material-ui/icons/HelpOutline";
import { useStateValue } from "../utility/StateProvider";
import { Button } from "@nextui-org/react";
import { useNavigate } from "react-router-dom";

function Header(props) {
    const [{ user, guestView }] = useStateValue();
    const navigate = useNavigate()

    return (
        <div style={{ height: '12vh', display: 'flex', }}>
            <div className="header_left">
                <Avatar
                    alt='crewmate-logo'
                    src={require('../../assets/crewmate-logo.png')}
                    style={{ height: '15vw', width: 'auto', }}
                />
            </div>
            <div className="header_right">
                <button class="astext" onClick={() => { navigate("/") }}>
                    <h4 class="header_labels">Home</h4>
                </button>
                {!guestView && <button class="astext" onClick={() => { navigate("/community") }}>
                    <h4 class="header_labels">Community</h4>
                </button>}
                {!guestView && <button class="astext" onClick={() => { navigate('/profile') }}>
                    <h4 class="header_labels">Profile</h4>
                </button>}
            </div>


        </div>
        // <div className="header">
        //     <div className="header_left">
        // <Avatar
        //     alt='crewmate-logo'
        //     src={require('../../assets/crewmate-emblem.png')}
        //     sx={{ height: '70px', width: '70px' }}
        // />
        //         <AccessTimeIcon />
        //     </div>
        //     <div className="header_search">
        //         <SearchIcon />
        //         <input placeholder="Search something here" style={{ backgroundColor: 'white' }} />
        //     </div>
        // <div className="header_right">
        //     <HelpOutlineIcon />
        // </div>
        // </div>
    );
}

export default Header;