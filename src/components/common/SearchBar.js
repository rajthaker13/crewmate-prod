import React, { useState } from 'react';
import { FaSearch } from 'react-icons/fa';
import '../../styles/SearchBar.css';
import ClickAwayListener from '@mui/base/ClickAwayListener';
import { useStateValue } from "../utility/StateProvider";
import { getCrewmateReccomendation, getJobRecommendation } from "../../open_ai/OpenAI"
import axios from 'axios';

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
        const experienceText = "What User Desires: " + userText + " Prior Work Experience of user: " + props.experience
        await axios.post(link, { text: userText }, { headers: { 'Content-Type': 'application/json' } }).then(async (res) => {
            props.setJobRecs(res.data)
        })
        await axios.post(link, { text: experienceText }, { headers: { 'Content-Type': 'application/json' } }).then(async (res) => {
            setUserText('')
            props.setExperienceRecs(res.data)
        })
        await getCrewmateReccomendation(userText).then((res) => {
            props.setProfileRec(res)
        })
        props.setIsSearching(false)
    }

    return (
        <ClickAwayListener onClickAway={handleClickAway}>
            <div
                className={`search-bar ${expanded ? 'expanded' : ''}`}
                style={{ backgroundColor: '#121212', outlineWidth: '10px', outlineColor: '#9E9E9E' }}
            >
                <textarea placeholder={expanded ? '' : "    Ex: I'm interested in internships, have a computer science and finance double major and love energy/fintech/travel"} rows={expanded ? 3 : 1} onClick={handleClick} style={{ backgroundColor: '#121212', borderWidth: 0, width: '100vw', color: 'white', fontFamily: 'Verdana, Arial, Helvetica, sans-serif' }} value={userText} onChange={(e) => { setUserText(e.target.value) }} />
                <button onClick={async () => { await chatGPTDude() }}>
                    <FaSearch color='#8C52FF' size={25} />
                </button>
            </div>
        </ClickAwayListener>
    );
};

export default SearchBar;
