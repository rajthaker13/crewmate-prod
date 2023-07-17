import React, { useEffect, useState } from "react";
import '../../styles/Bucket.css'
import JobCard from "../common/JobCard";
import ProfileCard from "../common/ProfileCard";




function Bucket({ jobRecs, isFirstBucket = false, profileRec = {}, isSearching }) {

    return (
        <div style={{ backgroundColor: isFirstBucket ? '#1fd1f9' : '#2a2a72', height: '69vh', width: '30vw', marginRight: isFirstBucket ? '8vw' : '0vw', backgroundImage: isFirstBucket ? 'linear-gradient(315deg, #1fd1f9 0%, #b621fe 74%)' : 'linear-gradient(315deg, #2a2a72 0%, #009ffd 74%)', borderRadius: '20px', overflow: 'auto', justifyContent: 'center' }}>
            {isFirstBucket ?
                <div>
                    <h2 className="bucket_title">Jobs For You</h2>
                    <div className="container">
                        <div style={{ height: '3vh' }} />
                        {jobRecs && jobRecs.map((job, index) => {
                            return (
                                <JobCard job={job} index={index} xs={80} isSearching={isSearching} />

                            )
                        })}
                        <div style={{ height: '3vh' }} />
                    </div>
                </div>
                :
                <div>
                    <h2 className="bucket_title">Crewmate For You</h2>
                    <div className="container">
                        <div style={{ height: '3vh' }} />
                        {!isSearching && <ProfileCard profileRec={profileRec} />}
                    </div>
                </div>
            }
        </div>
    )
}


export default Bucket