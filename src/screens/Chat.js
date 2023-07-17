import SendbirdApp from '@sendbird/uikit-react/App';
import '@sendbird/uikit-react/dist/index.css';
import { useStateValue } from "../components/utility/StateProvider";
import db, { auth, provider, functions, storage } from '../firebase/firebase'
import React, { useEffect, useState, useRef } from "react";
import { collection, addDoc, setDoc, doc, getDoc, updateDoc, getDocs } from "firebase/firestore";
import Requests from '../components/common/Requests';
import Talk from 'talkjs';

const Chat = () => {
    const [name, setName] = useState('')
    const [pfp, setPfp] = useState('')
    const chatboxEl = useRef();
    const [talkLoaded, markTalkLoaded] = useState(false);
    const [incoming, setIncoming] = useState(false)
    const [outgoing, setOutgoing] = useState(false)

    async function addConversation(email, data) {
        let userRef
        let myEmail
        if (!auth.currentUser) {
            myEmail = 'rajthaker13@gmail.com'
            userRef = doc(db, "requests", 'rajthaker13@yahoo.com')
        }
        else {
            myEmail = auth.currentUser.email
            userRef = doc(db, "requests", auth.currentUser.email)
        }
        const userSnap = await getDoc(userRef)
        if (userSnap.exists()) {
            let incoming = userSnap.data()['incoming']
            incoming.filter(item => item !== email);
            let userFriends = userSnap.data()['friends']

            if (!userFriends) {
                await updateDoc(userRef, {
                    incoming: incoming,
                    friends: [email]
                })
            }
            else {
                userFriends.push(email)
                await updateDoc(userRef, {
                    incoming: incoming,
                    friends: userFriends
                })
            }
        }

        const otherUserRef = doc(db, "requests", email)
        const otherUserSnap = await getDoc(otherUserRef)
        if (otherUserSnap.exists()) {
            let outgoing = otherUserSnap.data()['outgoing']
            outgoing.filter(item => item !== myEmail);
            let otherFriends = otherUserSnap.data()['friends']

            if (!otherFriends) {
                await updateDoc(otherUserRef, {
                    outgoing: outgoing,
                    friends: [myEmail]
                })
            }
            else {
                otherFriends.push(myEmail)
                await updateDoc(otherUserRef, {
                    outgoing: outgoing,
                    friends: otherFriends
                })
            }
            const currentUser = new Talk.User({
                id: myEmail,
                name: name,
                email: myEmail,
                photoUrl: pfp,
                role: 'default',
            });
            const otherUser = new Talk.User({
                id: email,
                name: data.name,
                email: email,
                photoUrl: data.logo_url,
                welcomeMessage: `Thanks for connecting with me ${name}. Here is my email: ${email}`,
                role: 'default',
            });
            const session = new Talk.Session({
                appId: 'CbQ1iWZf',
                me: currentUser,
            });
            const conversationId = Talk.oneOnOneId(currentUser, otherUser);
            const conversation = session.getOrCreateConversation(conversationId);
            conversation.setParticipant(currentUser)
            conversation.setParticipant(otherUser)
            const chatbox = session.createInbox();
            chatbox.select(conversation)
            chatbox.mount(chatboxEl.current);
            return () => session.destroy();



        }


    }

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
                Talk.ready.then(() => markTalkLoaded(true))
                if (talkLoaded) {
                    let email
                    if (!auth.currentUser) {
                        email = 'rajthaker13@yahoo.com'
                    }
                    else {
                        email = auth.currentUser.email
                    }
                    const currentUser = new Talk.User({
                        id: email,
                        name: name,
                        email: email,
                        photoUrl: pfp,
                        role: 'default',
                    });
                    const session = new Talk.Session({
                        appId: 'CbQ1iWZf',
                        me: currentUser,
                    });
                    const chatbox = session.createInbox();
                    chatbox.mount(chatboxEl.current);
                    return () => session.destroy();

                }
            }
        }

        async function getRequests() {
            let sucIncoming = []
            let sucOutgoing = []
            try {
                let email
                if (!auth.currentUser) {
                    email = 'rajthaker13@yahoo.com'
                }
                else {
                    email = auth.currentUser.email
                }

                const requestRef = doc(db, "requests", email)
                const requestSnap = await getDoc(requestRef)

                let curOutgoing

                if (requestSnap.exists()) {
                    const curIncoming = requestSnap.data()['incoming']
                    curOutgoing = requestSnap.data()['outgoing']
                    console.log(curOutgoing)


                    curIncoming.map(async (user) => {
                        const userRef = doc(db, "users", user)
                        const userSnap = await getDoc(userRef)

                        sucIncoming.push(userSnap.data())
                    })
                }


                curOutgoing.map(async (user) => {
                    const userRef = doc(db, "users", user)
                    const userSnap = await getDoc(userRef)
                    sucOutgoing.push(userSnap.data())
                })
            }
            finally {
                setIncoming(sucIncoming)
                setOutgoing(sucOutgoing)

            }


        }

        getData()
        getRequests()

    }, [talkLoaded])

    return (
        <div style={{ flexDirection: 'row', display: 'inline-flex', justifyContent: 'start' }}>
            <div ref={chatboxEl} style={{ height: '88vh', width: '40vw', marginRight: '1vw' }} />;
            <div style={{ height: '88vh', width: '35vw', backgroundColor: '#121212' }}>
                <Requests addConversation={addConversation} />
            </div >
        </div>
    );
};

export default Chat