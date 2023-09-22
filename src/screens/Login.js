import React, { useEffect, useState } from "react";
import '../styles/Login.css'
import db, { auth } from '../firebase/firebase';
import { useStateValue } from "../components/utility/StateProvider";
import { actionTypes } from '../components/utility/reducer';
import { createUserWithEmailAndPassword } from "firebase/auth";
import axios from 'axios';
import { useLinkedIn } from 'react-linkedin-login-oauth2';
import { doc, setDoc, getDoc } from "firebase/firestore";
import { signInWithEmailAndPassword } from "firebase/auth";
import { LinkedInLogo } from "../components/common/LinkedInLogo";
import sample from '../data/sample.json'
import JobCard from "../components/common/JobCard";
import { useNavigate } from 'react-router-dom';
import LoginModal from "../components/login/LoginModal/LoginModal";
import FadeIn from 'react-fade-in';
import Graph from '../assets/Graph.svg'
import User from '../assets/User.svg'
import Dollar from '../assets/Dollar.svg'



function Login(props) {
    const [state, dispatch] = useStateValue();
    const [authCode, setAuthCode] = useState('')
    const [userToken, setUserToken] = useState('')
    const [sampleJobs, setSampleJobs] = useState(sample)
    const [tickerPosition, setTickerPosition] = useState(0);
    const [isMobile, setIsMobile] = useState(props.mobile)
    const [isLoggingIn, setIsLoggingIn] = useState(false)
    const [isLoggingInTC, setIsLoggingInTc] = useState(false)
    const navigation = useNavigate();

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

    async function login() {
        setIsLoggingIn(true)
        linkedInLogin()
    }

    async function talentCommunityLogin() {
        setIsLoggingInTc(true)
    }

    async function talentCreation() {
        signInWithEmailAndPassword(auth, 'es63i@elisejoanllc.com', "123456").then((user) => {
            dispatch({
                type: actionTypes.SET_USER,
                user: user,
            });
        })

    }

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
        // if (!isLoggingIn || !isLoggingInTC) {
        //     const tickerInterval = setInterval(() => {
        //         setTickerPosition((prevPosition) => (prevPosition + 1) % sampleJobs.length);
        //     }, 8000); // Adjust the interval for slower movement

        //     return () => {
        //         clearInterval(tickerInterval);
        //     };

        // }
    }, [sampleJobs.length, isLoggingIn, isLoggingInTC]);


    return (
        <div>
            {!isMobile && <div className="login">
                {isLoggingInTC && <LoginModal setOpenModal={isLoggingInTC} isSearchingModal={true} isMobile={isMobile} />}
                <div className="landing-page-1">
                    <FadeIn delay={200}>
                        <div>
                            <h1 className="landing-page-big-text">Careers Pages are Boring</h1>

                        </div>
                    </FadeIn>
                    <FadeIn delay={1000}>
                        <h1 className="landing-page-big-text-faded">Launch a Talent Community</h1>
                    </FadeIn>
                    <FadeIn delay={2000}>
                        <div style={{ marginTop: '2%' }} key='2'>
                            <h3 className="landing-page-medium-text">Upgrade your careers page with an embedded talent community</h3>
                            <h3 className="landing-page-medium-text">that enables you to engage, retain, and monetize your applicant pool.</h3>
                        </div>
                    </FadeIn>
                    <FadeIn delay={2000}>
                        <div className="landing-page-button-row">
                            <button className="landing-page-button-grey" onClick={talentCreation}>
                                <h3 className="landing-page-button-text">Get Started</h3>
                            </button>
                            <button className="landing-page-button-black" onClick={() => {
                                window.open("https://calendly.com/blakefaulkner/meeting", "_blank")
                            }}>
                                <h3 className="landing-page-button-text">Book a Demo</h3>
                            </button>
                        </div>
                    </FadeIn>
                    <FadeIn delay={2000}>
                        <img className="ss1" src={require('../assets/nikeTC.jpg')}></img>
                    </FadeIn>
                </div>
                <div className="landing-slide-1">
                    <h2 className="landing-slide-1-header">More features to power-up your talent brand</h2>
                    <div className="landing-slide-1-card-container ">
                        <div className="landing-slide-1-card">
                            <div className="landing-slide-1-card-header-container">
                                <img className="landing-slide-1-card-img " src={Graph}></img>
                                <h3 className="landing-slide-1-card-header">Engage</h3>
                            </div>
                            <h3 className="landing-slide-1-card-text">Applicants interact with your content & learn more about your talent brand. Crewmate offers AI-powered talent communities with generative job searching and a virtual recruiter curated to your company's website.</h3>
                        </div>
                        <div className="landing-slide-1-card">
                            <div className="landing-slide-1-card-header-container">
                                <img className="landing-slide-1-card-img " src={User}></img>
                                <h3 className="landing-slide-1-card-header">Retain</h3>
                            </div>
                            <h3 className="landing-slide-1-card-text">See real-time occupations and social accounts of members in your talent community and how they fit for open positions at your brand.</h3>
                        </div>
                        <div className="landing-slide-1-card">
                            <div className="landing-slide-1-card-header-container">
                                <img className="landing-slide-1-card-img " src={Dollar}></img>
                                <h3 className="landing-slide-1-card-header">Monetize</h3>
                            </div>
                            <h3 className="landing-slide-1-card-text">Unleash the purchasing power of your applicant pool through trackable talent community offers on top products and services.</h3>
                        </div>
                    </div>

                </div>
                <div className="footer-container">
                    <div className="footer-content-container">
                        <img src={require('../assets/group3Gang.png')} className="footer-img" />
                        <h5 className="footer-text">Crewmate, 2023</h5>
                    </div>
                </div>
            </div>}
            {
                isMobile &&
                <div className="login-mobile">
                    {isLoggingInTC && <LoginModal setOpenModal={isLoggingInTC} isSearchingModal={true} isMobile={isMobile} />}
                    <div className="landing-page-1" style={{ minHeight: '50vh' }}>
                        <FadeIn delay={200}>
                            <div>
                                <h1 className="landing-page-big-text" style={{ fontSize: '30px', lineHeight: '50px' }}>Careers Pages are Boring</h1>
                            </div>
                        </FadeIn>
                        <FadeIn delay={1000}>
                            <h1 className="landing-page-big-text-faded" style={{ fontSize: '30px', lineHeight: '50px' }}>Launch a Talent Community</h1>
                        </FadeIn>
                        <FadeIn delay={2000}>
                            <div style={{ marginTop: '2%' }} key='2'>
                                <h3 className="landing-page-medium-text" style={{ fontSize: '20px', height: 'auto', marginBottom: '5vh', lineHeight: '20px' }}>Upgrade your careers page with an embedded talent community that enables you to engage, retain, and monetize your applicant pool.</h3>
                            </div>
                        </FadeIn>
                        <FadeIn delay={2000}>

                            <div className="landing-pae-button-row">
                                <button className="landing-page-button-grey" onClick={() => {
                                    window.open("https://calendly.com/blakefaulkner/meeting", "_blank")
                                }} style={{ width: '50vw', marginBottom: '5vh' }}>
                                    <h3 className="landing-page-button-text">Book a demo</h3>
                                </button>
                            </div>
                        </FadeIn>
                        <FadeIn delay={2000}>
                            <img className="ss1" src={require('../assets/nikeTC.jpg')} style={{ width: '90vw' }}></img>
                        </FadeIn>
                    </div>
                    <div className="landing-slide-1" style={{ justifyContent: 'center', alignItems: 'center' }}>
                        <h2 className="landing-slide-1-header" style={{ fontSize: '18px', textAlign: 'center', marginLeft: '0px', }}>More features to power-up your talent brand</h2>
                        <div className="landing-slide-1-card-container" style={{ flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                            <div className="landing-slide-1-card-mobile">
                                <div className="landing-slide-1-card-header-container">
                                    <img className="landing-slide-1-card-img " src={Graph}></img>
                                    <h3 className="landing-slide-1-card-header">Engage</h3>
                                </div>
                                <h3 className="landing-slide-1-card-text">Applicants interact with your content & learn more about your talent brand. Crewmate offers AI-powered talent communities with generative job searching and a virtual recruiter curated to your company's website.</h3>
                            </div>
                            <div className="landing-slide-1-card-mobile">
                                <div className="landing-slide-1-card-header-container">
                                    <img className="landing-slide-1-card-img " src={User}></img>
                                    <h3 className="landing-slide-1-card-header">Retain</h3>
                                </div>
                                <h3 className="landing-slide-1-card-text">See real-time occupations and social accounts of members in your talent community and how they fit for open positions at your brand.</h3>
                            </div>
                            <div className="landing-slide-1-card-mobile">
                                <div className="landing-slide-1-card-header-container">
                                    <img className="landing-slide-1-card-img " src={Dollar}></img>
                                    <h3 className="landing-slide-1-card-header">Monetize</h3>
                                </div>
                                <h3 className="landing-slide-1-card-text">Unleash the purchasing power of your applicant pool through trackable talent community offers on top products and services.</h3>
                            </div>
                        </div>

                    </div>
                    <div className="footer-container">
                        <div className="footer-content-container">
                            <img src={require('../assets/group3Gang.png')} className="footer-img" />
                            <h5 className="footer-text">Crewmate, 2023</h5>
                        </div>
                    </div>
                </div>

            }

        </div >



    );
}



export default Login;


{/* <div className="login-slide-1">
                    <div className="login-text-container">
                        <h1 className="login-big-text">Search & Upskill</h1>
                        <h1 className="login-medium-text">for millions of active jobs</h1>
                        <h1 className="login-small-text">Join our innovative and dynamic career planning platform. Our mission is to help applicants find their passions and get in touch with recruiters using the power of AI.</h1>
                        <button className="signIn-button" onClick={talentCreation}>
                            <h5 className="signIn-button-text">Click Here For TC Demo</h5>
                        </button>
                    </div>

                    <div className="login-slide-1-pic-cont">
                        <img className="ss1" src={require('../assets/upskill.png')}></img>
                    </div>
                </div> */}
{/* <div className="job_card_slide_container">
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

                </div> */}