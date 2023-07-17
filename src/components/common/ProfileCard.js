import React, { useEffect, useState } from "react";
import { useStateValue } from "../utility/StateProvider";
import { Card, Grid, Text, Link, Button } from '@nextui-org/react';
import db, { auth, provider, functions } from '../../firebase/firebase';
import { collection, addDoc, setDoc, doc, getDoc, updateDoc, getDocs } from "firebase/firestore";
import fetch from 'node-fetch'
import '../../styles/ProfileCard.css'
import { FaPeriscope, FaTelegramPlane, FaBlackTie, FaWarehouse, FaBookmark, FaPeopleArrows } from 'react-icons/fa';


function ProfileCard({ profileRec = false }) {

    const [addedToCrew, setAddedToCrew] = useState(false)

    useEffect(() => {
        console.log(profileRec)
    }, [])
    return (
        <div className="card_profile">
            <div style={{ flexDirection: 'row', display: 'inline-flex', minHeight: '10vh', maxHeight: '10vh' }}>
                <img className="crewmate_profile_icon" src={require('../../assets/amani.jpeg')} style={{ height: '75px', width: '75px' }}></img>
                <h3 className="company_name">{profileRec}</h3>
            </div>

            <div style={{ flexDirection: 'row', display: 'inline-flex', minHeight: '7vh', maxHeight: '7vh' }}>
                <h4 className="crewmate_job_title">Director of Anesthesia - Barnes Jewish Hospital</h4>
            </div>
            <div style={{ flexDirection: 'row', display: 'inline-flex', minHeight: '9vh', maxHeight: '9vh' }}>
                <h6 className="crewmate_description">With passions for Healthcare and Art, I have combined my interests to find unique experiences in the field. A formal medical illustrator, I have now entered the Healthcare Adminstration space where I currently work as a Director at Barnes Jewish Hospital in Saint Louis. </h6>
            </div>
            <div style={{ flexDirection: 'row', display: 'inline-flex', minHeight: '3vh', maxHeight: '3vh' }}>
                <FaPeriscope color='#FAFAFA' size={25} className="crewmate_location_icon" />
                <h5 className="crewmate_location">Saint Louis, MO</h5>
            </div>
            <div className="crew_break" />
            <div style={{ flexDirection: 'row', display: 'inline-flex', minHeight: '3vh', maxHeight: '3vh' }}>
                <FaBlackTie color='#FAFAFA' size={25} className="job_info_icon" />
                <h6 className="job_info">{`Seniority: Director`}</h6>
            </div>
            <div style={{ flexDirection: 'row', display: 'inline-flex', minHeight: '4vh', maxHeight: '4vh' }}>
                <FaWarehouse color='#FAFAFA' size={25} className="job_info_icon" />
                <h6 className="job_info">{`Industry: Healthcare`}</h6>
            </div>
            <div className="crew_break" />
            <div style={{ flexDirection: 'row', display: 'inline-flex', }}>
                <button className="add_to_crew_button" onClick={() => { { setAddedToCrew(!addedToCrew) } }}>
                    <div style={{ flexDirection: 'row', display: 'inline-flex', minHeight: '50vh', minWidth: '20vw', justifyContent: 'center' }}>
                        <img src={require("../../assets/crewmate-emblem.png")} className="apply_icon" ></img>
                        {!addedToCrew && <h4 className="apply_text">Add to Crew</h4>}
                        {addedToCrew && <h4 className="apply_text">Requested</h4>}
                    </div>
                </button>
            </div >

        </div>
    )
}

export default ProfileCard