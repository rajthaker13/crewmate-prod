import React, { useEffect, useState } from "react";
import { useStateValue } from "../utility/StateProvider";
import { Card, Grid, Text, Link, Button } from '@nextui-org/react';
import db, { auth, provider, functions } from '../../firebase/firebase';
import { collection, addDoc, setDoc, doc, getDoc, updateDoc, getDocs } from "firebase/firestore";
import fetch from 'node-fetch'
import '../../styles/JobCard.css'
import { FaPeriscope, FaTelegramPlane, FaBlackTie, FaWarehouse, FaBookmark, FaPeopleArrows } from 'react-icons/fa';

export function JobCard({ job, xs = 4, profile = false, index = 0, isSearching }) {
    const [pfp, setPfp] = useState('')
    const [jobFunction, setJobFunction] = useState('')
    const [jobIndustry, setIndustry] = useState('')
    const [jobSaved, setJobSaved] = useState(false)
    const [companyWaitlisted, setCompanyWaitlisted] = useState(false)

    const extractWords = (text, wordCount) => {
        const words = text.split(' ');
        const extractedWords = words.slice(0, wordCount);
        return extractedWords.join(' ');
    };

    const description = extractWords(job.description, 20) + "...";





    useEffect(() => {
        async function getCompanyData() {
            const document = doc(db, "companies", job.company_name)
            const companyRef = await getDoc(document)
            let icon = ''

            if (!companyRef.exists()) {
                const url = `https://api.brandfetch.io/v2/search/${job.company_name}`;
                const options = {
                    method: 'GET',
                    headers: {
                        accept: 'application/json',
                        Referer: `${window.location.origin}`
                    }
                };

                fetch(url, options)
                    .then(res => res.json())
                    .then(async (json) => {
                        await setDoc(doc(db, "companies", job.company_name), {
                            data: json
                        })
                        console.log("Fuck")
                        icon = json[0].icon
                        if (icon == null) {
                            icon = json[1].icon
                        }
                        console.log(icon)
                    })
                    .catch(err => console.error('error:' + err));
            }
            else {
                const data = companyRef.data()['data']
                if (Array.isArray(data)) {
                    console.log(data)
                    icon = data[0].icon
                    if (icon == null) {
                        icon = data[1].icon
                    }
                }
                else {
                    icon = data.icon
                }
            }
            setPfp(icon)
        }

        function getJobData() {
            console.log(job)
            // const job_function = job.job_functions_collection[0].job_function_list.function
            // const industry = job.job_industries_collection[0].job_industry_list.industry
            // setJobFunction(job_function)
            // setIndustry(industry)
        }

        async function isJobSaved() {
            let userDoc
            if (!auth.currentUser) {
                userDoc = doc(db, "users", "rajthaker13@yahoo.com")
            }
            else {
                userDoc = doc(db, "users", auth.currentUser.email)
            }
            const userRef = await getDoc(userDoc)

            if (userRef.exists()) {
                let saved = userRef.data()['savedJobs']
                if (saved == null) {
                    saved = []
                }
                saved.map((saved_job) => {
                    if (saved_job.id == job.id) {
                        setJobSaved(true)
                    }
                })
            }
        }

        async function isWaitlisted() {
            const companyDoc = doc(db, "companies", job.company_name)
            const companyRef = await getDoc(companyDoc)

            let email
            if (!auth.currentUser) {
                email = "rajthaker13@yahoo.com"
            }
            else {
                email = auth.currentUser.email
            }


            if (companyRef.exists()) {
                let waitlist = companyRef.data()['waitlist']
                if (waitlist == null) {
                    waitlist = []
                }
                waitlist.map((user_email) => {
                    if (user_email == email) {
                        setCompanyWaitlisted(true)
                    }
                })
            }

        }
        if (!isSearching && job != null) {
            getCompanyData()
            getJobData()
            isJobSaved()
            isWaitlisted()
        }



    }, [isSearching, job.company_name])

    async function joinWaitlist() {
        if (!companyWaitlisted) {
            let userRef
            let email
            if (!auth.currentUser) {
                userRef = doc(db, "users", 'rajthaker13@yahoo.com')
                email = "rajthaker13@yahoo.com"
            }
            else {
                userRef = doc(db, "users", auth.currentUser.email)
                email = auth.currentUser.email
            }

            const companyRef = doc(db, "companies", job.company_name)

            const userSnap = await getDoc(userRef)
            if (userSnap.exists()) {
                let userWaitlist = userSnap.data()['waitlistedCompanies']

                if (userWaitlist == null) {
                    userWaitlist = []
                }

                userWaitlist.push(job.company_name)
                updateDoc(userRef, {
                    waitlistedCompanies: userWaitlist
                })
            }

            const companySnap = await getDoc(companyRef)
            if (companySnap.exists()) {
                let companyWaitlist = companySnap.data()['waitlist']

                if (companyWaitlist == null) {
                    companyWaitlist = []
                }

                companyWaitlist.push(email)
                updateDoc(companyRef, {
                    waitlist: companyWaitlist
                })

            }
            setCompanyWaitlisted(true)


        }


    }

    async function saveJob() {
        if (!jobSaved) {
            let userRef
            if (!auth.currentUser) {
                userRef = doc(db, "users", 'rajthaker13@yahoo.com')
            }
            else {
                userRef = doc(db, "users", auth.currentUser.email)
            }
            const userSnap = await getDoc(userRef)
            if (userSnap.exists()) {
                let userSavedJobs = userSnap.data()['savedJobs']
                if (userSavedJobs == null) {
                    userSavedJobs = [job]
                }
                else {
                    userSavedJobs.push(job)
                }
                updateDoc(userRef, {
                    savedJobs: userSavedJobs
                })
            }
            setJobSaved(true)

        }
    }
    return (
        <div className="card">
            <div style={{ flexDirection: 'row', display: 'inline-flex', minHeight: '10vh', maxHeight: '10vh' }}>
                <img className="profile_icon" src={pfp} style={{ height: '75px', width: '75px' }}></img>
                <h3 className="company_name">{job.company_name}</h3>
                <FaBookmark color={jobSaved ? "#9921e8" : '#FAFAFA'} size={25} className="job_bookmark_icon" onClick={saveJob} />
                <FaTelegramPlane color='#FAFAFA' size={25} className="job_share_icon" onClick={saveJob} />
            </div>
            <div style={{ flexDirection: 'row', display: 'inline-flex', minHeight: '7vh', maxHeight: '7vh' }}>
                <h4 className="job_title">{job.title}</h4>
            </div>
            <div style={{ flexDirection: 'row', display: 'inline-flex', minHeight: '9vh', maxHeight: '9vh' }}>
                <h6 className="job_description">{description}</h6>
            </div>
            <div style={{ flexDirection: 'row', display: 'inline-flex', minHeight: '3vh', maxHeight: '3vh' }}>
                <FaPeriscope color='#FAFAFA' size={25} className="job_location_icon" />
                <h5 className="job_location">{job.location}</h5>
            </div>
            <div className="line_break" />
            {/* <div style={{ flexDirection: 'row', display: 'inline-flex', minHeight: '3vh', maxHeight: '3vh' }}>
                <FaBlackTie color='#FAFAFA' size={25} className="job_info_icon" />
                <h6 className="job_info">{`Job Function: ${jobFunction}`}</h6>
            </div> */}
            {/* <div style={{ flexDirection: 'row', display: 'inline-flex', minHeight: '4vh', maxHeight: '4vh' }}>
                <FaWarehouse color='#FAFAFA' size={25} className="job_info_icon" />
                <h6 className="job_info">{`Job Industry: ${jobIndustry}`}</h6>
            </div> */}
            <div className="line_break" />
            <div style={{ flexDirection: 'row', display: 'inline-flex', minHeight: '3vh', maxHeight: '3vh' }}>
                <h6 className="job_info">{`${job.employment_type} Position`}</h6>
            </div>
            <div style={{ flexDirection: 'row', display: 'inline-flex', }}>
                <button className="job_apply_button" onClick={() => {
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
                    <div style={{ flexDirection: 'row', display: 'inline-flex', minHeight: '50vh', minWidth: '10vw', justifyContent: 'center' }}>
                        <img src={require("../../assets/crewmate-emblem.png")} className="apply_icon" ></img>
                        <h4 className="apply_text">Apply</h4>
                    </div>
                </button>
                <button className="job_waitlist_button" onClick={joinWaitlist}>
                    <div style={{
                        flexDirection: 'row', display: 'inline-flex', minHeight: '50vh', minWidth: '10vw', justifyContent: 'center'
                    }}>
                        {!companyWaitlisted && <> <FaPeopleArrows color='#FAFAFA' size={25} className="waitlist_icon" />
                            <h4 className="apply_text">Join Waitlist</h4></>}
                        {companyWaitlisted && <>
                            <h4 className="apply_text">Joined</h4></>}

                    </div>
                </button>
            </div >



        </div >
    )
}

export default JobCard