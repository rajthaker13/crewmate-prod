import React from "react";
import "../../styles/Header.css"
import { Avatar } from "@material-ui/core";
import AccessTimeIcon from "@material-ui/icons/AccessTime";
import SearchIcon from "@material-ui/icons/Search";
import HelpOutlineIcon from "@material-ui/icons/HelpOutline";
import { useStateValue } from "../utility/StateProvider";
import backdrop from '../../assets/backdrop.gif'

function Header() {
    const [{ user }] = useStateValue();

    return (
        <div style={{ backgroundImage: `url(${backdrop})`, height: '12vh', display: 'flex' }}>
            <div className="header_left">
                <Avatar
                    alt='crewmate-logo'
                    src={require('../../assets/crewmate-logo.png')}
                    style={{ height: '15vw', width: 'auto', }}
                />
            </div>

            <div className="header_center">

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
        //     <div className="header_right">
        //         <HelpOutlineIcon />
        //     </div>
        // </div>
    );
}

export default Header;