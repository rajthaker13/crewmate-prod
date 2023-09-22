import React, { useEffect, useState } from "react";
import '../styles/Profile.css'
import { Grid } from '@nextui-org/react';
import db, { auth } from '../firebase/firebase';
import { doc, getDoc } from "firebase/firestore";
import JobCard from "../components/common/job-card/JobCard";


function Profile() {
    const [savedJobs, setSavedJobs] = useState([])
    const [name, setName] = useState('')
    const [pfp, setPfp] = useState('')
    const [title, setTitle] = useState('')
    const [description, setDescription] = useState('')
    const [experience, setExperience] = useState([])


    useEffect(() => {
        async function getSavedJobs() {
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
                console.log(userData.name)
                let userSavedJobs = userSnap.data()['savedJobs']

                if (userSavedJobs == null) {
                    userSavedJobs = []
                }

                setSavedJobs(userSavedJobs)
                setName(userData.name)
                setPfp(userData.logo_url)
                setTitle(userData.title)
                setDescription(userData.summary)
                let work_experience = []
                let companies = []
                userData.member_experience_collection.toReversed().map((work) => {
                    if (!companies.includes(work.company_name)) {
                        companies.push(work.company_name)
                        work_experience.push(work)
                    }
                })

                setExperience(work_experience)
            }

        }

        getSavedJobs()

    }, [])
    return (
        <div className="profile_background">
            <h1 className="profile_header">Profile</h1>
            <div className="header_info">
                <div className="header_info_container">
                    <div className="header_info_container_content">
                        <img className="profile_icon" src={pfp}></img>
                        <div style={{ width: '50px' }}></div>
                        <div className="header_info_text">
                            <h1 className="header_info_container_name">{name}</h1>
                            <h1 className="header_info_container_membership">Member</h1>
                        </div>
                    </div>
                </div>
                <div className="header_info_container" style={{ background: "#2E1069" }}>
                    <div className="header_info_container_content">
                        <div className="header_info_text">
                            <h1 className="header_info_container_job">{title}</h1>
                            <h1 className="header_info_container_membership">{description}</h1>
                        </div>
                    </div>
                </div>
            </div>
            <h1 className="profile_header">My Jobs</h1>
            <Grid.Container gap={5} >

                {savedJobs.map((job) => {
                    console.log(job)
                    return (
                        <JobCard job={job} xs={3} profile={true} />
                    )
                })}

            </Grid.Container>
        </div >
    )
}

export default Profile

