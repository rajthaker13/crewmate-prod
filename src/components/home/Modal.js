import React, { useEffect, useState } from "react";
import db, { auth, provider, functions, storage } from '../../firebase/firebase';
import { collection, addDoc, setDoc, doc, getDoc, updateDoc, getDocs } from "firebase/firestore";
import "../../styles/Modal.css"
import axios from 'axios'


function Modal({ setOpenModal, isSearchingModal = false, text = "Generating Jobs..." }) {
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
            {isSearchingModal ?
                <div className="modal">
                    <div className="modal-content">
                        <h2>{text}</h2>
                    </div>
                </div>

                :
                <div className="modal">
                    <div className="modal-content">
                        <h2>Enter your LinkedIn URL</h2>
                        <div

                            style={{ backgroundColor: 'black', outlineWidth: '10px', outlineColor: '#9E9E9E' }}
                        >
                            <input type="text" placeholder="https://www.linkedin.com/in/firstNameLastName/" style={{ backgroundColor: 'black', borderWidth: 0, width: '80%', color: 'white', fontFamily: 'Verdana, Arial, Helvetica, sans-serif' }} onChange={(e) => { setUrl(e.target.value) }} />
                        </div>
                        <button onClick={handleInput}>Register</button>
                    </div>
                </div>}
        </>

    )
}

export default Modal