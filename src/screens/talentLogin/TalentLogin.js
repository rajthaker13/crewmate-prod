import React, { useEffect, useCallback } from "react";
import { useMergeLink } from "@mergeapi/react-merge-link";
import { useLocation } from "react-router-dom";
import { auth } from '../../firebase/firebase';
import axios from "axios"


function TalentLogin() {
    const { state } = useLocation();

    useEffect(() => {
        console.log(auth.currentUser)

    }, [])

    const onSuccess = useCallback((public_token) => {
        // Send public_token to server (Step 3)
        const url = 'https://vast-waters-56699-3595bd537b3a.herokuapp.com/https://us-central1-crewmate-prod.cloudfunctions.net/getMergeAccount'
        axios.get(url, { token: public_token }, { headers: { 'Content-Type': 'application/json' } }).then((res) => {
            console.log(res)

        })
    }, []);

    const { open, isReady } = useMergeLink({
        linkToken: state.token, // Replace ADD_GENERATED_LINK_TOKEN with the token retrieved from your backend (Step 1)
        onSuccess,
        // tenantConfig: {
        // apiBaseURL: "https://api-eu.merge.dev" /* OR your specified single tenant API base URL */
        // },
    });

    return (
        <button disabled={!isReady} onClick={open}>
            Preview linking experience
        </button>
    )


}

export default TalentLogin