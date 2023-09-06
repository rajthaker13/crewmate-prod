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
        if (!isLoggingIn || !isLoggingInTC) {
            const tickerInterval = setInterval(() => {
                setTickerPosition((prevPosition) => (prevPosition + 1) % sampleJobs.length);
            }, 8000); // Adjust the interval for slower movement

            return () => {
                clearInterval(tickerInterval);
            };

        }
    }, [sampleJobs.length, isLoggingIn, isLoggingInTC]);


    return (
        <div>
            {!isMobile && <div className="login">
                {isLoggingInTC && <LoginModal setOpenModal={isLoggingInTC} isSearchingModal={true} isMobile={isMobile} />}
                <div className="login-slide-1">
                    <div className="login-text-container">
                        <h1 className="login-big-text">Search & Upskill</h1>
                        <h1 className="login-medium-text">for millions of active jobs</h1>
                        <h1 className="login-small-text">Join our innovative and dynamic career planning platform. Our mission is to help applicants find their passions and get in touch with recruiters using the power of AI.</h1>
                        <button className="signIn-button" onClick={talentCommunityLogin}>
                            <h5 className="signIn-button-text">Click Here For TC Demo</h5>
                        </button>
                    </div>

                    <div className="login-slide-1-pic-cont">
                        <img className="ss1" src={require('../assets/upskill.png')}></img>
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
                    </div>
                </div>

                <div className="login-slide-1 ">
                    <div className="new-text-container-new">
                        <h1 className="login-big-text-2">Explore & Upskill for the job you love</h1>
                        <h1 className="login-small-text-2">Explore the path to receive a job through curated certificates and online resources based on positions you’re interested in.</h1>
                    </div>
                    <div className="login-slide-2-pic-cont">
                        <img className="ss1" src={require('../assets/upskill.png')}></img>
                    </div>
                </div>
                <div className="login-slide-1 ">
                    <div className="login-slide-2-pic-cont">
                        <img className="ss1" src={require('../assets/crew.png')}></img>
                    </div>
                    <div className="login-text-container">
                        <h1 className="login-big-text-2">Meet your Crew & Companies</h1>
                        <h1 className="login-small-text-2">Join talent communities for your favorite companies to meet other applicants while getting access to hiring events, recruiters, and more!</h1>
                    </div>
                </div>
                <div className="footer-container">
                    <div className="footer-content-container">
                        <img src={require('../assets/group3Gang.png')} className="footer-img" />
                        <h5 className="footer-text">Crewmate, 2023</h5>
                    </div>
                </div>
            </div>}
            {isMobile &&
                <div className="login-mobile">
                    <div className="login-slide-1-mobile">
                        <div>
                            <h1 className="login-big-text-mobile">Search & Upskill</h1>
                            <h1 className="login-medium-text-mobile">for millions of active jobs</h1>
                            <div className="login-slide-1-pic-cont-mobile">
                                <img className="ss1" src={require('../assets/upskill.png')}></img>
                            </div>
                            <h1 className="login-small-text-mobile">Join our innovative and dynamic career planning platform. Our mission is to help applicants find their passions and get in touch with recruiters using the power of AI.</h1>
                            <button className="signIn-button-mobile" onClick={login}>
                                <LinkedInLogo />
                                <h5 className="signIn-button-text-mobile">Sign Up with LinkedIn</h5>
                            </button>
                        </div>
                        <div className="job_card_slide_container-mobile">
                            <div className="ticker-track-mobile">
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
                        <div className="login-slide-1-mobile">
                            <h1 className="login-big-text-2-mobile">AI-powered Job Search</h1>
                            <div className="login-slide-2-pic-cont-mobile">
                                <img className="ss1" src={require('../assets/search.png')}></img>
                            </div>
                            <h1 className="login-small-text-2-mobile">Find millions of active jobs that fit your experience and interests using generative search prompting.</h1>
                        </div>
                        <div className="login-slide-1-mobile">
                            <h1 className="login-big-text-2-mobile">Explore & Upskill for the job you love</h1>
                            <div className="login-slide-2-pic-cont-mobile">
                                <img className="ss1" src={require('../assets/upskill.png')}></img>
                            </div>
                            <h1 className="login-small-text-2-mobile">Explore the path to receive a job through curated certificates and online resources based on positions you’re interested in.</h1>
                        </div>
                        <div className="footer-container">
                            <div className="footer-content-container">
                                <img src={require('../assets/group3Gang.png')} className="footer-img-mobile" />
                                <h5 className="footer-text">Crewmate, 2023</h5>
                            </div>
                        </div>


                    </div>


                </div>

            }

        </div>



    );
}



export default Login;