import React, { useEffect, useState } from "react";
import db, { auth } from '../firebase/firebase';
import JobCard from "../components/common/JobCard";
import SearchBar from "../components/common/SearchBar";
import { collection, addDoc, setDoc, doc, getDoc, updateDoc, getDocs } from "firebase/firestore";
import Modal from "../components/home/Modal";
import usePremiumStatus from "../stripe/usePremiumStatus";
import { useLocation } from "react-router-dom";
import '../styles/SearchBar.css'



function Home() {
    const { state } = useLocation();
    const [jobRecs, setJobRecs] = useState(state ? state.jobRecs : [])
    const [experienceRecs, setExperienceRecs] = useState([])
    const [profileRec, setProfileRec] = useState([])
    const [isSearching, setIsSearching] = useState(false)
    const [openModal, setOpenModal] = useState(false)
    const [experience, setExperience] = useState('')
    const userIsPremium = usePremiumStatus(auth.currentUser)
    const [location, setLocation] = useState('')

    useEffect(() => {
        async function getData() {

            let checkModal = true
            let email

            if (!auth.currentUser) {
                email = "rajthaker13@yahoo.com"
            }
            else {
                email = auth.currentUser.email
            }
            const usersRef = doc(db, "users", email)
            const usersSnap = await getDoc(usersRef)

            if (usersSnap.exists()) {
                const data = usersSnap.data()['data']
                if (data != null) {
                    checkModal = false
                    setExperience(JSON.stringify(usersSnap.data()['data'].member_experience_collection))
                    setLocation(usersSnap.data()['data'].country)

                }
            }
            setOpenModal(checkModal)

        }
        getData()


    }, [])

    function chunkArray(arr, chunkSize) {
        const chunkedArray = [];
        for (let i = 0; i < arr.length; i += chunkSize) {
            chunkedArray.push(arr.slice(i, i + chunkSize));
        }
        return chunkedArray;
    }

    return (
        <div style={{ height: '88vh' }}>
            {isSearching && <Modal setOpenModal={setOpenModal} isSearchingModal={true} />}
            {openModal && <Modal setOpenModal={setOpenModal} />}
            <div className="search-bar-container ">
                <h2 className="search-bar-container-header">Search: Job opportunities, internships and more</h2>
                <SearchBar setJobRecs={setJobRecs} setIsSearching={setIsSearching} isSearching={isSearching} setProfileRec={setProfileRec} experience={experience} setExperienceRecs={setExperienceRecs} location={location} />
                <div className="search-bar-container-enter-text">
                    <h5>Press Enter <span className="">to search</span></h5>
                </div>

            </div>

            <div style={{ marginTop: '5vh' }}>
                {jobRecs && chunkArray(jobRecs, 5).map((row, rowIndex) => {
                    return (
                        <div key={rowIndex} style={{ display: 'flex', marginBottom: '1rem' }}>
                            {row.map((job, index) => (
                                <JobCard key={index} job={job} index={index} xs={80} isSearching={isSearching} jobRecs={jobRecs} />
                            ))}
                        </div>
                    )

                })}
            </div>
        </div >

    );
}

export default Home;
