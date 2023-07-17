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



function Home() {
    const [state, dispatch] = useStateValue();
    const [jobRecs, setJobRecs] = useState([])
    const [profileRec, setProfileRec] = useState([])
    const [isSearching, setIsSearching] = useState(false)
    const [openModal, setOpenModal] = useState(false)

    useEffect(() => {
        async function getData() {
            const usersRef = collection(db, "users")
            const usersSnap = await getDocs(usersRef)

            let checkModal = true
            let email

            if (!auth.currentUser) {
                email = "rajthaker13@yahoo.com"
            }
            else {
                email = auth.currentUser.email
            }

            usersSnap.forEach((user) => {
                if (user.data()['email'] == email) {
                    console.log("Myemail", email)
                    console.log("emai", user.data()['email'])
                    checkModal = false
                }
            })
            setOpenModal(checkModal)
            console.log("MODAL", openModal)
        }
        getData()


    }, [])

    return (
        <div style={{ height: '88vh' }}>
            {openModal && <Modal setOpenModal={setOpenModal} />}
            <SearchBar setJobRecs={setJobRecs} setIsSearching={setIsSearching} isSearching={isSearching} setProfileRec={setProfileRec} />
            <div style={{ display: 'inline-flex', marginTop: '5vh' }}>
                <Bucket isFirstBucket={true} jobRecs={jobRecs} isSearching={isSearching} />
                <Bucket profileRec={profileRec} isSearching={isSearching} />
            </div>

        </div >

    );
}

export default Home;
