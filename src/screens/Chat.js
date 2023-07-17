import SendbirdApp from '@sendbird/uikit-react/App';
import '@sendbird/uikit-react/dist/index.css';
import { useStateValue } from "../components/utility/StateProvider";
import db, { auth, provider, functions, storage } from '../firebase/firebase'
import React, { useEffect, useState } from "react";
import { collection, addDoc, setDoc, doc, getDoc, updateDoc, getDocs } from "firebase/firestore";
import Requests from '../components/common/Requests';

const Chat = () => {
    const [name, setName] = useState('')
    const [pfp, setPfp] = useState('')

    useEffect(() => {
        async function getData() {
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
                setName(userData.name)
                setPfp(userData.logo_url)
            }

        }

        getData()

    }, [])


    return (
        <div style={{ flexDirection: 'row', display: 'inline-flex', }}>
            <div style={{ height: '88vh', width: '80vw' }}>
                < SendbirdApp
                    // Add the two lines below.
                    appId={process.env.REACT_APP_SENDBIRD_APP_ID}   // Specify your Sendbird application ID.
                    userId={auth.currentUser == null ? 'rajthaker13@yahoo.com' : auth.currentUser.email}
                    theme="dark"
                    nickname={name}
                    profileUrl={pfp}


                />
            </div >
            <div style={{ height: '88vh', width: '20vw', backgroundColor: '#121212' }}>
                <Requests />
            </div >
        </div>
    );
};

export default Chat