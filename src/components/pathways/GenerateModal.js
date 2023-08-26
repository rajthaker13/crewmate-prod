import React, { useEffect, useState } from "react";
import '../../styles/GenerateModal.css'
import { XIcon } from "../common/XIcon";
import { collection, addDoc, setDoc, doc, getDoc, updateDoc, getDocs } from "firebase/firestore";
import { createCoverLetter, createResumeText } from "../../open_ai/OpenAI";
import db, { auth, provider, functions } from '../../firebase/firebase';
import clipboardCopy from 'clipboard-copy';

function GenerateModal({ isGeneratingResume, isGeneratingCover, job, setIsGenerating, setIsGeneratingCover, setIsGeneratingResume }) {
    const [header, setHeader] = useState('')
    const [text, setText] = useState('Generating text, please wait...')
    const [disabled, setDisabled] = useState(true)
    const [isCopied, setIsCopied] = useState(false)
    const [needsData, setNeedsData] = useState(true)
    const [isGenResume, setIsGenResume] = useState(isGeneratingResume)
    const [isGenCover, setIsGenCover] = useState(isGeneratingCover)


    useEffect(() => {
        async function getData() {
            if (needsData) {
                setNeedsData(false)
                if (isGenResume) {
                    setHeader('Generate CV Text')
                }
                else if (isGenCover) {
                    setHeader('Generate Cover Letter')
                }
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
                    let new_text
                    if (isGenResume) {
                        new_text = await createResumeText(job, userData)
                    }
                    else if (isGenCover) {
                        new_text = await createCoverLetter(job, userData)
                    }
                    setText(new_text)
                    setDisabled(false)
                }

            }


        }

        if (needsData) {
            getData()
        }

    }, [])

    function copyText() {
        clipboardCopy(text)
        setIsCopied(true);
        setTimeout(() => {
            setIsCopied(false);
        }, 1500);

    }

    async function regenerateText() {
        setDisabled(true)
        setText('Generating text, please wait...')
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
            let new_text
            if (isGenResume) {
                new_text = await createResumeText(job, userData)
            }
            else if (isGenCover) {
                new_text = await createCoverLetter(job, userData)
            }
            setText(new_text)
            setDisabled(false)
        }

    }

    return (
        <div className="generate_modal_container">
            <div onClick={() => {
                {
                    setIsGeneratingResume(false)
                    setIsGeneratingCover(false)
                    setNeedsData(true)
                    setIsGenCover(false)
                    setIsGenResume(false)
                    setIsGenerating(false)
                }
            }} className="x_icon_generate">
                <XIcon />
            </div>
            <h1 className="generate_modal_header">{header}</h1>
            <div className="generate_text_container">
                <textarea className="generate_text_input" disabled={disabled} value={text} onChange={(e) => { setText(e.target.value) }} />
            </div>
            <div className="generate_button_row_container">
                <button className="generate_copy_text_button" onClick={copyText} disabled={disabled}>
                    <h5 className="generate_button_actions_text">{!isCopied ? "Copy Text" : "Copied!"}</h5>
                </button>
                <button className="generate_regen_button" disabled={disabled} onClick={regenerateText}>
                    <h5 className="generate_button_actions_text">Regenerate</h5>
                </button>
            </div>

        </div>
    )
}

export default GenerateModal