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
            email = 'guest'
        }
        else {
            email = auth.currentUser.email
        }

        const userRef = doc(db, "users", email)
        const userSnap = await getDoc(userRef)

        if (userSnap.exists()) {
            let prompts = userSnap.data()['userPrompts'];
            if (prompts) {
                prompts.push(userText)
                await updateDoc(userRef, {
                    userPrompts: prompts
                })
            }
            else {
                await updateDoc(userRef, {
                    userPrompts: [userText]
                })
            }

        }

        await axios.post(link, { text: input }, { headers: { 'Content-Type': 'application/json' } }).then(async (res) => {
            props.setJobRecs(res.data)
            console.log(res.data)
        })
        props.setIsSearching(false)
        if (!state.guestView) {
            await axios.post(link, { text: experienceText }, { headers: { 'Content-Type': 'application/json' } }).then(async (res) => {
                props.setExperienceRecs(res.data)
            })
            await getCrewmateReccomendation(userText).then((res) => {
                props.setProfileRec(res)
            })
        }
    }

    return (
        <ClickAwayListener onClickAway={handleClickAway}>
            <div
                className={`search-bar ${expanded ? 'expanded' : ''}`}
                style={{ backgroundColor: 'rgba(0, 0, 0, 0.10)', borderWidth: '20px', outlineColor: '#9E9E9E' }}
            >
                <button onClick={async () => { await chatGPTDude() }}>
                    <FaSearch color='#9E89E1' size={25} />
                </button>
                <textarea placeholder={expanded ? '' : "Type a few sentences about yourself, your goals, your interests, and what type of opportunities you are looking for here..."} rows={expanded ? 3 : 1} onClick={handleClick} className='search-bar-input-new' value={userText} onChange={(e) => { setUserText(e.target.value) }}
                    onKeyDown={async (e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                            await chatGPTDude()
                        }
                    }} />
            </div>
        </ClickAwayListener>
    );
};

export default SearchBar;
