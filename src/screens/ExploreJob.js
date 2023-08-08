import React, { useEffect, useState } from "react";
import { useStateValue } from "../components/utility/StateProvider";
import backdrop from "../assets/backdrop.gif";
import sample from '../data/sample.json';
import { getUserAndProductEmbeddings, getJobRecommendation } from "../open_ai/OpenAI"
import { Card, Grid, Text, Link, Button } from '@nextui-org/react';
import db, { auth, provider, functions } from '../firebase/firebase';
import JobCard from "../components/common/JobCard";
import SearchBar from "../components/common/SearchBar";
import { useLocation } from "react-router-dom";
import { FaPeriscope, FaTelegramPlane, FaBlackTie, FaWarehouse, FaBookmark, FaPeopleArrows } from 'react-icons/fa';
import axios from 'axios';


function ExploreJob() {
    const { state } = useLocation();
    const [job, setJob] = useState(state)
    const [pfp, setPfp] = useState('')
    const [jobSaved, setJobSaved] = useState(false)
    const [videos, setVideos] = useState([])

    const extractWords = (text, wordCount) => {
        const words = text.split(' ');
        const extractedWords = words.slice(0, wordCount);
        return extractedWords.join(' ');
    };

    const description = extractWords(job.description, 20) + "...";

    useEffect(() => {
        async function getData() {
            const link = `https://vast-waters-56699-3595bd537b3a.herokuapp.com/https://us-central1-crewmate-prod.cloudfunctions.net/getYoutubeVideos`
            await axios.post(link, { company_name: job.company_name, title: job.title }, { headers: { 'Content-Type': 'application/json' } }).then(async (res) => {
                console.log(res.data)
                setVideos(res.data)
            })

        }
        console.log(job)
        getData()

    }, [])
    return (
        <div className="card" style={{ maxWidth: "25vw" }} >
            <div style={{ height: '88vh', flexDirection: 'column' }}>
                <div style={{ flexDirection: 'row', display: 'inline-flex', minHeight: 'auto', maxHeight: 'auto', minWidth: 'auto', maxWidth: 'auto' }}>
                    {/* <img className="profile_icon" src={pfp} style={{ height: '75px', width: '75px' }} onError={({ currentTarget }) => {
                    currentTarget.onerror = null; // prevents looping
                    currentTarget.src = require('../assets/crewmate-emblem.png');
                }}></img> */}
                    <h3 className="company_name">{job.company_name}</h3>
                    <FaBookmark color={jobSaved ? "#9921e8" : '#FAFAFA'} size={25} className="job_bookmark_icon" />
                </div>
                <div style={{ flexDirection: 'row', display: 'inline-flex', minHeight: 'auto', maxHeight: 'auto', minWidth: 'auto' }}>
                    <h4 className="job_title" style={{ height: 'auto', minHeight: 'auto' }}>{job.title}</h4>
                </div>
                <div style={{ flexDirection: 'row', display: 'inline-flex', minHeight: 'auto', maxHeight: 'auto' }}>
                    <h6 className="job_description">{description}</h6>
                </div>
                {videos.map((video) => {
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
                })}
            </div>
        </div>
    )
}

export default ExploreJob