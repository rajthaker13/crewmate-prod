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
import { LinkedInLogo } from "../components/common/LinkedInLogo";
import sample from '../data/sample.json'
import JobCard from "../components/common/JobCard";
import Ticker from 'react-ticker'



function Login() {
    const [state, dispatch] = useStateValue();
    const [authCode, setAuthCode] = useState('')
    const [userToken, setUserToken] = useState('')
    const [sampleJobs, setSampleJobs] = useState(sample)
    const [tickerPosition, setTickerPosition] = useState(0);

    const { linkedInLogin } = useLinkedIn({
        clientId: `${process.env.REACT_APP_LINKEDIN_CLIENT_ID}`,
        redirectUri: `${window.location.origin}/linkedin`,
        scope: "r_emailaddress r_liteprofile",
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
        let pfp = ""

        await axios.get(link, { headers: { Authorization: `Bearer ${token}` } }).then((res) => {
            id = res.data.id
            firstName = res.data.localizedFirstName
            lastName = res.data.localizedLastName

        }).catch((err) => {
            console.log(err)
        })

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
            const email = userRef.data()['email']
            signInWithEmailAndPassword(auth, email, "password3894843974j").then((user) => {
                dispatch({
                    type: actionTypes.SET_USER,
                    user: user,
                });
            })
        }

    }
    useEffect(() => {
        const tickerInterval = setInterval(() => {
            setTickerPosition((prevPosition) => (prevPosition + 1) % sampleJobs.length);
        }, 8000); // Adjust the interval for slower movement

        return () => {
            clearInterval(tickerInterval);
        };
    }, [sampleJobs.length]);


    return (
        <div className="login">
            <div className="login-slide-1 ">
                <div className="login-text-container">
                    <h1 className="login-big-text">Search & Upskill</h1>
                    <h1 className="login-medium-text">for millions of active jobs</h1>
                    <h1 className="login-small-text">Join our innovative and dynamic IT team based in the heart of Palo Alto. We are a leading technology company. Our mission is to secure and optimize network infrastructure, ensuring seamless connectivity and protecting our clients' valuable data.</h1>
                    <button className="signIn-button" onClick={linkedInLogin}>
                        <LinkedInLogo />
                        <h5 className="signIn-button-text">Sign Up with LinkedIn</h5>
                    </button>
                </div>

                <div className="login-slide-1-pic-cont">
                    <img className="ss1" src={require('../assets/ss1.png')}></img>
                </div>
            </div>
            <div className="job_card_slide_container">
                <div className="ticker-track">

                    {sampleJobs.map((job, index) => {
                        return (
                            <JobCard key={index} job={job} index={index} xs={80} isSearching={false} jobRecs={[]} />

                        )
                    })}
                    {sampleJobs.map((job, index) => {
                        return (
                            <JobCard key={index + sampleJobs.length} job={job} index={index} xs={80} isSearching={false} jobRecs={[]} />

                        )
                    })}
                </div>

            </div>

            <div className="login-slide-1 ">
                <div className="login-slide-2-pic-cont">
                    <img className="ss1" src={require('../assets/search.png')}></img>
                </div>
                <div className="login-text-container">
                    <h1 className="login-big-text-2">AI-powered Job Search</h1>
                    <h1 className="login-small-text-2">Find millions of active jobs that fit your experience and interests using generative search prompting.</h1>
                    <button className="other_button" disabled={true}>
                        <h5 className="signIn-button-text">Sign Up with LinkedIn</h5>
                    </button>
                </div>
            </div>

            <div className="login-slide-1 ">
                <div className="login-text-container">
                    <h1 className="login-big-text-2">AI-powered Job Search</h1>
                    <h1 className="login-small-text-2">Find millions of active jobs that fit your experience and interests using generative search prompting.</h1>
                    <button className="signIn-button" onClick={linkedInLogin}>
                        <LinkedInLogo />
                        <h5 className="signIn-button-text">Sign Up with LinkedIn</h5>
                    </button>
                </div>
                <div className="login-slide-2-pic-cont">
                    <img className="ss1" src={require('../assets/search.png')}></img>
                </div>
            </div>
            <div className="login-slide-1 ">
                <div className="login-slide-2-pic-cont">
                    <img className="ss1" src={require('../assets/search.png')}></img>
                </div>
                <div className="login-text-container">
                    <h1 className="login-big-text-2">AI-powered Job Search</h1>
                    <h1 className="login-small-text-2">Find millions of active jobs that fit your experience and interests using generative search prompting.</h1>
                    <button className="other_button" disabled={true}>
                        <h5 className="signIn-button-text">Sign Up with LinkedIn</h5>
                    </button>
                </div>
            </div>

        </div>

    );
}



export default Login;