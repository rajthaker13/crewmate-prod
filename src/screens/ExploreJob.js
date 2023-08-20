import React, { useEffect, useState } from "react";
import { useStateValue } from "../components/utility/StateProvider";
import backdrop from "../assets/backdrop.gif";
import sample from '../data/sample.json';
import { getUserAndProductEmbeddings, getJobRecommendation } from "../open_ai/OpenAI"
import { Card, Grid, Text, Link, Button, Dropdown } from '@nextui-org/react';
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
import '../styles/ExploreJob.css'
import GenerateModal from "../components/pathways/GenerateModal";


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

    const [isGeneratingResume, setIsGeneratingResume] = useState(false)
    const [isGeneratingCover, setIsGeneratingCover] = useState(false)
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
        setIsGeneratingCover(true)
    }

    async function generateResumeText() {
        setIsGenerating(true)
        setIsGeneratingResume(true)
    }
    return (
        <div style={{ height: '88vh', }}>
            {isGenerating && <GenerateModal isGeneratingResume={isGeneratingResume} isGeneratingCover={isGeneratingCover} job={job} setIsGenerating={setIsGenerating} />}
            <div className="description_container">
                <div className="description_job_info">
                    <img src={pic} className="description_icon" onError={({ currentTarget }) => {
                        currentTarget.onerror = null; // prevents looping
                        currentTarget.src = require('../assets/crewmate-emblem.png');
                    }}></img>
                    <div className="description_job_title">
                        <h4 className="description_job_title_heading">{`${job.title} @ ${job.company_name}`}</h4>
                    </div>
                </div>
                <div className="description_description_cont">
                    <h5 className="description_text">{job.description}</h5>
                </div>
                <div className="description_button_container">
                    <button className="description_apply_button_container" onClick={() => {
                        if (job.external_url != null) {
                            window.open(
                                job.external_url,
                                '_blank'
                            );
                        }
                        else {
                            window.open(
                                job.redirected_url,
                                '_blank'
                            );

                        }
                    }}>
                        <h6 className="description_apply_button_text">Apply Now</h6>
                    </button>
                </div>
            </div>
            <div className="generate_cv_container">
                <h5 className="generate_cv_text">Craft an AI-imbued cover letter aligning experience with the job description. <br /> Generate AI-infused resume bullet points to match job requisites.</h5>
                <Dropdown>
                    <Dropdown.Button color='secondary' shadow className="generate_button">Generate</Dropdown.Button>
                    <Dropdown.Menu color="secondary" variant="shadow" aria-label="Actions" onSelect={() => { console.log("FUCKOFF") }}>
                        <Dropdown.Item key="cover" textValue="Generate Cover Letter"><h6 onClick={generateCoverLetter}>Generate Cover Letter</h6></Dropdown.Item>
                        <Dropdown.Item key="cv" textValue="Generate CV Text"><h6 onClick={generateResumeText}>Generate CV Text</h6></Dropdown.Item>
                    </Dropdown.Menu>
                </Dropdown>
            </div>
        </div>
        // <div style={{ height: '88vh', }}>
        // {isGenerating && <Modal setOpenModal={setIsGenerating} isSearchingModal={true} text="Copying Text to Clipboard..." />}
        //     <div className="card" style={{ width: "auto", }} >
        //         <div style={{ height: '88vh', flexDirection: 'column' }}>
        //             <button onClick={() => { navigation(jobRecs ? '/' : '/pathways', { state: { jobRecs: jobRecs } }) }}>Go Back</button>
        // <div style={{ flexDirection: 'row', display: 'inline-flex', minHeight: 'auto', maxHeight: 'auto', minWidth: 'auto', maxWidth: 'auto' }}>
        //     <img className="profile_icon" src={pic} style={{ height: '75px', width: '75px' }} onError={({ currentTarget }) => {
        //         currentTarget.onerror = null; // prevents looping
        //         currentTarget.src = require('../assets/crewmate-emblem.png');
        //     }}></img>
        //     <h3 className="company_name">{job.company_name}</h3>
        //     <FaBookmark color={jobSaved ? "#9921e8" : '#FAFAFA'} size={25} className="job_bookmark_icon" />
        // </div>
        //             <div style={{ flexDirection: 'row', display: 'inline-flex', minHeight: 'auto', maxHeight: 'auto', minWidth: 'auto' }}>
        //                 <h4 className="job_title" style={{ height: 'auto', minHeight: 'auto' }}>{job.title}</h4>
        //             </div>
        //             <div style={{ flexDirection: 'row', display: 'inline-flex', minHeight: 'auto', maxHeight: 'auto' }}>
        //                 <h6 className="job_description">{description}</h6>
        //             </div>
        //             <button onClick={generateCoverLetter}>{isCopiedCover ? 'Copied!' : 'Generate Cover Letter'}</button>
        //             <button onClick={generateResumeText}>{isCopiedResume ? 'Copied!' : 'Generate Resume Text'}</button>
        //         </div>
        //     </div>
        // </div>
    )
}

export default ExploreJob


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