import { Button } from "@material-ui/core";
import React, { useEffect, useState } from "react";
import '../styles/Login.css'
import db, { auth, provider } from '../firebase/firebase';
import { useStateValue } from "../components/utility/StateProvider";
import { actionTypes } from '../components/utility/reducer';
import { createUserWithEmailAndPassword, fetchSignInMethodsForEmail } from "firebase/auth";
import axios from 'axios';
import { useLinkedIn } from 'react-linkedin-login-oauth2';
import linkedin from 'react-linkedin-login-oauth2/assets/linkedin.png';
import { getFunctions, httpsCallable } from 'firebase/functions'
import { doc, setDoc, getDoc } from "firebase/firestore";


function Login() {
    const [state, dispatch] = useStateValue();
    const [authCode, setAuthCode] = useState('')
    const [userToken, setUserToken] = useState('')

    const { linkedInLogin } = useLinkedIn({
        clientId: '86max6k56aamsj',
        redirectUri: `${window.location.origin}/linkedin`, // for Next.js, you can use `${typeof window === 'object' && window.location.origin}/linkedin`
        scope: "r_emailaddress r_liteprofile w_member_social",
        onSuccess: async (code) => {
            setAuthCode(code)
            await getUserAccessToken(code)

        },
        onError: (error) => {
            console.log("HE")
            console.log(error);
        },
    });

    async function getUserAccessToken(code) {
        const link = `https://us-central1-crewmate-prod.cloudfunctions.net/linkedinAccessToken?code=${code}?state=foobar`
        const link_temp = `https://cors-anywhere.herokuapp.com/https://www.linkedin.com/oauth/v2/accessToken?code=${code}&grant_type=authorization_code&client_id=86max6k56aamsj&client_secret=G9GEuYRJGt09eE0j&redirect_uri=${window.location.origin}/linkedin`
        console.log(link_temp)
        axios.post(link_temp, { Origin: 'linkedin.com' }).then(async (res) => {
            console.log(res)
            const token = res.data.access_token
            setUserToken(token)
            await getUserData(token)

        }).catch((err) => {
            console.log(err)
        })
        // const functions = getFunctions();
        // const callableReturnMessage = httpsCallable(functions, 'linkedinAccessToken');
        // callableReturnMessage({ code }).then((res) => {
        //     console.log(res)
        // }).catch((err) => {
        //     console.log(err)
        // })
    }

    async function getUserData(token) {
        console.log(token)
        const link = `https://cors-anywhere.herokuapp.com/https://api.linkedin.com/v2/me`
        const contact_link = `https://cors-anywhere.herokuapp.com/https://api.linkedin.com/v2/clientAwareMemberHandles?q=members&projection=(elements*(primary,type,handle~))`
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

        await axios.get(contact_link, { headers: { Authorization: `Bearer ${token}` } }).then((result) => {
            const data = result.data
            email = data.elements[0]['handle~'].emailAddress
            console.log(email)
        }).catch((error) => {
            console.log("HERE")
            console.log(error)
        })
        console.log("EMAIL: " + email)
        const document = doc(db, "users", email)
        const userRef = await getDoc(document)
        let user
        if (!userRef.exists()) {
            await createUserWithEmailAndPassword(auth, email, "password3894843974j").then((cred) => {
                console.log(user)
                user = cred.user
                console.log(email)
                user.photoURL = pfp
                user.displayName = firstName + " " + lastName
                console.log(user)
            })
            await setDoc(doc(db, "users", email), {
                email: email
            })
            dispatch({
                type: actionTypes.SET_USER,
                user: user,
            });
        }
        else {
            console.log("RAJ MF")

        }

    }


    return (
        <div className="login">
            <div className="login_container">
                <img
                    src={require('../assets/crewmate-logo.png')}
                    alt="crewmate-emblem"
                />
                <h1>Sign in to Crewmate</h1>
                <p>crewmate.com</p>
                {/* <Button variant="outlined" color="primary" onClick={async () => await signIn()}>
                    Sign In with Google
                </Button> */}
                <img
                    onClick={linkedInLogin}
                    src={linkedin}
                    alt="Log in with LinkedIn"
                    style={{ maxWidth: "180px", cursor: "pointer" }}
                />

                {/* {!authCode && <div>No code</div>}
                {authCode && (
                    <div>
                        <div>Authorization Code: {authCode}</div>
                    </div>
                )} */}

            </div>
        </div>

    );
}



export default Login;