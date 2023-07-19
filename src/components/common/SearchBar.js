import React, { useState } from 'react';
import { FaSearch } from 'react-icons/fa';
import '../../styles/SearchBar.css';
import ClickAwayListener from '@mui/base/ClickAwayListener';
import { useStateValue } from "../utility/StateProvider";
import { getCrewmateReccomendation, getJobRecommendation } from "../../open_ai/OpenAI"
import axios from 'axios';
import db, { auth } from '../../firebase/firebase';
import { collection, addDoc, setDoc, doc, getDoc, updateDoc, getDocs } from "firebase/firestore";

const SearchBar = (props) => {
    const [expanded, setExpanded] = useState(false);
    const [state, dispatch] = useStateValue();
    const [jobRecs, setJobRecs] = useState([])
    const [embeddings, setEmbeddings] = useState([])
    const [userText, setUserText] = useState('')
    const [response, setResponse] = useState([])

    const handleClick = () => {
        setExpanded(!expanded);
    };

    const handleClickAway = () => {
        setExpanded(false)
    }

    async function chatGPTDude() {
        props.setIsSearching(true)
        const link = `https://vast-waters-56699-3595bd537b3a.herokuapp.com/https://us-central1-crewmate-prod.cloudfunctions.net/getJobRec`
        const experienceText = "I am looking for jobs in " + props.location + " and I want the job to do this: " + userText + " and this is my Prior Work Experience of user: " + props.experience
        const input = userText + " in " + props.location

        let email
        if (!auth.currentUser) {
            email = 'rajthaker13@yahoo.com'
        }
        else {
            email = auth.currentUser.uid
        }

        // const userRef = doc(db, "users", email)
        // const userSnap = await getDoc(userRef)

        // let prompts = userSnap.data()['prompts']
        // if (!prompts) {
        //     await updateDoc(userRef, {
        //         prompts: [userText]
        //     })
        // }
        // else {
        //     prompts.push(userText)
        //     await updateDoc(userRef, {
        //         prompts: prompts
        //     })

        // }
        await axios.post(link, { text: input }, { headers: { 'Content-Type': 'application/json' } }).then(async (res) => {
            props.setJobRecs(res.data)
        })
        if (!state.guestView) {
            await axios.post(link, { text: experienceText }, { headers: { 'Content-Type': 'application/json' } }).then(async (res) => {
                props.setExperienceRecs(res.data)
            })
            await getCrewmateReccomendation(userText).then((res) => {
                props.setProfileRec(res)
            })
        }
        props.setIsSearching(false)
    }

    return (
        <ClickAwayListener onClickAway={handleClickAway}>
            <div
                className={`search-bar ${expanded ? 'expanded' : ''}`}
                style={{ backgroundColor: '#121212', outlineWidth: '10px', outlineColor: '#9E9E9E' }}
            >
                <textarea placeholder={expanded ? '' : "    Ex: I'm interested in internships, have a computer science and finance double major and love energy/fintech/travel. Then press Enter to submit."} rows={expanded ? 3 : 1} onClick={handleClick} style={{ backgroundColor: '#121212', borderWidth: 0, width: '100vw', color: 'white', fontFamily: 'Verdana, Arial, Helvetica, sans-serif' }} value={userText} onChange={(e) => { setUserText(e.target.value) }}
                    onKeyDown={async (e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                            await chatGPTDude()
                        }


                    }} />
                <button onClick={async () => { await chatGPTDude() }}>
                    <FaSearch color='#8C52FF' size={25} />
                </button>
            </div>
        </ClickAwayListener>
    );
};

export default SearchBar;
