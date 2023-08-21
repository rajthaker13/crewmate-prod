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
    const [isGenerating, setIsGenerating] = useState(false)
    const [newsContent, setNewsContent] = useState([])

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
            //Youtube Shit
            // const link = `https://vast-waters-56699-3595bd537b3a.herokuapp.com/https://us-central1-crewmate-prod.cloudfunctions.net/getYoutubeVideos`
            // await axios.post(link, { company_name: job.company_name, title: job.title }, { headers: { 'Content-Type': 'application/json' } }).then(async (res) => {
            //     console.log(res.data)
            //     setVideos(res.data)
            // })

            //Udemy
            // const url = "https://vast-waters-56699-3595bd537b3a.herokuapp.com/https://www.udemy.com/api-2.0/courses/?search=java";
            // const clientID = 'tRVpeJE6riqDONUVPNd7M6xNmiOTM1KF1SKNCKsg';
            // const clientSecret = '2W1pcG3C8M1VpxXZ2cIvzIBS8zCWQnyDl4hU8TgszzkoPPnFiqlxWHKtMlLZHOsgHAAM2kYXNcrFX0NY9HWqSqEtYqJW28S0vNwnfylQ48wOlOAQNhn9Be2QxzIsxONz';

            // const headers = new Headers({
            //     'Content-Type': 'application/json',
            //     'Authorization': 'Basic ' + btoa(`${clientID}:${clientSecret}`),
            // });

            // await fetch(url, {
            //     method: 'GET',
            //     headers: headers,
            // })
            //     .then(response => response.json())
            //     .then(json => {
            //         json.results.forEach(result => {
            //             const title = result.title;
            //             console.log(title);
            //         });
            //     })
            //     .catch(error => {
            //         console.error('Error:', error);
            //     });



            // const link = `https://vast-waters-56699-3595bd537b3a.herokuapp.com/https://www.udemy.com/api-2.0/courses/`
            // await axios.get(link, { 'Authorization': `Basic ${encodedCredentials}` }).then(async (res) => {
            //     console.log(res.data)
            // })

            const job_func = job.job_functions_collection[0].job_function_list.function

            const keywords = `${encodeURIComponent(job_func)}`;
            const baseURL = `https://vast-waters-56699-3595bd537b3a.herokuapp.com/https://newsdata.io/api/1/news?apikey=pub_27949b722706632bfadee3b38de0956a3f91a&q=${keywords}`;

            await axios.get(baseURL)
                .then(response => {
                    setNewsContent(response.data['results'])
                    console.log(newsContent)
                })
                .catch(error => {
                    console.error('Error fetching data:', error);
                })

        }

        getData()

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
            {isGenerating && <GenerateModal isGeneratingResume={isGeneratingResume} isGeneratingCover={isGeneratingCover} job={job} setIsGenerating={setIsGenerating} setIsGeneratingCover={setIsGeneratingCover} setIsGeneratingResume={setIsGeneratingResume} />}
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
                    <Dropdown.Menu color="secondary" variant="shadow" aria-label="Actions">
                        <Dropdown.Item key="cover" textValue="Generate Cover Letter"><h6 onClick={generateCoverLetter}>Generate Cover Letter</h6></Dropdown.Item>
                        <Dropdown.Item key="cv" textValue="Generate CV Text"><h6 onClick={generateResumeText}>Generate CV Text</h6></Dropdown.Item>
                    </Dropdown.Menu>
                </Dropdown>
            </div>
            <div style={{ flexDirection: 'row', display: 'flex' }}>
                <div className="generate_courses_container">
                    <h5 className="content_header_text">Get relevant experience</h5>
                </div>
                <div className="generate_content_container">
                    <div className="content_header_info">
                        <h5 className="content_header_text">Culture of this industry</h5>
                    </div>
                    <div style={{ overflowY: 'auto' }}>
                        {newsContent.map((news) => {
                            return (
                                <div className="content_container" onClick={() => {
                                    window.open(
                                        news.link,
                                        '_blank'
                                    );
                                }}>
                                    <img src={news.image_url} className="content_img" onError={({ currentTarget }) => {
                                        currentTarget.onerror = null; // prevents looping
                                        currentTarget.src = require('../assets/news-default.png');
                                    }} />
                                    <div className="content_title_container">
                                        <h5 className="content_title_text_description">{news.title}</h5>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </div>
            </div>

        </div>
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