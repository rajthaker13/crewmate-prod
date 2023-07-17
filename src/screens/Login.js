import { Button } from "@material-ui/core";
import React, { useEffect, useState } from "react";
import '../styles/Login.css'
import db, { auth, provider, functions } from '../firebase/firebase';
import { useStateValue } from "../components/utility/StateProvider";
import { actionTypes } from '../components/utility/reducer';
import { createUserWithEmailAndPassword, fetchSignInMethodsForEmail } from "firebase/auth";
import axios from 'axios';
import { useLinkedIn } from 'react-linkedin-login-oauth2';
import linkedin from 'react-linkedin-login-oauth2/assets/linkedin.png';
import { getFunctions, httpsCallable } from 'firebase/functions'
import { doc, setDoc, getDoc } from "firebase/firestore";
import { signInWithEmailAndPassword } from "firebase/auth";


function Login() {
    const [state, dispatch] = useStateValue();
    const [authCode, setAuthCode] = useState('')
    const [userToken, setUserToken] = useState('')

    const { linkedInLogin } = useLinkedIn({
        clientId: `${process.env.REACT_APP_LINKEDIN_CLIENT_ID}`,
        redirectUri: `${window.location.origin}/linkedin`,
        scope: "r_emailaddress r_liteprofile w_member_social",
        onSuccess: async (code) => {
            setAuthCode(code)
            await getUserAccessToken(code)

        },
        onError: (error) => {
            console.log(error);
        },
    });

    async function getUserAccessToken(code) {
        const link_temp = `https://vast-waters-56699-3595bd537b3a.herokuapp.com/https://www.linkedin.com/oauth/v2/accessToken?code=${code}&grant_type=authorization_code&client_id=${process.env.REACT_APP_LINKEDIN_CLIENT_ID}&client_secret=${process.env.REACT_APP_LINKEDIN_SECRET_ID}&redirect_uri=${window.location.origin}/linkedin`
        axios.post(link_temp, { Origin: `${window.location.origin}/linkedin` }, { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }).then(async (res) => {
            const token = res.data.access_token
            setUserToken(token)
            await getUserData(token)

        }).catch((err) => {
            console.log(err)
        })
    }

    async function getUserData(token) {
        const link = `https://vast-waters-56699-3595bd537b3a.herokuapp.com/https://api.linkedin.com/v2/me`
        const contact_link = `https://vast-waters-56699-3595bd537b3a.herokuapp.com/https://api.linkedin.com/v2/clientAwareMemberHandles?q=members&projection=(elements*(primary,type,handle~))`
        let email = ""

        let id
        let firstName
        let lastName
        let pfp

        await axios.get(link, { headers: { Authorization: `Bearer ${token}` } }).then((res) => {
            id = res.data.id
            firstName = res.data.localizedFirstName
            lastName = res.data.localizedLastName
            pfp = res.data.profilePicture.displayImage

        }).catch((err) => {
            console.log(err)
        })

        console.log(id)

        await axios.get(contact_link, { headers: { Authorization: `Bearer ${token}` } }).then((result) => {
            const data = result.data
            email = data.elements[0]['handle~'].emailAddress
        }).catch((error) => {
            console.log(error)
        })
        const document = doc(db, "users", email)
        const userRef = await getDoc(document)
        let user
        if (!userRef.exists()) {
            await createUserWithEmailAndPassword(auth, email, "password3894843974j").then((cred) => {
                user = cred.user
                user.photoURL = pfp
                user.displayName = firstName + " " + lastName
            })

            await setDoc(doc(db, "users", email), {
                displayName: user.displayName,
                email: user.email,
                uid: user.uid,
                photoURL: user.photoURL,


            })
            dispatch({
                type: actionTypes.SET_USER,
                user: user,
            });
        }
        else {
            const existing_user = {
                displayName: userRef.data()['displayName'],
                email: userRef.data()['email'],
                uid: userRef.data()['uid'],
                photoURL: userRef.data()['photoURL']
            }
            const email = userRef.data()['email']
            const findUser = httpsCallable(functions, 'getUser')
            findUser({ email: email }).then((result) => {
                // console.log(result)
            })
            signInWithEmailAndPassword(auth, email, "password3894843974j").then((user) => {
                dispatch({
                    type: actionTypes.SET_USER,
                    user: user,
                });
            })
        }

    }


    return (
        <div className="login">
            <div className="login_container">
                <img
                    src={require('../assets/crewmate-logo.png')}
                    alt="crewmate-emblem"
                    className="crewmate_image"
                />
                <h3 className="login_text">Sign In</h3>
                <h5 className="login_text">joincrewmate.com</h5>
                <div style={{ flexDirection: 'row', display: 'inline-flex', }}>
                    <button className="login_button" onClick={linkedInLogin}>
                        <div style={{ flexDirection: 'row', display: 'inline-flex', minHeight: '5vh', minWidth: '20vw', justifyContent: 'left' }}>
                            <img src={require("../assets/linkedin-icon.png")} className="login_icon" ></img>
                            <h5 className="login_text_button">Continue with LinkedIn</h5>
                        </div>
                    </button>
                </div>



            </div>
        </div>

    );
}



export default Login;