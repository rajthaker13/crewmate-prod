import React, { useEffect, useState } from "react";
import { useStateValue } from "../components/utility/StateProvider";
import backdrop from "../assets/backdrop.gif";
import sample from '../data/sample.json';
import { getUserAndProductEmbeddings, getJobRecommendation } from "../open_ai/OpenAI"
import { Card, Grid, Text, Link, Button } from '@nextui-org/react';
import db, { auth, provider, functions } from '../firebase/firebase';
import JobCard from "../components/common/JobCard";
import SearchBar from "../components/common/SearchBar";
import Bucket from "../components/home/Bucket";
import profile from '../data/profile.json';


function Home() {
    const [state, dispatch] = useStateValue();
    const [jobRecs, setJobRecs] = useState([])
    const [profileRec, setProfileRec] = useState(profile)
    const [hasSearched, setHasSearched] = useState(false)

    return (
        <div style={{ height: '88vh' }}>
            <SearchBar setJobRecs={setJobRecs} setHasSearched={setHasSearched} />
            <div style={{ display: 'inline-flex', marginTop: '5vh' }}>
                <Bucket isFirstBucket={true} jobRecs={jobRecs} />
                <Bucket profileRec={profileRec} hasSearched={hasSearched} />
            </div>
        </div >

    );
}

export default Home;
