import React, { useEffect, useState } from "react";
import db, { auth, provider, functions, storage } from '../../../firebase/firebase';
import { collection, addDoc, setDoc, doc, getDoc, updateDoc, getDocs } from "firebase/firestore";
import "./LoginModal.css"
import axios from 'axios'


function LoginModal({ setOpenModal, isSearchingModal = false, text = "Generating Jobs...", isMobile }) {
    const [firstName, setFirstName] = useState('')
    const [lastName, setLastName] = useState('')
    const [role, setRole] = useState('')
    const [email, setEmail] = useState('')
    const [url, setUrl] = useState('')
    const [companyName, setCompanyName] = useState('')
    const [companyURL, setCompanyURL] = useState('')
    const [companySize, setCompanySize] = useState('')
    const [avgApplications, setavgApplications] = useState('')
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')

    async function handleInput() {
        console.log(url)
        const regex = /in\/([^\/]+)/;

        const match = url.match(regex);

        const extractedText = match[1];

        const member_url = `https://vast-waters-56699-3595bd537b3a.herokuapp.com/https://api.coresignal.com/cdapi/v1/linkedin/member/collect/${extractedText}`;
        axios.get(member_url, {
            headers: {
                'accept': 'application/json',
                'Authorization': `Bearer ${process.env.REACT_APP_CORESIGNAL_API_KEY}`,
            },
        })
            .then(async (response) => {
                let email = ''
                if (!auth.currentUser) {
                    email = 'rajthaker13@yahoo.com'
                }
                else {
                    email = auth.currentUser.email
                }
                await updateDoc(doc(db, "users", email), {
                    data: response.data,
                    email: email

                })

                setOpenModal(false)

            })
            .catch(error => {
                // Handle errors here when tokens run low for collect
                console.error('Error:', error.message);
            });

    }

    async function login() {
        const regex = /in\/([^\/]+)/;

        const match = url.match(regex);

        const extractedText = match[1];

        const member_url = `https://vast-waters-56699-3595bd537b3a.herokuapp.com/https://api.coresignal.com/cdapi/v1/linkedin/member/collect/${extractedText}`;
        axios.get(member_url, {
            headers: {
                'accept': 'application/json',
                'Authorization': `Bearer ${process.env.REACT_APP_CORESIGNAL_API_KEY}`,
            },
        })
            .then(async (response) => {
                await setDoc(doc(db, "users", email), {
                    firstName: firstName,
                    lastName: lastName,
                    role: role,
                    email: email,
                    companyName: companyName,
                    companyURL: companyURL,
                    companySize: companySize,
                    avgApplications: avgApplications,
                    data: response.data,
                })

                setOpenModal(false)

            })
            .catch(error => {
                // Handle errors here when tokens run low for collect
                console.error('Error:', error.message);
            });

    }

    return (
        <>

            <div className={isMobile ? "modal-mobile" : "login-modal"}>
                <h1 className="generate_modal_header-login">
                    Join Crewmate

                </h1>

                <div className={isMobile ? "generate_text_container-mobile" : "login-input-container"}>
                    <h3 className="generate_input_header">
                        First Name
                    </h3>
                    <textarea className="login-text-input" value={firstName} onChange={(e) => { setFirstName(e.target.value) }} placeholder="Darth" />
                </div>
                <div className={isMobile ? "generate_text_container-mobile" : "login-input-container"}>
                    <h3 className="generate_input_header">
                        Last Name
                    </h3>
                    <textarea className="login-text-input" value={lastName} onChange={(e) => { setLastName(e.target.value) }} placeholder="Vader" />
                </div>
                <div className={isMobile ? "generate_text_container-mobile" : "login-input-container"}>
                    <h3 className="generate_input_header">
                        Role
                    </h3>
                    <textarea className="login-text-input" value={role} onChange={(e) => { setRole(e.target.value) }} placeholder="The Sith Lord" />
                </div>
                <div className={isMobile ? "generate_text_container-mobile" : "login-input-container"}>
                    <h3 className="generate_input_header">
                        Email
                    </h3>
                    <textarea className="login-text-input" value={email} onChange={(e) => { setEmail(e.target.value) }} placeholder="darthvader@death.star" />
                </div>
                <div className={isMobile ? "generate_text_container-mobile" : "login-input-container"}>
                    <h3 className="generate_input_header">
                        LinkedIn URL
                    </h3>
                    <textarea className="login-text-input" value={url} onChange={(e) => { setUrl(e.target.value) }} placeholder="https://www.linkedin.com/in/darthVader/" />
                </div>
                <div className={isMobile ? "generate_text_container-mobile" : "login-input-container"}>
                    <h3 className="generate_input_header">
                        Company Name
                    </h3>
                    <textarea className="login-text-input" value={companyName} onChange={(e) => { setCompanyName(e.target.value) }} placeholder="Death Star Enterprises" />
                </div>
                <div className={isMobile ? "generate_text_container-mobile" : "login-input-container"}>
                    <h3 className="generate_input_header">
                        Company Size
                    </h3>
                    <textarea className="login-text-input" value={companySize} onChange={(e) => { setCompanySize(e.target.value) }} placeholder="10,000+" />
                </div>
                <div className={isMobile ? "generate_text_container-mobile" : "login-input-container"}>
                    <h3 className="generate_input_header">
                        Avg. Applications Received Annually
                    </h3>
                    <textarea className="login-text-input" value={avgApplications} onChange={(e) => { setavgApplications(e.target.value) }} placeholder="10,000+" />
                </div>
                <div className={isMobile ? "generate_text_container-mobile" : "login-input-container"}>
                    <h3 className="generate_input_header">
                        Create Password
                    </h3>
                    <textarea className="login-text-input" value={password} onChange={(e) => { setPassword(e.target.value) }} placeholder="password" />
                </div>
                <div className={isMobile ? "generate_text_container-mobile" : "login-input-container"}>
                    <h3 className="generate_input_header">
                        Confirm Password
                    </h3>
                    <textarea className="login-text-input" value={confirmPassword} onChange={(e) => { setConfirmPassword(e.target.value) }} placeholder="password" />
                </div>
                <div className="generate_button_row_container">
                    <button className="generate_copy_text_button" onClick={login} >
                        <h5 className="generate_button_actions_text">Register</h5>
                    </button>
                </div>
            </div >
        </>

    )
}

export default LoginModal