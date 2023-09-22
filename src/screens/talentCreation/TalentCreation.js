import React, { useEffect } from "react";
import "./TalentCreation.css"
import axios from 'axios'


function TalentCreation() {

    useEffect(() => {
        async function getDudaLink() {
            const link = `https://vast-waters-56699-3595bd537b3a.herokuapp.com/https://us-central1-crewmate-prod.cloudfunctions.net/getDudaURL`
            await axios.post(link, { email: 'rajthaker13@yahoo.com', isNewAccount: false }, { headers: { 'Content-Type': 'application/json' } }).then((res) => {
                window.location.href = res.data;
            })

        }

        async function getMergeData() {
            const link = `https://vast-waters-56699-3595bd537b3a.herokuapp.com/https://us-central1-crewmate-prod.cloudfunctions.net/getMergeJobs`
            await axios.get(link).then((res) => {
                console.log(res.data)
            })
        }

        // getDudaLink()
        getMergeData()


    }, [])

    return (
        <div>

        </div>
    )
}


export default TalentCreation