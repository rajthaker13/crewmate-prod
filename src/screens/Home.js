import { Button } from "@material-ui/core";
import React, { useEffect, useState } from "react";
import { auth, provider } from '../firebase/firebase';
import { useStateValue } from "../components/utility/StateProvider";
import { actionTypes } from '../components/utility/reducer';
import { signInWithPopup, OAuthProvider, signInWithRedirect, signInWithCredential, reauthenticateWithPopup, linkWithPopup, OAuthCredential } from "firebase/auth";
import axios from 'axios';
import backdrop from "../assets/backdrop.gif";
import sample from '../data/sample.json';
import { getUserAndProductEmbeddings, getJobRecommendation } from "../open_ai/OpenAI"

function Home() {
    const [state, dispatch] = useStateValue();
    const [jobRecs, setJobRecs] = useState([])
    const [embeddings, setEmbeddings] = useState([])
    const [userText, setUserText] = useState('')
    const [response, setResponse] = useState([])

    async function chatGPTDude() {
        const userInput = "I want a job in Finance prefarably on the West Coast. I have a Bachelor's in Finance from WashU, and just graduated this year. Please find me a job."
        await getJobRecommendation(userText).then((res) => {
            console.log(res)
            setUserText('')

            let recs = []

            for (let i = 0; i < 3; i++) {
                const index = res[i].index
                const jobRec = sample[index].title
                recs.push(jobRec)

            }
            setJobRecs(recs)


        })


    }


    return (
        <div style={{ backgroundImage: `url(${backdrop})`, height: '100vh', marginTop: '-2vh', position: 'relative' }}>
            <h1 style={{ color: 'white' }}>Crewmate Job Prompt</h1>
            <textarea style={{ height: '30vh', width: '50vw', backgroundColor: '#212121', color: 'white', borderRadius: '1vh' }} placeholder="Write down what sort of job you are looking for! Be as descriptive as possible." value={userText} onChange={(e) => { setUserText(e.target.value) }}></textarea>
            <div>
                <button onClick={async () => { await chatGPTDude() }}>Submit</button>
            </div>
            {jobRecs.map((job) => {
                console.log(job)
                return (
                    <h1 style={{ color: 'white' }}>{job}</h1>
                )
            })}
        </div>

    );
}

export default Home;