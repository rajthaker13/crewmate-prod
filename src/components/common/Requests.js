import React, { useEffect, useState } from "react";
import { useStateValue } from "../utility/StateProvider";
import { Card, Grid, Text, Link, Button } from '@nextui-org/react';
import db, { auth, provider, functions } from '../../firebase/firebase';
import { collection, addDoc, setDoc, doc, getDoc, updateDoc, getDocs } from "firebase/firestore";
import fetch from 'node-fetch'
import '../../styles/Requests.css'
import { FaPeriscope, FaTelegramPlane, FaBlackTie, FaWarehouse, FaBookmark, FaPeopleArrows } from 'react-icons/fa';


function Requests() {
    const [incoming, setIncoming] = useState(false)
    const [outgoing, setOutgoing] = useState(false)
    useEffect(() => {


    }, [])

    return (
        <div style={{ display: 'inline-flex' }}>
            <div style={{ backgroundColor: '#1fd1f9', height: '88vh', width: '20vw', backgroundImage: 'linear-gradient(315deg, #1fd1f9 0%, #b621fe 74%)', borderRadius: '20px', overflow: 'auto', justifyContent: 'center' }}>
                <h3 style={{ fontFamily: 'Inter', color: '#FFFFFF', fontWeight: '400', marginTop: '5%' }}>Incoming Requests</h3>
                <div style={{ height: '1vh' }} />
                <div className="container_requests">
                    <div style={{ height: '3vh' }} />
                    {incoming == false && <h4 style={{ fontFamily: 'Inter', color: '#FFFFFF', fontWeight: '400', textAlign: 'center', }}>No Incoming Requests</h4>}
                    <div style={{ height: '3vh' }} />
                </div>

                <h3 style={{ fontFamily: 'Inter', color: '#FFFFFF', fontWeight: '400', marginTop: '5%' }}>Outgoing Requests</h3>
                <div style={{ height: '1vh' }} />
                <div className="container_requests">
                    <div style={{ height: '3vh' }} />
                    {outgoing == false && <h4 style={{ fontFamily: 'Inter', color: '#FFFFFF', fontWeight: '400', textAlign: 'center', }}>No Outgoing Requests</h4>}
                    <div style={{ height: '3vh' }} />
                </div>
            </div>

        </div>


    )

}

export default Requests