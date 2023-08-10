import React, { useEffect, useState } from "react";
import { useStateValue } from "../components/utility/StateProvider";
import backdrop from "../assets/backdrop.gif";
import sample from '../data/sample.json';
import { getUserAndProductEmbeddings, getJobRecommendation } from "../open_ai/OpenAI"
import { Card, Grid, Text, Link, Button } from '@nextui-org/react';
import db, { auth, provider, functions } from '../firebase/firebase';
import JobCard from "../components/common/JobCard";
import SearchBar from "../components/common/SearchBar";
import { useLocation, useNavigate } from "react-router-dom";
import { FaPeriscope, FaTelegramPlane, FaBlackTie, FaWarehouse, FaBookmark, FaPeopleArrows } from 'react-icons/fa';
import axios from 'axios';
import { collection, addDoc, setDoc, doc, getDoc, updateDoc, getDocs } from "firebase/firestore";
import { createCoverLetter, createResumeText } from "../open_ai/OpenAI";
import clipboardCopy from 'clipboard-copy';
import Modal from "../components/home/Modal";


function ExploreJob() {
    const { state } = useLocation();
    const [job, setJob] = useState(state.job)
    const [pic, setPic] = useState(state.pfp)
    const [jobRecs, setJobRecs] = useState(state.jobRecs)
    const [jobSaved, setJobSaved] = useState(false)
    const [videos, setVideos] = useState([])
    const [isCopiedCover, setIsCopiedCover] = useState(false);
    const [isCopiedResume, setIsCopiedResume] = useState(false);
    const [isGenerating, setIsGenerating] = useState(false)
    const navigation = useNavigate();

    const extractWords = (text, wordCount) => {
        const words = text.split(' ');
        const extractedWords = words.slice(0, wordCount);
        return extractedWords.join(' ');
    };

    // const description = extractWords(job.description, 20) + "...";
    const description = job.description

    useEffect(() => {
        async function getData() {
            const link = `https://vast-waters-56699-3595bd537b3a.herokuapp.com/https://us-central1-crewmate-prod.cloudfunctions.net/getYoutubeVideos`
            await axios.post(link, { company_name: job.company_name, title: job.title }, { headers: { 'Content-Type': 'application/json' } }).then(async (res) => {
                console.log(res.data)
                setVideos(res.data)
            })

        }
        console.log(job)
        // getData()

    }, [])

    async function generateCoverLetter() {
        setIsGenerating(true)
        let userRef
        if (!auth.currentUser) {
            userRef = doc(db, "users", 'rajthaker13@yahoo.com')
        }
        else {
            userRef = doc(db, "users", auth.currentUser.email)
        }
        const userSnap = await getDoc(userRef)
        if (userSnap.exists()) {
            const userData = userSnap.data()['data']
            const text = await createCoverLetter(job, userData)
            console.log(text)
            clipboardCopy(text);
            setIsCopiedCover(true);
            setIsGenerating(false)
            setTimeout(() => {
                setIsCopiedCover(false);
            }, 1500);
        }
    }

    async function generateResumeText() {
        setIsGenerating(true)
        let userRef
        if (!auth.currentUser) {
            userRef = doc(db, "users", 'rajthaker13@yahoo.com')
        }
        else {
            userRef = doc(db, "users", auth.currentUser.email)
        }
        const userSnap = await getDoc(userRef)
        if (userSnap.exists()) {
            const userData = userSnap.data()['data']
            const text = await createResumeText(job, userData)
            console.log(text)
            clipboardCopy(text);
            setIsCopiedResume(true);
            setIsGenerating(false)
            setTimeout(() => {
                setIsCopiedResume(false);
            }, 1500);
        }
    }
    return (
        <div style={{ height: '88vh', }}>
            {isGenerating && <Modal setOpenModal={setIsGenerating} isSearchingModal={true} text="Copying Text to Clipboard..." />}
            <div className="card" style={{ width: "auto", }} >
                <div style={{ height: '88vh', flexDirection: 'column' }}>
                    <button onClick={() => { navigation(jobRecs ? '/' : '/pathways', { state: { jobRecs: jobRecs } }) }}>Go Back</button>
                    <div style={{ flexDirection: 'row', display: 'inline-flex', minHeight: 'auto', maxHeight: 'auto', minWidth: 'auto', maxWidth: 'auto' }}>
                        <img className="profile_icon" src={pic} style={{ height: '75px', width: '75px' }} onError={({ currentTarget }) => {
                            currentTarget.onerror = null; // prevents looping
                            currentTarget.src = require('../assets/crewmate-emblem.png');
                        }}></img>
                        <h3 className="company_name">{job.company_name}</h3>
                        <FaBookmark color={jobSaved ? "#9921e8" : '#FAFAFA'} size={25} className="job_bookmark_icon" />
                    </div>
                    <div style={{ flexDirection: 'row', display: 'inline-flex', minHeight: 'auto', maxHeight: 'auto', minWidth: 'auto' }}>
                        <h4 className="job_title" style={{ height: 'auto', minHeight: 'auto' }}>{job.title}</h4>
                    </div>
                    <div style={{ flexDirection: 'row', display: 'inline-flex', minHeight: 'auto', maxHeight: 'auto' }}>
                        <h6 className="job_description">{description}</h6>
                    </div>
                    <button onClick={generateCoverLetter}>{isCopiedCover ? 'Copied!' : 'Generate Cover Letter'}</button>
                    <button onClick={generateResumeText}>{isCopiedResume ? 'Copied!' : 'Generate Resume Text'}</button>
                    {/* {videos.map((video) => {
                        return (
                            <div>
                                <h2>{video.snippet.title}</h2>
                                <iframe
                                    title={video.snippet.title}
                                    width="560"
                                    height="315"
                                    src={`https://www.youtube.com/embed/${video.id.videoId}`}
                                    frameBorder="0"
                                    allow="autoplay; encrypted-media"
                                    allowFullScreen
                                ></iframe>
                            </div>
                        )
                    })} */}
                </div>
            </div>
        </div>
    )
}

export default ExploreJob