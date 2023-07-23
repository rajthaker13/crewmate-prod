import React, { useEffect, useState } from "react";
import { useStateValue } from "../utility/StateProvider";
import { Card, Grid, Text, Link, Button } from '@nextui-org/react';
import db, { auth, provider, functions } from '../../firebase/firebase';
import { collection, addDoc, setDoc, doc, getDoc, updateDoc, getDocs } from "firebase/firestore";
import fetch from 'node-fetch'
import '../../styles/ProfileCard.css'
import { FaPeriscope, FaTelegramPlane, FaBlackTie, FaWarehouse, FaBookmark, FaPeopleArrows } from 'react-icons/fa';


function ProfileCard({ profileRec = false, mini = false, outgoing = false, addConversation }) {

    const [addedToCrew, setAddedToCrew] = useState(false)
    const [experience, setExperience] = useState([])

    useEffect(() => {
        let work_experience = []
        let companies = []
        if (profileRec != false) {
            profileRec.data?.member_experience_collection.toReversed().map((work) => {
                if (!companies.includes(work.company_name)) {
                    companies.push(work.company_name)
                    work_experience.push(work)
                }
            })
            setExperience(work_experience)
            console.log(experience)

        }
    }, [])

    async function onAdd() {
        if (addedToCrew == false) {
            setAddedToCrew(true)
            let curUserEmail
            if (!auth.currentUser) {
                curUserEmail = 'rajthaker13@yahoo.com'
            }
            else {
                curUserEmail = auth.currentUser.email
            }

            const email = profileRec.email
            const requestRef = doc(db, "requests", email)
            const requestSnap = await getDoc(requestRef)

            const outgoingReq = doc(db, "requests", curUserEmail)

            if (requestSnap.exists()) {
                let curRequests = requestSnap.data()['incoming']
                curRequests.push(curUserEmail)
                await updateDoc(requestRef, {
                    incoming: curRequests
                })
            }
            else {
                await setDoc(requestRef, {
                    incoming: [curUserEmail],
                    outgoing: []
                })
            }

            const outgoingSnap = await getDoc(outgoingReq)

            if (outgoingSnap.exists()) {
                let curOutgoing = outgoingSnap.data()['outgoing']
                curOutgoing.push(email)
                await updateDoc(outgoingReq, {
                    outgoing: curOutgoing
                })
            }
            else {
                await setDoc(outgoingReq, {
                    incoming: [],
                    outgoing: [email]
                })

            }
        }
    }

    async function onAccept() {
        addConversation(profileRec.email, profileRec.data)

    }

    return (
        <div className="card_profile" >
            <div style={{ flexDirection: 'row', display: 'inline-flex', minHeight: 'auto', maxHeight: 'auto' }}>
                <img className="crewmate_profile_icon" src={profileRec.data?.logo_url} style={{ height: '75px', width: '75px' }}></img>
                <h3 className="company_name">{profileRec.data?.name}</h3>
            </div>

            <div style={{ flexDirection: 'row', display: 'inline-flex', minHeight: 'auto', maxHeight: 'auto' }}>
                <h4 className="crewmate_job_title">{profileRec.data?.title}</h4>
            </div>
            {!mini && <div style={{ flexDirection: 'row', display: 'inline-flex', minHeight: 'auto', maxHeight: 'auto' }}>
                <h6 className="crewmate_description">{profileRec.data?.summary} </h6>
            </div>}
            <div style={{ flexDirection: 'row', display: 'inline-flex', minHeight: 'auto', maxHeight: 'auto' }}>
                <FaPeriscope color='#FAFAFA' size={25} className="crewmate_location_icon" />
                <h5 className="crewmate_location">{profileRec.data?.location}</h5>
            </div>
            <div className="crew_break" />
            {!mini && <>
                {experience.map((job) => {
                    return (
                        <div style={{ flexDirection: 'row', display: 'inline-flex', minHeight: 'auto', maxHeight: 'auto' }}>
                            <FaBlackTie color='#FAFAFA' size={25} className="job_info_icon" />
                            <h6 className="job_experience">{`${job.title} @ ${job.company_name}`}</h6>
                        </div>
                    )
                })}
                <div className="crew_break" />
            </>
            }
            {!outgoing && <div style={{ flexDirection: 'row', display: 'inline-flex', justifyContent: 'center' }}>
                <button className="add_to_crew_button" onClick={mini ? onAccept : onAdd}>
                    <div style={{ flexDirection: 'row', display: 'inline-flex', minHeight: 'auto', minWidth: 'auto', justifyContent: 'center', }}>
                        {/* <img src={require("../../assets/crewmate-emblem.png")} style={{ height: mini ? "30px" : "50px", width: mini ? "30px" : "50px" }}></img> */}
                        {!addedToCrew && <h4 className="apply_text">Add to Crew</h4>}
                        {addedToCrew && <h4 className="apply_text">Requested</h4>}
                    </div>
                </button>
            </div >}
            {outgoing && <h5 className="crewmate_location">PENDING</h5>}

            <div style={{ flexDirection: 'row', display: 'inline-flex', minHeight: '5vh', minWidth: '20vw', justifyContent: 'center', }} />
        </div>
    )
}

export default ProfileCard