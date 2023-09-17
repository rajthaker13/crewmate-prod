import React, { useState } from "react";
import { Avatar } from "@material-ui/core";
import { useStateValue } from "../utility/StateProvider";
import { useNavigate } from "react-router-dom";
import { slide as Menu } from 'react-burger-menu';
import '../../styles/Header.css'

function Header(props) {
    const [isMobile, setIsMobile] = useState(props.mobile)
    const [navbarOpen, setNavbarOpen] = useState(false);
    const navigate = useNavigate()


    return (
        <div>
            {!isMobile && <div style={{ height: '12vh', display: 'flex', }}>
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
            </div>}
            {isMobile && props.guest &&
                < div style={{ height: '8vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Avatar
                        alt='crewmate-logo'
                        src={require('../../assets/group3Gang.png')}
                        style={{ height: '5vh', width: 'auto', }}
                    />
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
            }

            {isMobile && !props.guest &&

                <div style={{ height: '10vh', display: 'flex', flexDirection: 'row' }}>

                    <Menu>
                        <a className="menu-item" onClick={() => { navigate("/") }}>
                            Search
                        </a>
                        <a className="menu-item" onClick={() => { navigate("/pathways") }}>
                            My Jobs
                        </a>
                    </Menu>
                </div>

            }
        </div >

    );
}

export default Header;