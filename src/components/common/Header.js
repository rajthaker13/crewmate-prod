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
                    src={require('../../assets/group3Gang.png')}
                    style={{ height: '3vw', width: 'auto', }}
                />
            </div>
            {props.guest == false &&
                <div className="header_right">
                    <button class="astext" onClick={() => { navigate("/") }}>
                        <h4 class="header_labels">Home</h4>
                    </button>
                    <button class="astext" onClick={() => { navigate("/pathways") }}>
                        <h4 class="header_labels">My Jobs</h4>
                    </button>
                </div>
            }


        </div>
    );
}

export default Header;