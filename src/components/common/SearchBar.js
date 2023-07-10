import React, { useState } from 'react';
import { FaSearch } from 'react-icons/fa';
import '../../styles/SearchBar.css';
import ClickAwayListener from '@mui/base/ClickAwayListener';
import { useStateValue } from "../utility/StateProvider";
import sample from "../../data/sample.json"
import { getCrewmateReccomendation, getJobRecommendation } from "../../open_ai/OpenAI"

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
        const userInput = "I want a job in Finance prefarably on the West Coast. I have a Bachelor's in Finance from WashU, and just graduated this year. Please find me a job."
        await getJobRecommendation(userText).then((res) => {
            console.log(res)
            setUserText('')

            let recs = []

            for (let i = 0; i < 3; i++) {
                const index = res[i].index
                const jobRec = sample[index]
                recs.push(jobRec)

            }
            props.setJobRecs(recs)
            props.setHasSearched(true)
        })

        await getCrewmateReccomendation(userText).then((res) => {
            console.log(res)
        })
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
