import React, { useEffect, useState } from "react";
import { useStateValue } from "../components/utility/StateProvider";
import backdrop from "../assets/backdrop.gif";
import sample from '../data/sample.json';
import { getUserAndProductEmbeddings, getJobRecommendation } from "../open_ai/OpenAI"
import { Card, Grid, Text, Link, Button } from '@nextui-org/react';
import db, { auth, provider, functions, storage } from '../firebase/firebase';
import JobCard from "../components/common/JobCard";
import SearchBar from "../components/common/SearchBar";
import Bucket from "../components/home/Bucket";
import profile from '../data/profile.json';
import axios from 'axios';
import { getStorage, ref, listAll } from "firebase/storage";
import { collection, addDoc, setDoc, doc, getDoc, updateDoc, getDocs } from "firebase/firestore";
import Modal from "../components/home/Modal";
import { createCheckoutSession } from "../stripe/createCheckoutSession";
import usePremiumStatus from "../stripe/usePremiumStatus";



function Home() {
    const [state, dispatch] = useStateValue();
    const [jobRecs, setJobRecs] = useState([])
    const [experienceRecs, setExperienceRecs] = useState([])
    const [profileRec, setProfileRec] = useState([])
    const [isSearching, setIsSearching] = useState(false)
    const [openModal, setOpenModal] = useState(false)
    const [experience, setExperience] = useState('')
    const userIsPremium = usePremiumStatus(auth.currentUser)
    const [location, setLocation] = useState('')

    useEffect(() => {
        async function getData() {

            let checkModal = true
            let email

            if (!auth.currentUser) {
                email = "rajthaker13@yahoo.com"
            }
            else {
                email = auth.currentUser.email
            }
            const usersRef = doc(db, "users", email)
            const usersSnap = await getDoc(usersRef)

            if (usersSnap.exists()) {
                const data = usersSnap.data()['data']
                if (data != null) {
                    checkModal = false
                    setExperience(JSON.stringify(usersSnap.data()['data'].member_experience_collection))
                    setLocation(usersSnap.data()['data'].country)

                }
            }
            setOpenModal(checkModal)

        }
        getData()


    }, [])

    return (
        <div style={{ height: '88vh' }}>
            {isSearching && <Modal setOpenModal={setOpenModal} isSearchingModal={true} />}
            {openModal && <Modal setOpenModal={setOpenModal} />}
            <SearchBar setJobRecs={setJobRecs} setIsSearching={setIsSearching} isSearching={isSearching} setProfileRec={setProfileRec} experience={experience} setExperienceRecs={setExperienceRecs} location={location} />
            <div style={{ display: 'inline-flex', marginTop: '5vh' }}>
                {jobRecs && jobRecs.map((job, index) => {
                    return (
                        <JobCard job={job} index={index} xs={80} isSearching={isSearching} />

                    )
                })}
                {/* <Bucket isFirstBucket={true} jobRecs={jobRecs} isSearching={isSearching} experienceRecs={experienceRecs} /> */}
                {/* {!state.guestView && <Bucket profileRec={profileRec} isSearching={isSearching} />} */}
            </div>
            {/* <button onClick={() => { createCheckoutSession(auth.currentUser.uid) }}></button> */}
        </div >

    );
}

export default Home;
