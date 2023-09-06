import React, { useEffect, useState } from "react";
import db, { auth, provider, functions, storage } from '../../../firebase/firebase';
import { collection, addDoc, setDoc, doc, getDoc, updateDoc, getDocs } from "firebase/firestore";
import "./LoginModal.css"
import axios from 'axios'


function LoginModal({ setOpenModal, isSearchingModal = false, text = "Generating Jobs...", isMobile }) {
    const [url, setUrl] = useState('')

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

    return (
        <>

            <div className={isMobile ? "modal-mobile" : "modal"}>
                <h1 className="generate_modal_header">
                    Enter your LinkedIn URL

                </h1>
                <div className={isMobile ? "generate_text_container-mobile" : "generate_text_container"}>
                    <textarea className="generate_text_input-mobile" value={url} onChange={(e) => { setUrl(e.target.value) }} placeholder="https://www.linkedin.com/in/firstNameLastName/" />
                </div>
                <div className="generate_button_row_container">
                    <button className="generate_copy_text_button" >
                        <h5 className="generate_button_actions_text">Register</h5>
                    </button>
                </div>
            </div >
        </>

    )
}

export default LoginModal