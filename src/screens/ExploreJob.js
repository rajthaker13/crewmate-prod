import React, { useEffect, useState } from "react";
import { useStateValue } from "../components/utility/StateProvider";
import backdrop from "../assets/backdrop.gif";
import sample from '../data/sample.json';
import { getUserAndProductEmbeddings, getJobRecommendation, interactWithAssistant } from "../open_ai/OpenAI"
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
import { ChatFeed, Message } from 'react-chat-ui'


function ExploreJob() {
    const { state } = useLocation();
    const [job, setJob] = useState(state.job)
    const [pic, setPic] = useState(state.pfp)
    const [jobRecs, setJobRecs] = useState(state.jobRecs)
    const [jobSaved, setJobSaved] = useState(false)
    const [isGenerating, setIsGenerating] = useState(false)
    const [newsContent, setNewsContent] = useState([])
    const [messsages, setMessages] = useState([new Message({
        id: 1,
        message: `I'm a virtual recruiter for ${job.company_name}. Feel free to ask me anything about this job!`,
    })])
    const [gptMessages, setGPTMessages] = useState([
        { "role": "system", "content": `You are a helpful virtual recruiting assistant for the following role: ${job.title} at ${job.company_name}. The user will ask you questions pertaining to the job and you will respond as if you are a recruiter at Google. Your name is Crewmate Recruiter.` },
        { "role": "assistant", "content": `I'm a virtual recruiter for ${job.company_name}. Feel free to ask me anything about this job!` },
    ])
    const [isSearching, setIsSearching] = useState(false)

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

    async function sendMessage(userText) {
        let temp_msg = messsages
        temp_msg.push(new Message({
            id: 0,
            message: userText
        }))
        setMessages(temp_msg)
        setIsSearching(true)

        let temp_gpt = gptMessages
        temp_gpt.push({
            "role": "user", "content": userText
        })
        await interactWithAssistant(temp_gpt).then((res) => {
            temp_gpt.push({
                "role": "assistant", "content": res.content
            })
            temp_msg.push(
                new Message({
                    id: 1,
                    message: res.content
                })
            )
            setMessages(temp_msg)
            setGPTMessages(temp_gpt)
            setIsSearching(false)
        })

    }

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
                    <h5 className="content_header_text">Crewmate Virtual Assistant</h5>
                    <ChatFeed
                        messages={messsages} // Array: list of message objects
                        isTyping={isSearching} // Boolean: is the recipient typing
                        hasInputField={false} // Boolean: use our input, or use your own
                        showSenderName // show the name of the user who sent the message
                        bubblesCentered={false} //Boolean should the bubbles be centered in the feed?
                        bubbleStyles={
                            {
                                text: {
                                    fontSize: 18,
                                    textAlign: 'left'
                                },
                            }
                        }
                    // JSON: Custom bubble styles
                    />
                    <SearchBar isInputField={true} sendMessage={sendMessage} />
                </div>
                {/* <div className="generate_content_container">
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
                </div> */}
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